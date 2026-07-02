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

// ── enrollments.controller.ts ────────────────────────────────
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard }      from '../auth/guards/jwt-auth.guard';
import { CurrentUser }       from '../auth/decorators/current-user.decorator';

@ApiTags('Enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private enrollments: EnrollmentsService) {}

  @Get('me')
  getMyEnrollments(@CurrentUser() user: any) {
    return this.enrollments.getMyEnrollments(user.id);
  }

  @Get('check/:courseId')
  checkEnrollment(@CurrentUser() user: any, @Param('courseId') courseId: string) {
    return this.enrollments.checkEnrollment(user.id, courseId);
  }

  @Get('progress/:courseSlug')
  getProgress(@CurrentUser() user: any, @Param('courseSlug') courseSlug: string) {
    return this.enrollments.getEnrollmentWithProgress(user.id, courseSlug);
  }
}
