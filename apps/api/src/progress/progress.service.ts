import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CertificatesService } from '../certificates/certificates.service';
import * as dayjs from 'dayjs';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService, private certificates: CertificatesService) {}

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
        userId, lessonId, watchedSeconds: Math.max(watchedSeconds, 0), isCompleted,
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

  async recalcEnrollmentProgress(userId: string, courseId: string) {
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

    // Safety net for courses with no final-exam quiz: watching 100% of the
    // lessons should still earn a real certificate, not just a "100%" progress
    // bar with nothing to show for it. Guarded so we don't regenerate the PDF
    // every time someone rewatches a lesson after already completing the course.
    if (progressPct === 100) {
      const existing = await this.prisma.certificate.findUnique({
        where: { userId_courseId: { userId, courseId } },
      });
      if (!existing) {
        await this.certificates.issueCertificate(userId, courseId);
      }
    }
  }

  private async updateStreak(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { lastActiveAt: true, streakDays: true } });
    if (!user) return;

    const now       = dayjs();
    const lastActive = user.lastActiveAt ? dayjs(user.lastActiveAt) : null;
    const isNewDay  = !lastActive || !lastActive.isSame(now, 'day');
    // Compare calendar days (midnight to midnight), not raw elapsed hours —
    // .diff(x, 'day') truncates to full 24h periods, so studying late one
    // night and again early the next morning (a real consecutive day, but
    // under 24 hours apart) was incorrectly resetting the streak to 1.
    const isNextDay = !!lastActive && now.startOf('day').diff(lastActive.startOf('day'), 'day') === 1;

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
