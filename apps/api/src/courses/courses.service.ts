// C:\Users\LENOVO\Downloads\laximotech(project)\laximotech7\apps\api\src\courses\courses.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContentType, CourseCategory, CourseLevel, Prisma } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

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
                starterCode: true, isPreview: true, isMandatory: true,
                estimatedMinutes: true, videoDurationSec: true,
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
    return lesson;
  }

  async updateLesson(lessonId: string, data: any) {
    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: this.lessonPayload(data, true),
      include: { quiz: { include: { questions: { orderBy: { order: 'asc' } } } } },
    });
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
