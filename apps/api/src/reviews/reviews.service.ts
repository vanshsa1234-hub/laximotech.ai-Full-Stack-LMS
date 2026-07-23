import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async upsert(userId: string, courseId: string, data: { rating: number; comment?: string }) {
    const rating = Number(data.rating);
    if (!rating || rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5.');
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!enrollment) {
      throw new ForbiddenException('You can only review courses you are enrolled in.');
    }

    return this.prisma.review.upsert({
      where:  { userId_courseId: { userId, courseId } },
      create: { userId, courseId, rating, comment: data.comment?.trim() || null },
      update: { rating, comment: data.comment?.trim() || null },
    });
  }

  async myReview(userId: string, courseId: string) {
    return this.prisma.review.findUnique({ where: { userId_courseId: { userId, courseId } } });
  }

  // Real reviews for homepage social proof — never padded with fake entries.
  // Only reviews with an actual written comment and a high rating are shown.
  async featured(limit = 6) {
    return this.prisma.review.findMany({
      where:   { rating: { gte: 4 }, comment: { not: null } },
      orderBy: { createdAt: 'desc' },
      take:    limit,
      select: {
        id: true, rating: true, comment: true, createdAt: true,
        user:   { select: { name: true, image: true, city: true } },
        course: { select: { title: true, slug: true } },
      },
    });
  }

  // Platform-wide real numbers, used by the homepage trust bar / hero — no fallback fabrication.
  async platformStats() {
    const [totalStudents, totalCourses, ratingAgg, totalReviews, enrollmentStats, totalDemoRequests, durationAgg, totalCertificates] = await Promise.all([
      this.prisma.user.count({ where: { role: 'STUDENT', enrollments: { some: {} } } }),
      this.prisma.course.count({ where: { isPublished: true } }),
      this.prisma.review.aggregate({ _avg: { rating: true } }),
      this.prisma.review.count(),
      this.prisma.enrollment.aggregate({ _count: { _all: true } }),
      this.prisma.demoRequest.count(),
      this.prisma.course.aggregate({ where: { isPublished: true }, _avg: { durationHrs: true } }),
      this.prisma.certificate.count({ where: { status: 'ISSUED' } }),
    ]);
    const completedCount = await this.prisma.enrollment.count({ where: { completedAt: { not: null } } });
    const totalEnrollments = enrollmentStats._count._all;

    return {
      totalStudents,
      totalCourses,
      avgRating: ratingAgg._avg.rating, // null if no reviews yet — frontend must handle this, never fabricate
      totalReviews,
      totalDemoRequests,
      totalCertificates,
      avgCourseDurationHrs: durationAgg._avg.durationHrs ? Math.round(durationAgg._avg.durationHrs) : null,
      completionRate: totalEnrollments > 0 ? Math.round((completedCount / totalEnrollments) * 100) : null,
    };
  }
}
