import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, image: true, role: true,
        xpPoints: true, streakDays: true, weeklyGoal: true,
        bio: true, city: true, linkedinUrl: true, phone: true, createdAt: true, preferences: true,
        _count: { select: { enrollments: true, certificates: true, quizAttempts: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found.');
    return user;
  }

  async getDashboardStats(userId: string) {
    const [enrollments, certificates, completedCourses, completedLessons, totalWatched, weeklyGoalData] = await Promise.all([
      this.prisma.enrollment.count({ where: { userId } }),
      this.prisma.certificate.count({ where: { userId } }),
      this.prisma.enrollment.count({ where: { userId, completedAt: { not: null } } }),
      this.prisma.lessonProgress.count({ where: { userId, isCompleted: true } }),
      this.prisma.lessonProgress.aggregate({ where: { userId }, _sum: { watchedSeconds: true } }),
      this.getWeeklyGoalProgress(userId),
    ]);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xpPoints: true, streakDays: true },
    });

    return {
      enrolledCourses:  enrollments,
      completedCourses,
      completedLessons,
      certificates,
      xpPoints:         user?.xpPoints ?? 0,
      streakDays:       user?.streakDays ?? 0,
      totalWatchedHrs:  Math.round((totalWatched._sum.watchedSeconds ?? 0) / 3600 * 10) / 10,
      weeklyGoal:       weeklyGoalData,
    };
  }

  // Real "lessons completed this week" vs. the user's real weeklyGoal target —
  // powers the dashboard Weekly Goal widget (previously hardcoded to 0/3).
  async getWeeklyGoalProgress(userId: string) {
    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // 0 = Sunday
    const startOfWeek = new Date(now);
    startOfWeek.setUTCDate(now.getUTCDate() - dayOfWeek);
    startOfWeek.setUTCHours(0, 0, 0, 0);

    const [user, completedThisWeek] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId }, select: { weeklyGoal: true } }),
      this.prisma.lessonProgress.count({
        where: { userId, isCompleted: true, completedAt: { gte: startOfWeek } },
      }),
    ]);

    return { completed: completedThisWeek, target: user?.weeklyGoal ?? 3 };
  }

  async updateProfile(userId: string, data: {
    name?: string; bio?: string; city?: string; linkedinUrl?: string; phone?: string; weeklyGoal?: number;
    preferences?: any;
  }) {
    const { name, bio, city, linkedinUrl, phone, weeklyGoal, preferences } = data;
    return this.prisma.user.update({
      where: { id: userId },
      data: { name, bio, city, linkedinUrl, phone, weeklyGoal, preferences },
      select: { id: true, name: true, bio: true, city: true, linkedinUrl: true, phone: true, weeklyGoal: true, preferences: true },
    });
  }

  async getLeaderboard(limit = 20) {
    return this.prisma.user.findMany({
      orderBy: { xpPoints: 'desc' },
      take: limit,
      select: { id: true, name: true, image: true, xpPoints: true, streakDays: true,
        _count: { select: { certificates: true } } },
    });
  }

  // Real lesson-completion activity for the last 84 days (12 weeks), grouped by day —
  // powers the progress-page heatmap. No random/fabricated data.
  async getActivityHeatmap(userId: string) {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - 83);
    since.setUTCHours(0, 0, 0, 0);

    const completions = await this.prisma.lessonProgress.findMany({
      where: { userId, isCompleted: true, completedAt: { gte: since } },
      select: { completedAt: true },
    });

    const counts = new Map<string, number>();
    for (const c of completions) {
      if (!c.completedAt) continue;
      const key = c.completedAt.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const days: { date: string; count: number }[] = [];
    for (let i = 0; i < 84; i++) {
      const d = new Date(since);
      d.setUTCDate(d.getUTCDate() + i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, count: counts.get(key) ?? 0 });
    }
    return days;
  }
}