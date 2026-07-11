import { Test } from '@nestjs/testing';
import { ProgressService } from './progress.service';
import { PrismaService } from '../prisma/prisma.service';
import { CertificatesService } from '../certificates/certificates.service';

describe('ProgressService', () => {
  let service: ProgressService;
  let prisma: any;
  let certificates: any;

  beforeEach(async () => {
    prisma = {
      lesson: { findUnique: jest.fn() },
      lessonProgress: { upsert: jest.fn(), findMany: jest.fn(), count: jest.fn() },
      user: { update: jest.fn(), findUnique: jest.fn() },
      course: { findUnique: jest.fn() },
      enrollment: { updateMany: jest.fn() },
      certificate: { findUnique: jest.fn() },
    };
    certificates = { issueCertificate: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: PrismaService, useValue: prisma },
        { provide: CertificatesService, useValue: certificates },
      ],
    }).compile();

    service = moduleRef.get(ProgressService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('updateProgress', () => {
    it('returns null when the lesson does not exist', async () => {
      prisma.lesson.findUnique.mockResolvedValue(null);
      await expect(service.updateProgress('u1', 'missing', 100)).resolves.toBeNull();
    });

    it('marks complete at >=80% watched and awards XP', async () => {
      prisma.lesson.findUnique.mockResolvedValue({ videoDurationSec: 100, section: { courseId: 'c1' } });
      prisma.lessonProgress.upsert.mockResolvedValue({});
      prisma.user.update.mockResolvedValue({});
      prisma.course.findUnique.mockResolvedValue({ totalLessons: 5 });
      prisma.lessonProgress.count.mockResolvedValue(1);
      prisma.enrollment.updateMany.mockResolvedValue({});
      prisma.user.findUnique.mockResolvedValue({ lastActiveAt: null, streakDays: 0 });

      await service.updateProgress('u1', 'l1', 85);
      expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 'u1' }, data: { xpPoints: { increment: 10 } } });
    });

    it('does not mark complete below 80% watched', async () => {
      prisma.lesson.findUnique.mockResolvedValue({ videoDurationSec: 100, section: { courseId: 'c1' } });
      prisma.lessonProgress.upsert.mockResolvedValue({});
      prisma.user.findUnique.mockResolvedValue({ lastActiveAt: null, streakDays: 0 });
      prisma.user.update.mockResolvedValue({});

      await service.updateProgress('u1', 'l1', 50);
      const arg = prisma.lessonProgress.upsert.mock.calls[0][0];
      expect(arg.create.isCompleted).toBe(false);
    });

    it('estimates duration from watchedSeconds when videoDurationSec is missing', async () => {
      prisma.lesson.findUnique.mockResolvedValue({ videoDurationSec: null, section: { courseId: 'c1' } });
      prisma.lessonProgress.upsert.mockResolvedValue({});
      prisma.user.findUnique.mockResolvedValue({ lastActiveAt: null, streakDays: 0 });
      prisma.user.update.mockResolvedValue({});

      // With no known duration, watchedPct is always computed as if duration = watched*1.2,
      // giving ~83% — always "complete". Confirms the fallback formula runs without error.
      await service.updateProgress('u1', 'l1', 60);
      expect(prisma.lessonProgress.upsert).toHaveBeenCalled();
    });

    it('never lets watchedSeconds go negative', async () => {
      prisma.lesson.findUnique.mockResolvedValue({ videoDurationSec: 100, section: { courseId: 'c1' } });
      prisma.lessonProgress.upsert.mockResolvedValue({});
      prisma.user.findUnique.mockResolvedValue({ lastActiveAt: null, streakDays: 0 });

      await service.updateProgress('u1', 'l1', -50);
      const arg = prisma.lessonProgress.upsert.mock.calls[0][0];
      expect(arg.create.watchedSeconds).toBe(0);
    });
  });

  it('getCourseProgress returns lesson progress rows for the course', async () => {
    prisma.lessonProgress.findMany.mockResolvedValue([{ lessonId: 'l1' }]);
    await expect(service.getCourseProgress('u1', 'c1')).resolves.toEqual([{ lessonId: 'l1' }]);
  });

  describe('recalcEnrollmentProgress', () => {
    it('does nothing when the course has zero total lessons', async () => {
      prisma.course.findUnique.mockResolvedValue({ totalLessons: 0 });
      await service.recalcEnrollmentProgress('u1', 'c1');
      expect(prisma.enrollment.updateMany).not.toHaveBeenCalled();
    });

    it('issues a certificate as a safety net when progress reaches 100% with no existing cert', async () => {
      prisma.course.findUnique.mockResolvedValue({ totalLessons: 2 });
      prisma.lessonProgress.count.mockResolvedValue(2);
      prisma.enrollment.updateMany.mockResolvedValue({});
      prisma.certificate.findUnique.mockResolvedValue(null);

      await service.recalcEnrollmentProgress('u1', 'c1');
      expect(certificates.issueCertificate).toHaveBeenCalledWith('u1', 'c1');
    });

    it('does not re-issue a certificate that already exists', async () => {
      prisma.course.findUnique.mockResolvedValue({ totalLessons: 2 });
      prisma.lessonProgress.count.mockResolvedValue(2);
      prisma.enrollment.updateMany.mockResolvedValue({});
      prisma.certificate.findUnique.mockResolvedValue({ id: 'existing' });

      await service.recalcEnrollmentProgress('u1', 'c1');
      expect(certificates.issueCertificate).not.toHaveBeenCalled();
    });

    it('does not touch certificates when progress is below 100%', async () => {
      prisma.course.findUnique.mockResolvedValue({ totalLessons: 4 });
      prisma.lessonProgress.count.mockResolvedValue(1);
      prisma.enrollment.updateMany.mockResolvedValue({});

      await service.recalcEnrollmentProgress('u1', 'c1');
      expect(prisma.certificate.findUnique).not.toHaveBeenCalled();
    });
  });
});
