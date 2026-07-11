// ── enrollments.service.ts ───────────────────────────────────
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async getMyEnrollments(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where:   { userId },
      orderBy: { enrolledAt: 'desc' },
      select: {
        id: true, enrolledAt: true, completedAt: true, progress: true,
        course: {
          select: {
            id: true, slug: true, title: true, shortDesc: true,
            thumbnailUrl: true, durationHrs: true, totalLessons: true,
            category: true, level: true,
            instructor: { select: { id: true, name: true } },
          },
        },
      },
    });

    return Promise.all(enrollments.map(async (enrollment: any) => {
      const firstLesson = await this.prisma.lesson.findFirst({
        where: { section: { courseId: enrollment.course.id } },
        orderBy: { order: 'asc' },
        select: { id: true },
      });

      return {
        ...enrollment,
        course: {
          ...enrollment.course,
          firstLessonId: firstLesson?.id ?? null,
        },
      };
    }));
  }

  async checkEnrollment(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    return { enrolled: !!enrollment, enrollment };
  }

  async getEnrollmentWithProgress(userId: string, courseSlug: string) {
    const course = await this.prisma.course.findUnique({
      where: { slug: courseSlug },
      select: { id: true, totalLessons: true },
    });
    if (!course) throw new NotFoundException('Course not found.');

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    });
    if (!enrollment) throw new NotFoundException('Not enrolled in this course.');

    const lessonProgress = await this.prisma.lessonProgress.findMany({
      where: { userId, lesson: { section: { courseId: course.id } } },
      select: { lessonId: true, isCompleted: true, watchedSeconds: true, bookmarkSeconds: true },
    });

    const completedCount = lessonProgress.filter(lp => lp.isCompleted).length;
    const progressPct    = course.totalLessons > 0 ? Math.round((completedCount / course.totalLessons) * 100) : 0;

    // Update progress in DB
    if (progressPct !== enrollment.progress) {
      await this.prisma.enrollment.update({
        where: { id: enrollment.id },
        data:  { progress: progressPct, ...(progressPct === 100 ? { completedAt: new Date() } : {}) },
      });
    }

    return { enrollment: { ...enrollment, progress: progressPct }, lessonProgress };
  }
}