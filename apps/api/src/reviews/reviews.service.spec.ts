import { Test } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      enrollment: { findUnique: jest.fn() },
      review: { upsert: jest.fn(), findUnique: jest.fn(), findMany: jest.fn(), aggregate: jest.fn(), count: jest.fn() },
      user: { count: jest.fn() },
      course: { count: jest.fn(), aggregate: jest.fn() },
      demoRequest: { count: jest.fn() },
      certificate: { count: jest.fn() },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [ReviewsService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(ReviewsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('upsert', () => {
    it('rejects a rating outside 1-5', async () => {
      await expect(service.upsert('u1', 'c1', { rating: 0 })).rejects.toBeInstanceOf(BadRequestException);
      await expect(service.upsert('u1', 'c1', { rating: 6 })).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects when the user is not enrolled', async () => {
      prisma.enrollment.findUnique.mockResolvedValue(null);
      await expect(service.upsert('u1', 'c1', { rating: 5 })).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('upserts the review when enrolled', async () => {
      prisma.enrollment.findUnique.mockResolvedValue({ id: 'e1' });
      prisma.review.upsert.mockResolvedValue({ id: 'r1' });
      const result = await service.upsert('u1', 'c1', { rating: 5, comment: '  Great!  ' });
      expect(result).toEqual({ id: 'r1' });
      const arg = prisma.review.upsert.mock.calls[0][0];
      expect(arg.create.comment).toBe('Great!');
    });

    it('stores null comment when blank', async () => {
      prisma.enrollment.findUnique.mockResolvedValue({ id: 'e1' });
      prisma.review.upsert.mockResolvedValue({});
      await service.upsert('u1', 'c1', { rating: 4, comment: '   ' });
      expect(prisma.review.upsert.mock.calls[0][0].create.comment).toBeNull();
    });
  });

  it('myReview looks up by composite user/course key', async () => {
    prisma.review.findUnique.mockResolvedValue({ id: 'r1' });
    await expect(service.myReview('u1', 'c1')).resolves.toEqual({ id: 'r1' });
    expect(prisma.review.findUnique).toHaveBeenCalledWith({ where: { userId_courseId: { userId: 'u1', courseId: 'c1' } } });
  });

  it('featured returns high-rated reviews with comments, default limit 6', async () => {
    prisma.review.findMany.mockResolvedValue([{ id: 'r1' }]);
    await service.featured();
    expect(prisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { rating: { gte: 4 }, comment: { not: null } }, take: 6 }),
    );
  });

  describe('platformStats', () => {
    it('returns null avgRating/completionRate/avgCourseDurationHrs when data is absent', async () => {
      prisma.user.count.mockResolvedValue(0);
      prisma.course.count.mockResolvedValue(0);
      prisma.review.aggregate.mockResolvedValue({ _avg: { rating: null } });
      prisma.review.count.mockResolvedValue(0);
      prisma.enrollment.aggregate = jest.fn().mockResolvedValue({ _count: { _all: 0 } });
      prisma.demoRequest.count.mockResolvedValue(0);
      prisma.course.aggregate.mockResolvedValue({ _avg: { durationHrs: null } });
      prisma.certificate.count.mockResolvedValue(0);
      prisma.enrollment.count = jest.fn().mockResolvedValue(0);

      const result = await service.platformStats();
      expect(result.avgRating).toBeNull();
      expect(result.completionRate).toBeNull();
      expect(result.avgCourseDurationHrs).toBeNull();
    });

    it('computes completionRate as a rounded percentage', async () => {
      prisma.user.count.mockResolvedValue(100);
      prisma.course.count.mockResolvedValue(10);
      prisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.7 } });
      prisma.review.count.mockResolvedValue(50);
      prisma.enrollment.aggregate = jest.fn().mockResolvedValue({ _count: { _all: 200 } });
      prisma.demoRequest.count.mockResolvedValue(5);
      prisma.course.aggregate.mockResolvedValue({ _avg: { durationHrs: 12.4 } });
      prisma.certificate.count.mockResolvedValue(30);
      prisma.enrollment.count = jest.fn().mockResolvedValue(150);

      const result = await service.platformStats();
      expect(result.completionRate).toBe(75); // 150/200
      expect(result.avgCourseDurationHrs).toBe(12);
    });
  });
});
