import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn(), update: jest.fn(), findMany: jest.fn() },
      enrollment: { count: jest.fn() },
      certificate: { count: jest.fn() },
      lessonProgress: { count: jest.fn(), aggregate: jest.fn(), findMany: jest.fn() },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getProfile', () => {
    it('throws NotFoundException when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.getProfile('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns the user when found', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', name: 'A' });
      await expect(service.getProfile('u1')).resolves.toEqual({ id: 'u1', name: 'A' });
    });
  });

  describe('updateProfile — mass-assignment regression', () => {
    it('only forwards the whitelisted profile fields to Prisma, even if extra fields are injected', async () => {
      prisma.user.update.mockResolvedValue({ id: 'u1' });

      const maliciousPayload: any = {
        name: 'A',
        bio: 'hi',
        // Attempted privilege escalation / injection via extra keys:
        role: 'ADMIN',
        id: 'someone-elses-id',
        xpPoints: 999999,
        email: 'hijacked@evil.com',
      };

      await service.updateProfile('u1', maliciousPayload);

      const callArg = prisma.user.update.mock.calls[0][0];
      expect(callArg.where).toEqual({ id: 'u1' });
      expect(callArg.data).not.toHaveProperty('role');
      expect(callArg.data).not.toHaveProperty('xpPoints');
      expect(callArg.data).not.toHaveProperty('email');
      expect(callArg.data).not.toHaveProperty('id');
      expect(callArg.data.name).toBe('A');
      expect(callArg.data.bio).toBe('hi');
    });

    it('updates the target user identified by userId, not by any id in the payload', async () => {
      prisma.user.update.mockResolvedValue({ id: 'u1' });
      await service.updateProfile('u1', { name: 'New Name' } as any);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'u1' } }),
      );
    });
  });

  describe('getDashboardStats', () => {
    it('aggregates enrollment, certificate, and progress counts, defaulting xp/streak when the user is missing', async () => {
      prisma.enrollment.count.mockResolvedValueOnce(4).mockResolvedValueOnce(2); // enrolled, then completedCourses
      prisma.certificate.count.mockResolvedValue(2);
      prisma.lessonProgress.count.mockResolvedValue(10);
      prisma.lessonProgress.aggregate.mockResolvedValue({ _sum: { watchedSeconds: 7200 } });
      prisma.user.findUnique.mockResolvedValue(null); // user vanished between calls

      const result = await service.getDashboardStats('u1');

      expect(result.enrolledCourses).toBe(4);
      expect(result.completedCourses).toBe(2);
      expect(result.completedLessons).toBe(10);
      expect(result.certificates).toBe(2);
      expect(result.xpPoints).toBe(0);
      expect(result.streakDays).toBe(0);
      expect(result.totalWatchedHrs).toBe(2); // 7200s / 3600 = 2h
      expect(result.weeklyGoal).toEqual({ completed: expect.any(Number), target: expect.any(Number) });
    });

    it('uses the real xpPoints/streakDays when the user is found', async () => {
      prisma.enrollment.count.mockResolvedValue(1);
      prisma.certificate.count.mockResolvedValue(0);
      prisma.lessonProgress.count.mockResolvedValue(0);
      prisma.lessonProgress.aggregate.mockResolvedValue({ _sum: { watchedSeconds: null } });
      prisma.user.findUnique.mockResolvedValue({ xpPoints: 150, streakDays: 5 });

      const result = await service.getDashboardStats('u1');

      expect(result.xpPoints).toBe(150);
      expect(result.streakDays).toBe(5);
      expect(result.totalWatchedHrs).toBe(0);
    });
  });

  describe('getWeeklyGoalProgress', () => {
    it('defaults the target to 3 when the user has no weeklyGoal set', async () => {
      prisma.user.findUnique.mockResolvedValue({ weeklyGoal: null });
      prisma.lessonProgress.count.mockResolvedValue(2);

      const result = await service.getWeeklyGoalProgress('u1');
      expect(result).toEqual({ completed: 2, target: 3 });
    });

    it('uses the user real weeklyGoal target when set', async () => {
      prisma.user.findUnique.mockResolvedValue({ weeklyGoal: 5 });
      prisma.lessonProgress.count.mockResolvedValue(4);

      const result = await service.getWeeklyGoalProgress('u1');
      expect(result).toEqual({ completed: 4, target: 5 });
    });
  });

  describe('getLeaderboard', () => {
    it('orders by xpPoints desc and applies the given limit', async () => {
      prisma.user.findMany.mockResolvedValue([{ id: 'u1', xpPoints: 500 }]);
      const result = await service.getLeaderboard(10);
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { xpPoints: 'desc' }, take: 10 }),
      );
      expect(result).toEqual([{ id: 'u1', xpPoints: 500 }]);
    });

    it('defaults the limit to 20 when none is given', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      await service.getLeaderboard();
      expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 20 }));
    });
  });

  describe('getActivityHeatmap', () => {
    it('returns 84 days and buckets completions by their UTC completion date', async () => {
      const today = new Date();
      today.setUTCHours(12, 0, 0, 0); // midday so date math is unambiguous
      prisma.lessonProgress.findMany.mockResolvedValue([
        { completedAt: today },
        { completedAt: today },
        { completedAt: null }, // defensive: skipped, should not throw or be counted
      ]);

      const result = await service.getActivityHeatmap('u1');

      expect(result).toHaveLength(84);
      const todayKey = today.toISOString().slice(0, 10);
      const todayEntry = result.find(d => d.date === todayKey);
      expect(todayEntry?.count).toBe(2);
    });

    it('returns all-zero counts when there is no completion activity', async () => {
      prisma.lessonProgress.findMany.mockResolvedValue([]);
      const result = await service.getActivityHeatmap('u1');
      expect(result.every(d => d.count === 0)).toBe(true);
    });
  });
});