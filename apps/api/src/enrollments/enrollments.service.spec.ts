import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      enrollment: { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
      lesson: { findFirst: jest.fn() },
      course: { findUnique: jest.fn() },
      lessonProgress: { findMany: jest.fn() },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [EnrollmentsService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(EnrollmentsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('getMyEnrollments attaches the first lesson id per course', async () => {
    prisma.enrollment.findMany.mockResolvedValue([{ id: 'e1', course: { id: 'c1' } }]);
    prisma.lesson.findFirst.mockResolvedValue({ id: 'l1' });
    const result = await service.getMyEnrollments('u1');
    expect(result[0].course.firstLessonId).toBe('l1');
  });

  it('getMyEnrollments returns null firstLessonId when the course has no lessons', async () => {
    prisma.enrollment.findMany.mockResolvedValue([{ id: 'e1', course: { id: 'c1' } }]);
    prisma.lesson.findFirst.mockResolvedValue(null);
    const result = await service.getMyEnrollments('u1');
    expect(result[0].course.firstLessonId).toBeNull();
  });

  it('checkEnrollment reports enrolled true/false correctly', async () => {
    prisma.enrollment.findUnique.mockResolvedValue({ id: 'e1' });
    await expect(service.checkEnrollment('u1', 'c1')).resolves.toEqual({ enrolled: true, enrollment: { id: 'e1' } });

    prisma.enrollment.findUnique.mockResolvedValue(null);
    await expect(service.checkEnrollment('u1', 'c1')).resolves.toEqual({ enrolled: false, enrollment: null });
  });

  describe('getEnrollmentWithProgress', () => {
    it('throws NotFoundException when the course does not exist', async () => {
      prisma.course.findUnique.mockResolvedValue(null);
      await expect(service.getEnrollmentWithProgress('u1', 'missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws NotFoundException when not enrolled', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 'c1', totalLessons: 10 });
      prisma.enrollment.findUnique.mockResolvedValue(null);
      await expect(service.getEnrollmentWithProgress('u1', 'slug')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('recalculates and persists progress percentage when it changed', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 'c1', totalLessons: 4 });
      prisma.enrollment.findUnique.mockResolvedValue({ id: 'e1', progress: 0 });
      prisma.lessonProgress.findMany.mockResolvedValue([
        { lessonId: 'l1', isCompleted: true }, { lessonId: 'l2', isCompleted: true },
      ]);
      prisma.enrollment.update.mockResolvedValue({});

      const result = await service.getEnrollmentWithProgress('u1', 'slug');
      expect(result.enrollment.progress).toBe(50);
      expect(prisma.enrollment.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ progress: 50 }) }),
      );
    });

    it('marks completedAt when progress reaches 100%', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 'c1', totalLessons: 2 });
      prisma.enrollment.findUnique.mockResolvedValue({ id: 'e1', progress: 50 });
      prisma.lessonProgress.findMany.mockResolvedValue([
        { lessonId: 'l1', isCompleted: true }, { lessonId: 'l2', isCompleted: true },
      ]);
      prisma.enrollment.update.mockResolvedValue({});

      await service.getEnrollmentWithProgress('u1', 'slug');
      const arg = prisma.enrollment.update.mock.calls[0][0];
      expect(arg.data.completedAt).toBeInstanceOf(Date);
    });

    it('skips the update entirely when progress has not changed', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 'c1', totalLessons: 2 });
      prisma.enrollment.findUnique.mockResolvedValue({ id: 'e1', progress: 100 });
      prisma.lessonProgress.findMany.mockResolvedValue([
        { lessonId: 'l1', isCompleted: true }, { lessonId: 'l2', isCompleted: true },
      ]);

      await service.getEnrollmentWithProgress('u1', 'slug');
      expect(prisma.enrollment.update).not.toHaveBeenCalled();
    });
  });
});
