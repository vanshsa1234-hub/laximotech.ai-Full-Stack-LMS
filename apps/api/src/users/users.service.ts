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
        bio: true, city: true, linkedinUrl: true, phone: true, createdAt: true,
        _count: { select: { enrollments: true, certificates: true, quizAttempts: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found.');
    return user;
  }

  async getDashboardStats(userId: string) {
    const [enrollments, certificates, completedCourses, totalWatched] = await Promise.all([
      this.prisma.enrollment.count({ where: { userId } }),
      this.prisma.certificate.count({ where: { userId } }),
      this.prisma.enrollment.count({ where: { userId, completedAt: { not: null } } }),
      this.prisma.lessonProgress.aggregate({ where: { userId }, _sum: { watchedSeconds: true } }),
    ]);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xpPoints: true, streakDays: true },
    });

    return {
      enrolledCourses:  enrollments,
      completedCourses,
      certificates,
      xpPoints:         user?.xpPoints ?? 0,
      streakDays:       user?.streakDays ?? 0,
      totalWatchedHrs:  Math.round((totalWatched._sum.watchedSeconds ?? 0) / 3600),
    };
  }

  async updateProfile(userId: string, data: {
    name?: string; bio?: string; city?: string; linkedinUrl?: string; phone?: string; weeklyGoal?: number;
  }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, bio: true, city: true, linkedinUrl: true, phone: true, weeklyGoal: true },
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
}
