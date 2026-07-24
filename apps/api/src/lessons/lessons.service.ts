import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService }  from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService, private storage: StorageService) {}

  async getLesson(lessonId: string, userId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true, title: true, order: true, contentType: true,
        videoUrl: true, pdfUrl: true, textContent: true,
        subtitleHiUrl: true, subtitleEnUrl: true,
        starterCode: true, isPreview: true, estimatedMinutes: true,
        videoDurationSec: true,
        documents: {
          orderBy: { order: 'asc' },
          select: { id: true, title: true, fileUrl: true, fileType: true, order: true },
        },
        section: {
          select: {
            id: true, title: true, order: true,
            course: { select: { id: true, slug: true, title: true } },
          },
        },
        quiz: { select: { id: true, title: true, passingScore: true, isFinalExam: true } },
      },
    });

    if (!lesson) throw new NotFoundException('Lesson not found.');

    // Check access: preview lessons are free, paid lessons require enrollment
    if (!lesson.isPreview) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: lesson.section.course.id } },
      });
      if (!enrollment) throw new ForbiddenException('Please enroll in this course to access this lesson.');
    }

    // Generate signed URLs (valid for 2 hours)
    const result: any = { ...lesson };

    if (lesson.videoUrl) {
      result.videoUrl = await this.storage.getViewUrl(lesson.videoUrl, 7200);
    }
    if (lesson.pdfUrl) {
      result.pdfUrl = await this.storage.getViewUrl(lesson.pdfUrl, 7200);
    }
    if (lesson.subtitleHiUrl) {
      result.subtitleHiUrl = await this.storage.getViewUrl(lesson.subtitleHiUrl, 7200);
    }
    if (lesson.subtitleEnUrl) {
      result.subtitleEnUrl = await this.storage.getViewUrl(lesson.subtitleEnUrl, 7200);
    }
    if (lesson.documents?.length) {
      result.documents = await Promise.all(
        lesson.documents.map(async (doc) => ({ ...doc, fileUrl: await this.storage.getViewUrl(doc.fileUrl, 7200) })),
      );
    }

    // Get user progress for this lesson
    const progress = await this.prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
      select: { watchedSeconds: true, isCompleted: true, bookmarkSeconds: true },
    });

    return { ...result, progress };
  }

  async getCourseLessons(courseSlug: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { slug: courseSlug },
      select: { id: true },
    });
    if (!course) throw new NotFoundException('Course not found.');

    const isEnrolled = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    });

    const sections = await this.prisma.section.findMany({
      where:   { courseId: course.id },
      orderBy: { order: 'asc' },
      select: {
        id: true, title: true, order: true,
        lessons: {
          orderBy: { order: 'asc' },
          select: {
            id: true, title: true, order: true, contentType: true,
            isPreview: true, estimatedMinutes: true, videoDurationSec: true,
            quiz: { select: { id: true } },
          },
        },
      },
    });

    // Attach progress if enrolled
    let progressMap: Record<string, { isCompleted: boolean; watchedSeconds: number }> = {};
    if (isEnrolled) {
      const progressRecords = await this.prisma.lessonProgress.findMany({
        where: { userId, lesson: { section: { courseId: course.id } } },
        select: { lessonId: true, isCompleted: true, watchedSeconds: true },
      });
      progressMap = Object.fromEntries(progressRecords.map(p => [p.lessonId, p]));
    }

    const sectionsWithProgress = sections.map(s => ({
      ...s,
      lessons: s.lessons.map(l => ({
        ...l,
        isLocked:  !l.isPreview && !isEnrolled,
        progress:  progressMap[l.id] ?? null,
      })),
    }));

    return { sections: sectionsWithProgress, isEnrolled: !!isEnrolled };
  }
}
