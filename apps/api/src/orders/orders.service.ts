import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

// CommonJS require avoids "default is not a constructor" runtime error
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Razorpay = require('razorpay');

@Injectable()
export class OrdersService {
  private razorpay: any;

  private paymentsEnabled = false;

  constructor(private prisma: PrismaService, private config: ConfigService) {
    const keyId     = config.get<string>('RAZORPAY_KEY_ID');
    const keySecret = config.get<string>('RAZORPAY_KEY_SECRET');
    if (!keyId || !keySecret) {
      console.warn('⚠️  Razorpay keys missing — running in FREE ENROLLMENT mode (payments disabled).');
      this.paymentsEnabled = false;
      return;
    }
    this.razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    this.paymentsEnabled = true;
  }

  async createOrder(userId: string, courseId: string, couponCode?: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found.');

    const enrolled = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (enrolled) throw new ConflictException('You are already enrolled in this course.');

    const firstLesson = await this.prisma.lesson.findFirst({
      where: { section: { courseId } },
      orderBy: { order: 'asc' },
      select: { id: true },
    });

    // ── Payments not configured yet: enroll directly for free ──
    // This is intentionally honest — no fake "payment success" screen.
    // Once RAZORPAY_KEY_ID/SECRET are set in apps/api/.env, this path
    // is skipped and the real Razorpay checkout flow runs instead.
    if (!this.paymentsEnabled) {
      const enrollment = await this.prisma.enrollment.create({
        data: { userId, courseId },
      });
      await this.prisma.user.update({ where: { id: userId }, data: { xpPoints: { increment: 10 } } });
      return {
        freeEnrollment: true,
        enrollment,
        course: { title: course.title, price: course.price },
        firstLessonId: firstLesson?.id ?? null,
        message: 'Payments are not yet configured — you have been enrolled directly.',
      };
    }

    const existing = await this.prisma.order.findFirst({
      where: { userId, courseId, status: 'PENDING' },
    });
    if (existing?.razorpayOrderId) {
      return { order: existing, course: { title: course.title, price: course.price } };
    }

    // Apply coupon
    let discountAmount = 0;
    let couponId: string | undefined;
    if (couponCode) {
      const coupon = await this.prisma.coupon.findFirst({
        where: {
          code:     couponCode.toUpperCase(),
          isActive: true,
          AND: [
            { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
          ],
        },
      });
      if (coupon) {
        // Check usage limit in code (avoids duplicate OR key issue)
        const underLimit = coupon.maxUses == null || coupon.usedCount < coupon.maxUses;
        if (underLimit) {
          discountAmount = Math.round((course.price * coupon.discountPct) / 100);
          couponId = coupon.id;
        }
      }
    }

    const finalAmount = Math.max(1, course.price - discountAmount);
    const amountPaise = finalAmount * 100;

    const rzpOrder = await this.razorpay.orders.create({
      amount:   amountPaise,
      currency: 'INR',
      receipt:  `lxt_${userId.slice(0, 8)}_${Date.now()}`,
      notes:    { courseId, userId, courseTitle: course.title },
    });

    const order = await this.prisma.order.create({
      data: {
        userId, courseId,
        amount:          amountPaise,
        razorpayOrderId: rzpOrder.id,
        discountAmount:  discountAmount * 100,
        couponId,
        status: 'PENDING',
      },
    });

    return {
      order: { ...order, razorpayOrderId: rzpOrder.id },
      course: { title: course.title, price: course.price, finalAmount },
      firstLessonId: firstLesson?.id ?? null,
    };
  }

  async verifyPayment(data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) {
    const keySecret = this.config.get<string>('RAZORPAY_KEY_SECRET');
    if (!keySecret) throw new BadRequestException('Razorpay not configured.');

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== data.razorpaySignature) {
      throw new BadRequestException('Payment signature verification failed.');
    }

    const order = await this.prisma.order.findUnique({ where: { razorpayOrderId: data.razorpayOrderId } });
    if (!order) throw new NotFoundException('Order not found.');
    if (order.status === 'PAID') return { message: 'Already paid.', alreadyEnrolled: true };

    const [updatedOrder, enrollment] = await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: order.id },
        data:  { status: 'PAID', razorpayPaymentId: data.razorpayPaymentId, razorpaySignature: data.razorpaySignature },
      }),
      this.prisma.enrollment.create({
        data: { userId: order.userId, courseId: order.courseId },
      }),
    ]);

    if (order.couponId) {
      await this.prisma.coupon.update({ where: { id: order.couponId }, data: { usedCount: { increment: 1 } } });
    }

    await this.prisma.user.update({ where: { id: order.userId }, data: { xpPoints: { increment: 10 } } });

    return { message: 'Payment verified. Enrollment successful!', enrollment, order: updatedOrder };
  }

  async validateCoupon(courseId: string, couponCode: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found.');

    const coupon = await this.prisma.coupon.findFirst({
      where: {
        code: couponCode.toUpperCase(), isActive: true,
        AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }],
      },
    });

    if (!coupon) return { valid: false, message: 'Invalid or expired coupon.', discountPct: 0, discountAmount: 0, finalAmount: course.price };

    const discountAmount = Math.round((course.price * coupon.discountPct) / 100);
    return { valid: true, message: `${coupon.discountPct}% off applied!`, discountPct: coupon.discountPct, discountAmount, finalAmount: course.price - discountAmount };
  }

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where:   { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, amount: true, status: true, createdAt: true,
        course: { select: { id: true, title: true, slug: true, thumbnailUrl: true } },
      },
    });
  }
}
