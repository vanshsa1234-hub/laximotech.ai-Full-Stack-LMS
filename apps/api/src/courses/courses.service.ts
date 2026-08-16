import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RagService } from '../ai/rag/rag.service';
import { AiService } from '../ai/ai.service';
import { ContentType, CourseCategory, CourseLevel, Prisma } from '@prisma/client';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(private prisma: PrismaService, private rag: RagService, private ai: AiService) {}

  private courseSelect = {
    id: true, slug: true, title: true, shortDesc: true, description: true,
    thumbnailUrl: true, previewVideo: true, price: true, level: true,
    category: true, language: true, durationHrs: true, totalLessons: true,
    isPublished: true, isFeatured: true, metaTitle: true, metaDesc: true, createdAt: true,
    instructor: { select: { id: true, name: true, image: true, bio: true } },
    tags: { select: { tag: { select: { id: true, name: true } } } },
    _count: { select: { enrollments: true, reviews: true } },
  };

  async findAll(query: {
    q?: string; category?: string; level?: string;
    page?: string; pageSize?: string; sort?: string; featured?: string;
  }) {
    const page     = Math.max(1, parseInt(query.page ?? '1'));
    const pageSize = Math.min(50, parseInt(query.pageSize ?? '12'));
    const skip     = (page - 1) * pageSize;

    const where: Prisma.CourseWhereInput = {
      isPublished: true,
      ...(query.q        && { OR: [{ title: { contains: query.q, mode: 'insensitive' } }, { description: { contains: query.q, mode: 'insensitive' } }] }),
      ...(query.category && query.category !== 'all' && { category: query.category as CourseCategory }),
      ...(query.level    && query.level !== 'All'    && { level:    query.level    as CourseLevel }),
      ...(query.featured === 'true' && { isFeatured: true }),
    };

    const orderBy: Prisma.CourseOrderByWithRelationInput =
      query.sort === 'newest'  ? { createdAt: 'desc' } :
      query.sort === 'price'   ? { price: 'asc' }      :
      query.sort === 'duration'? { durationHrs: 'desc' }: { enrollments: { _count: 'desc' } };

    const [courses, total] = await this.prisma.$transaction([
      this.prisma.course.findMany({ where, select: this.courseSelect, orderBy, skip, take: pageSize }),
      this.prisma.course.count({ where }),
    ]);

    // Attach real average rating — null (not a fabricated number) when a course has zero reviews.
    const withRatings = await Promise.all(
      courses.map(async (c) => {
        const avg = await this.prisma.review.aggregate({ where: { courseId: c.id }, _avg: { rating: true } });
        return { ...c, avgRating: avg._avg.rating };
      }),
    );

    return { data: withRatings, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  // Admin: list ALL courses including drafts
  async findAllForAdmin(query: { q?: string }) {
    const where: Prisma.CourseWhereInput = {
      ...(query.q && { OR: [{ title: { contains: query.q, mode: 'insensitive' } }] }),
    };
    const courses = await this.prisma.course.findMany({
      where, select: this.courseSelect, orderBy: { createdAt: 'desc' },
    });
    return { data: courses, total: courses.length };
  }

  async findBySlug(slug: string) {
    const course = await this.prisma.course.findUnique({
      where:  { slug, isPublished: true },
      select: {
        ...this.courseSelect,
        sections: {
          orderBy: { order: 'asc' },
          select: {
            id: true, title: true, order: true,
            lessons: {
              orderBy: { order: 'asc' },
              select: {
                id: true, title: true, order: true, contentType: true,
                videoDurationSec: true, isPreview: true, estimatedMinutes: true,
                quiz: { select: { id: true } },
              },
            },
          },
        },
        reviews: {
          orderBy: { createdAt: 'desc' }, take: 6,
          select: { rating: true, comment: true, createdAt: true, userId: true,
            user: { select: { name: true, image: true } } },
        },
      },
    });

    if (!course) throw new NotFoundException(`Course "${slug}" not found.`);

    const avg = await this.prisma.review.aggregate({ where: { courseId: course.id }, _avg: { rating: true } });
    return { ...course, avgRating: avg._avg.rating };
  }

  async findById(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id }, select: this.courseSelect });
    if (!course) throw new NotFoundException('Course not found.');
    return course;
  }

  async getBuilder(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true, slug: true, title: true, isPublished: true, thumbnailUrl: true,
        instructorId: true,
        instructor: { select: { id: true, name: true, email: true, image: true, bio: true } },
        sections: {
          orderBy: { order: 'asc' },
          select: {
            id: true, title: true, order: true,
            lessons: {
              orderBy: { order: 'asc' },
              select: {
                id: true, title: true, order: true, contentType: true,
                videoUrl: true, pdfUrl: true, textContent: true,
                subtitleHiUrl: true, subtitleEnUrl: true,
                starterCode: true, isPreview: true, isMandatory: true, isAiGenerated: true,
                estimatedMinutes: true, videoDurationSec: true, vizType: true,
                documents: {
                  orderBy: { order: 'asc' },
                  select: { id: true, title: true, fileUrl: true, fileType: true, order: true },
                },
                quiz: {
                  select: {
                    id: true, title: true, passingScore: true, isFinalExam: true,
                    questions: {
                      orderBy: { order: 'asc' },
                      select: {
                        id: true, question: true, options: true,
                        correctIndex: true, explanation: true, order: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!course) throw new NotFoundException('Course not found.');
    return course;
  }

  async createSection(courseId: string, data: { title: string; order?: number }) {
    await this.findById(courseId);
    const order = data.order ?? (await this.prisma.section.count({ where: { courseId } })) + 1;
    return this.prisma.section.create({
      data: { courseId, title: data.title, order },
    });
  }

  async updateSection(sectionId: string, data: Partial<{ title: string; order: number }>) {
    return this.prisma.section.update({
      where: { id: sectionId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.order !== undefined && { order: Number(data.order) }),
      },
    });
  }

  async createLesson(sectionId: string, data: any) {
    const section = await this.prisma.section.findUnique({ where: { id: sectionId }, select: { courseId: true } });
    if (!section) throw new NotFoundException('Section not found.');
    const order = data.order ?? (await this.prisma.lesson.count({ where: { sectionId } })) + 1;
    const lesson = await this.prisma.lesson.create({
      data: this.lessonPayload({ ...data, sectionId, order }),
      include: { quiz: { include: { questions: { orderBy: { order: 'asc' } } } } },
    });
    await this.recalcTotalLessons(section.courseId);
    // Fire-and-forget: chunk + embed the notes for the Study Buddy RAG index.
    // Not awaited so lesson creation in the admin UI stays fast.
    this.rag.ingestLessonNotes(lesson.id, section.courseId, lesson.textContent)
      .catch(err => this.logger.error(`RAG ingestion failed for new lesson ${lesson.id}:`, err));
    // Fire-and-forget: keep this section's AI quiz current with the new content.
    // Skipped for the quiz lesson itself so saving quiz metadata can't recurse.
    if (lesson.contentType !== ContentType.QUIZ) {
      this.generateSectionQuiz(sectionId, { auto: true })
        .catch(err => this.logger.error(`Auto quiz generation failed for section ${sectionId}:`, err));
    }
    return lesson;
  }

  async updateLesson(lessonId: string, data: any) {
    const lesson = await this.prisma.lesson.update({
      where: { id: lessonId },
      data: this.lessonPayload(data, true),
      include: { quiz: { include: { questions: { orderBy: { order: 'asc' } } } } },
    });
    if (data.textContent !== undefined) {
      const section = await this.prisma.section.findUnique({ where: { id: lesson.sectionId }, select: { courseId: true } });
      if (section) {
        this.rag.ingestLessonNotes(lessonId, section.courseId, lesson.textContent)
          .catch(err => this.logger.error(`RAG ingestion failed for lesson ${lessonId}:`, err));
      }
    }
    // Fire-and-forget: content changed, so this section's AI quiz may be stale.
    // Skipped for the AI quiz lesson itself to avoid regenerating on its own save.
    if (!lesson.isAiGenerated) {
      this.generateSectionQuiz(lesson.sectionId, { auto: true })
        .catch(err => this.logger.error(`Auto quiz generation failed for section ${lesson.sectionId}:`, err));
    }
    return lesson;
  }

  // Generate (or regenerate) the cumulative AI quiz for a section — covers
  // everything from section order 1 up to and including this section, using
  // whatever's been ingested into the RAG index so far.
  // auto=true (fire-and-forget triggers): failures are logged, not thrown,
  // so a lesson save never breaks because quiz generation had a hiccup.
  // auto=false (explicit admin "Regenerate" click): failures are thrown so
  // the admin sees the error instead of silently getting nothing.
  async generateSectionQuiz(sectionId: string, opts: { auto?: boolean } = {}) {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      select: { id: true, title: true, order: true, courseId: true, course: { select: { title: true } } },
    });
    if (!section) throw new NotFoundException('Section not found.');

    const material = await this.rag.getContentUpToSection(section.courseId, section.order);
    if (material.length === 0) {
      this.logger.warn(`Skipped quiz generation for section ${sectionId} — no ingested content yet.`);
      return null;
    }

    const materialText = material
      .map(m => `### ${m.sectionTitle} — ${m.lessonTitle}\n${m.content}`)
      .join('\n\n');

    // First section reads as an intro/fundamentals check; later sections are
    // named after their own topic, matching how students expect a "Foundation
    // Quiz" followed by topic-specific quizzes as they progress.
    const quizTitle = section.order === 1 ? 'Foundation Quiz' : `${section.title} Quiz`;

    let questions;
    try {
      questions = await this.ai.generateQuizQuestions(quizTitle, section.course.title, materialText, 10);
    } catch (err) {
      this.logger.error(`AI quiz generation failed for section ${sectionId}:`, err as Error);
      if (!opts.auto) throw err;
      return null;
    }
    if (questions.length === 0) return null;

    // Reuse the existing AI-generated quiz lesson for this section if one
    // exists, rather than creating a new lesson every regeneration.
    let quizLesson = await this.prisma.lesson.findFirst({
      where: { sectionId, contentType: ContentType.QUIZ, isAiGenerated: true },
    });

    if (!quizLesson) {
      const order = (await this.prisma.lesson.count({ where: { sectionId } })) + 1;
      quizLesson = await this.prisma.lesson.create({
        data: {
          sectionId, title: quizTitle, order, contentType: ContentType.QUIZ,
          isAiGenerated: true, isMandatory: true, estimatedMinutes: 10,
        },
      });
      await this.recalcTotalLessons(section.courseId);
    } else if (quizLesson.title !== quizTitle) {
      quizLesson = await this.prisma.lesson.update({ where: { id: quizLesson.id }, data: { title: quizTitle } });
    }

    const quiz = await this.upsertLessonQuiz(quizLesson.id, {
      title: quizTitle,
      passingScore: 70,
      isFinalExam: false,
      questions: questions.map((q, i) => ({ ...q, order: i + 1 })),
    });

    return { lesson: quizLesson, quiz };
  }

  // Admin: add a document (notes/slides/PDF/etc) to a lesson. Fully optional —
  // a lesson can have zero, one, or many of these independent of its video.
  async addLessonDocument(lessonId: string, data: { title: string; fileUrl: string; fileType: string; order?: number }) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId }, select: { sectionId: true } });
    if (!lesson) throw new NotFoundException('Lesson not found.');
    const order = data.order ?? (await this.prisma.lessonDocument.count({ where: { lessonId } }));
    const doc = await this.prisma.lessonDocument.create({
      data: { lessonId, title: data.title, fileUrl: data.fileUrl, fileType: data.fileType, order },
    });
    // Fire-and-forget: extract text (PDF/DOCX) + chunk + embed for RAG.
    const section = await this.prisma.section.findUnique({ where: { id: lesson.sectionId }, select: { courseId: true } });
    if (section) {
      this.rag.ingestLessonDocument(doc.id, lessonId, section.courseId, data.fileUrl, data.fileType)
        .catch(err => this.logger.error(`RAG ingestion failed for document ${doc.id}:`, err));
    }
    return doc;
  }

  async updateLessonDocument(documentId: string, data: Partial<{ title: string; fileUrl: string; fileType: string; order: number }>) {
    const doc = await this.prisma.lessonDocument.update({ where: { id: documentId }, data });
    // Replaced file → re-ingest with the new content.
    if (data.fileUrl !== undefined || data.fileType !== undefined) {
      const lesson = await this.prisma.lesson.findUnique({ where: { id: doc.lessonId }, select: { sectionId: true } });
      const section = lesson && await this.prisma.section.findUnique({ where: { id: lesson.sectionId }, select: { courseId: true } });
      if (section) {
        this.rag.ingestLessonDocument(doc.id, doc.lessonId, section.courseId, doc.fileUrl, doc.fileType)
          .catch(err => this.logger.error(`RAG re-ingestion failed for document ${doc.id}:`, err));
      }
    }
    return doc;
  }

  async deleteLessonDocument(documentId: string) {
    this.rag.deleteChunksForDocument(documentId).catch(err => this.logger.error(`RAG cleanup failed for document ${documentId}:`, err));
    return this.prisma.lessonDocument.delete({ where: { id: documentId } });
  }

  async upsertLessonQuiz(lessonId: string, data: {
    title: string;
    passingScore?: number;
    isFinalExam?: boolean;
    questions: { question: string; options: string[]; correctIndex: number; explanation?: string; order: number }[];
  }) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException('Lesson not found.');

    const existing = await this.prisma.quiz.findUnique({ where: { lessonId } });
    if (!existing) {
      return this.prisma.quiz.create({
        data: {
          lessonId,
          title: data.title,
          passingScore: Number(data.passingScore ?? 70),
          isFinalExam: Boolean(data.isFinalExam),
          questions: { create: this.quizQuestionPayload(data.questions) },
        },
        include: { questions: { orderBy: { order: 'asc' } } },
      });
    }

    await this.prisma.quizAnswerRecord.deleteMany({
      where: { question: { quizId: existing.id } },
    });
    await this.prisma.quizQuestion.deleteMany({ where: { quizId: existing.id } });

    return this.prisma.quiz.update({
      where: { id: existing.id },
      data: {
        title: data.title,
        passingScore: Number(data.passingScore ?? 70),
        isFinalExam: Boolean(data.isFinalExam),
        questions: { create: this.quizQuestionPayload(data.questions) },
      },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
  }

  // Admin: create course
  async create(data: { slug: string; title: string; description: string; shortDesc: string;
    price: number; level: string; category: string; language: string; thumbnailUrl?: string;
    durationHrs: number; instructorId: string; metaTitle?: string; metaDesc?: string; }) {
    return this.prisma.course.create({ data: data as any, select: this.courseSelect });
  }

  // Admin: update
  async update(id: string, data: Partial<{ title: string; description: string; shortDesc: string;
    price: number; isPublished: boolean; isFeatured: boolean; thumbnailUrl: string; previewVideo: string;
    metaTitle: string; metaDesc: string; instructorId: string; }>) {
    return this.prisma.course.update({ where: { id }, data, select: this.courseSelect });
  }

  // Admin: update totalLessons count after lesson create/delete
  async recalcTotalLessons(courseId: string) {
    const count = await this.prisma.lesson.count({ where: { section: { courseId } } });
    return this.prisma.course.update({ where: { id: courseId }, data: { totalLessons: count } });
  }

  private lessonPayload(data: any, partial = false): any {
    const payload: any = {};
    const set = (key: string, value: any) => {
      if (!partial || value !== undefined) payload[key] = value;
    };

    set('title', data.title);
    set('order', data.order !== undefined ? Number(data.order) : data.order);
    set('sectionId', data.sectionId);
    set('contentType', (data.contentType ?? (partial ? undefined : ContentType.VIDEO)) as ContentType | undefined);
    set('videoUrl', data.videoUrl || null);
    set('videoDurationSec', data.videoDurationSec !== undefined && data.videoDurationSec !== '' ? Number(data.videoDurationSec) : null);
    set('pdfUrl', data.pdfUrl || null);
    set('textContent', data.textContent || null);
    set('subtitleHiUrl', data.subtitleHiUrl || null);
    set('subtitleEnUrl', data.subtitleEnUrl || null);
    set('starterCode', data.starterCode || null);
    set('vizType', data.vizType || null);
    set('isPreview', data.isPreview === undefined ? undefined : Boolean(data.isPreview));
    set('isMandatory', data.isMandatory === undefined ? (partial ? undefined : true) : Boolean(data.isMandatory));
    set('estimatedMinutes', data.estimatedMinutes !== undefined && data.estimatedMinutes !== '' ? Number(data.estimatedMinutes) : null);
    return payload;
  }

  private quizQuestionPayload(questions: any[]) {
    return (questions ?? []).map((q, i) => ({
      question: q.question,
      options: q.options,
      correctIndex: Number(q.correctIndex),
      explanation: q.explanation || null,
      order: Number(q.order ?? i + 1),
    }));
  }
}