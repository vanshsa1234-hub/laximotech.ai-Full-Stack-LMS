import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalStudents, totalCourses, totalEnrollments,
      totalRevenue, totalCertificates, recentOrders,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'STUDENT' } }),
      this.prisma.course.count({ where: { isPublished: true } }),
      this.prisma.enrollment.count(),
      this.prisma.order.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
      this.prisma.certificate.count({ where: { status: 'ISSUED' } }),
      this.prisma.order.findMany({
        where:   { status: 'PAID' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true, amount: true, createdAt: true,
          user:   { select: { name: true, email: true } },
          course: { select: { title: true } },
        },
      }),
    ]);

    // Revenue by day (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dailyRevenue = await this.prisma.order.groupBy({
      by:      ['createdAt'],
      where:   { status: 'PAID', createdAt: { gte: thirtyDaysAgo } },
      _sum:    { amount: true },
      orderBy: { createdAt: 'asc' },
    });

    // Enrollments by category
    const byCategory = await this.prisma.enrollment.groupBy({
      by:      ['courseId'],
      _count:  true,
    });

    return {
      totalStudents,
      totalCourses,
      totalEnrollments,
      totalRevenuePaise: totalRevenue._sum.amount ?? 0,
      totalRevenueRs:    Math.round((totalRevenue._sum.amount ?? 0) / 100),
      totalCertificates,
      recentOrders,
      dailyRevenue,
    };
  }

  async getAllStudents(query: { page?: string; search?: string }) {
    const page     = Math.max(1, parseInt(query.page ?? '1'));
    const pageSize = 20;
    const skip     = (page - 1) * pageSize;

    const where: any = {
      role: 'STUDENT',
      ...(query.search && {
        OR: [
          { name:  { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [students, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where, skip, take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, email: true, image: true,
          xpPoints: true, streakDays: true, createdAt: true,
          _count: { select: { enrollments: true, certificates: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: students, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getAllOrders(query: { page?: string; status?: string }) {
    const page     = Math.max(1, parseInt(query.page ?? '1'));
    const pageSize = 20;
    const skip     = (page - 1) * pageSize;
    const where: any = { ...(query.status && { status: query.status }) };

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where, skip, take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, amount: true, status: true, createdAt: true,
          razorpayPaymentId: true,
          user:   { select: { id: true, name: true, email: true } },
          course: { select: { id: true, title: true } },
          coupon: { select: { code: true, discountPct: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data: orders, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async createCoupon(data: { code: string; discountPct: number; maxUses?: number; expiresAt?: string }) {
    return this.prisma.coupon.create({
      data: {
        code:        data.code.toUpperCase(),
        discountPct: data.discountPct,
        maxUses:     data.maxUses,
        expiresAt:   data.expiresAt ? new Date(data.expiresAt) : null,
        isActive:    true,
      },
    });
  }

  async getAllCoupons() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { orders: true } } },
    });
  }

  async toggleCoupon(id: string, isActive: boolean) {
    return this.prisma.coupon.update({ where: { id }, data: { isActive } });
  }

  async getEnrollmentsByStudent(userId: string) {
    return this.prisma.enrollment.findMany({
      where:   { userId },
      include: {
        course: { select: { id: true, title: true, slug: true } },
      },
    });
  }
}
