import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as dayjs from 'dayjs';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async updateProgress(userId: string, lessonId: string, watchedSeconds: number, bookmarkSeconds?: number) {
    // Get lesson duration
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { videoDurationSec: true, section: { select: { courseId: true } } },
    });
    if (!lesson) return null;

    const duration    = lesson.videoDurationSec ?? (watchedSeconds * 1.2);
    const watchedPct  = duration > 0 ? (watchedSeconds / duration) * 100 : 0;
    const isCompleted = watchedPct >= 80; // 80% watched = complete

    const progress = await this.prisma.lessonProgress.upsert({
      where:  { userId_lessonId: { userId, lessonId } },
      update: {
        watchedSeconds: Math.max(watchedSeconds, 0),
        isCompleted,
        lastWatchedAt: new Date(),
        ...(isCompleted && { completedAt: new Date() }),
        ...(bookmarkSeconds !== undefined && { bookmarkSeconds }),
      },
      create: {
        userId, lessonId, watchedSeconds, isCompleted,
        lastWatchedAt: new Date(),
        ...(isCompleted && { completedAt: new Date() }),
        ...(bookmarkSeconds !== undefined && { bookmarkSeconds }),
      },
    });

    // Award XP for completing a lesson
    if (isCompleted) {
      await this.prisma.user.update({
        where: { id: userId },
        data:  { xpPoints: { increment: 10 } },
      });
      // Update enrollment progress
      await this.recalcEnrollmentProgress(userId, lesson.section.courseId);
    }

    // Update streak
    await this.updateStreak(userId);

    return progress;
  }

  async getCourseProgress(userId: string, courseId: string) {
    return this.prisma.lessonProgress.findMany({
      where: { userId, lesson: { section: { courseId } } },
      select: { lessonId: true, isCompleted: true, watchedSeconds: true, bookmarkSeconds: true, lastWatchedAt: true },
    });
  }

  private async recalcEnrollmentProgress(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId }, select: { totalLessons: true } });
    if (!course || course.totalLessons === 0) return;

    const completedCount = await this.prisma.lessonProgress.count({
      where: { userId, isCompleted: true, lesson: { section: { courseId } } },
    });

    const progressPct = Math.round((completedCount / course.totalLessons) * 100);

    await this.prisma.enrollment.updateMany({
      where: { userId, courseId },
      data:  { progress: progressPct, ...(progressPct === 100 ? { completedAt: new Date() } : {}) },
    });
  }

  private async updateStreak(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { lastActiveAt: true, streakDays: true } });
    if (!user) return;

    const now       = dayjs();
    const lastActive = user.lastActiveAt ? dayjs(user.lastActiveAt) : null;
    const isNewDay  = !lastActive || !lastActive.isSame(now, 'day');
    const isNextDay = lastActive && now.diff(lastActive, 'day') === 1;

    if (isNewDay) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          lastActiveAt: now.toDate(),
          streakDays: isNextDay ? { increment: 1 } : 1,
        },
      });
    }
  }
}
