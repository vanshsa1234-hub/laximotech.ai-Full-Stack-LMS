import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';

const mockRazorpayInstance = { orders: { create: jest.fn() } };
jest.mock('razorpay', () => jest.fn().mockImplementation(() => mockRazorpayInstance));

describe('OrdersService', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = {
      course: { findUnique: jest.fn() },
      enrollment: { findUnique: jest.fn(), create: jest.fn() },
      lesson: { findFirst: jest.fn() },
      order: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
      coupon: { findFirst: jest.fn(), update: jest.fn() },
      user: { update: jest.fn() },
      $transaction: jest.fn(),
    };
    jest.clearAllMocks();
  });

  async function buildService(configValues: Record<string, string | undefined>) {
    const config = { get: jest.fn((key: string) => configValues[key]) };
    const moduleRef = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();
    return moduleRef.get<OrdersService>(OrdersService);
  }

  describe('free-enrollment mode (no Razorpay keys configured)', () => {
    it('throws NotFoundException for a missing course', async () => {
      const service = await buildService({});
      prisma.course.findUnique.mockResolvedValue(null);
      await expect(service.createOrder('u1', 'missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ConflictException if already enrolled', async () => {
      const service = await buildService({});
      prisma.course.findUnique.mockResolvedValue({ id: 'c1', title: 'C', price: 399 });
      prisma.enrollment.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(service.createOrder('u1', 'c1')).rejects.toBeInstanceOf(ConflictException);
    });

    it('enrolls directly for free and awards XP', async () => {
      const service = await buildService({});
      prisma.course.findUnique.mockResolvedValue({ id: 'c1', title: 'C', price: 399 });
      prisma.enrollment.findUnique.mockResolvedValue(null);
      prisma.lesson.findFirst.mockResolvedValue({ id: 'l1' });
      prisma.enrollment.create.mockResolvedValue({ id: 'e1' });
      prisma.user.update.mockResolvedValue({});

      const result = await service.createOrder('u1', 'c1');
      expect(result.freeEnrollment).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' }, data: { xpPoints: { increment: 10 } },
      });
    });

    it('increments usedCount for a valid coupon even in free-enrollment mode', async () => {
      // Regression test: previously, a coupon code supplied while Razorpay
      // keys were unconfigured was silently ignored — usedCount never moved,
      // even though a real student had "used" it to enroll.
      const service = await buildService({});
      prisma.course.findUnique.mockResolvedValue({ id: 'c1', title: 'C', price: 399 });
      prisma.enrollment.findUnique.mockResolvedValue(null);
      prisma.lesson.findFirst.mockResolvedValue({ id: 'l1' });
      prisma.enrollment.create.mockResolvedValue({ id: 'e1' });
      prisma.user.update.mockResolvedValue({});
      prisma.coupon.findFirst.mockResolvedValue({ id: 'coup1', discountPct: 100, maxUses: 5, usedCount: 0 });
      prisma.coupon.update.mockResolvedValue({});

      const result = await service.createOrder('u1', 'c1', 'dm123');

      expect(result.freeEnrollment).toBe(true);
      expect(prisma.coupon.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ code: 'DM123', isActive: true }),
      }));
      expect(prisma.coupon.update).toHaveBeenCalledWith({
        where: { id: 'coup1' }, data: { usedCount: { increment: 1 } },
      });
    });

    it('does not touch usedCount for an unknown coupon code in free-enrollment mode', async () => {
      const service = await buildService({});
      prisma.course.findUnique.mockResolvedValue({ id: 'c1', title: 'C', price: 399 });
      prisma.enrollment.findUnique.mockResolvedValue(null);
      prisma.lesson.findFirst.mockResolvedValue({ id: 'l1' });
      prisma.enrollment.create.mockResolvedValue({ id: 'e1' });
      prisma.user.update.mockResolvedValue({});
      prisma.coupon.findFirst.mockResolvedValue(null);

      await service.createOrder('u1', 'c1', 'BOGUS');

      expect(prisma.coupon.update).not.toHaveBeenCalled();
    });

    it('does not touch usedCount for a coupon that has hit its usage limit, even in free-enrollment mode', async () => {
      const service = await buildService({});
      prisma.course.findUnique.mockResolvedValue({ id: 'c1', title: 'C', price: 399 });
      prisma.enrollment.findUnique.mockResolvedValue(null);
      prisma.lesson.findFirst.mockResolvedValue({ id: 'l1' });
      prisma.enrollment.create.mockResolvedValue({ id: 'e1' });
      prisma.user.update.mockResolvedValue({});
      prisma.coupon.findFirst.mockResolvedValue({ id: 'coup1', discountPct: 100, maxUses: 5, usedCount: 5 });

      await service.createOrder('u1', 'c1', 'DM123');

      expect(prisma.coupon.update).not.toHaveBeenCalled();
    });
  });

  describe('Razorpay mode (keys configured)', () => {
    async function buildEnabledService() {
      return buildService({ RAZORPAY_KEY_ID: 'key', RAZORPAY_KEY_SECRET: 'secret' });
    }

    it('returns an existing pending order instead of creating a duplicate', async () => {
      const service = await buildEnabledService();
      prisma.course.findUnique.mockResolvedValue({ id: 'c1', title: 'C', price: 399 });
      prisma.enrollment.findUnique.mockResolvedValue(null);
      prisma.lesson.findFirst.mockResolvedValue({ id: 'l1' });
      prisma.order.findFirst.mockResolvedValue({ id: 'o1', razorpayOrderId: 'rzp_1' });

      const result = await service.createOrder('u1', 'c1');
      expect(result.order!.id).toBe('o1');
    });

    it('applies a valid coupon discount', async () => {
      const service = await buildEnabledService();
      prisma.course.findUnique.mockResolvedValue({ id: 'c1', title: 'C', price: 400 });
      prisma.enrollment.findUnique.mockResolvedValue(null);
      prisma.lesson.findFirst.mockResolvedValue(null);
      prisma.order.findFirst.mockResolvedValue(null);
      prisma.coupon.findFirst.mockResolvedValue({ id: 'coup1', discountPct: 10, maxUses: null, usedCount: 0 });
      mockRazorpayInstance.orders.create.mockResolvedValue({ id: 'rzp_new' });
      prisma.order.create.mockResolvedValue({ id: 'o1' });

      const result = await service.createOrder('u1', 'c1', 'SAVE10');
      expect(result.course.finalAmount).toBe(360); // 400 - 10%
    });

    it('ignores a coupon that has hit its usage limit', async () => {
      const service = await buildEnabledService();
      prisma.course.findUnique.mockResolvedValue({ id: 'c1', title: 'C', price: 400 });
      prisma.enrollment.findUnique.mockResolvedValue(null);
      prisma.lesson.findFirst.mockResolvedValue(null);
      prisma.order.findFirst.mockResolvedValue(null);
      prisma.coupon.findFirst.mockResolvedValue({ id: 'coup1', discountPct: 10, maxUses: 5, usedCount: 5 });
      mockRazorpayInstance.orders.create.mockResolvedValue({ id: 'rzp_new' });
      prisma.order.create.mockResolvedValue({ id: 'o1' });

      const result = await service.createOrder('u1', 'c1', 'MAXED');
      expect(result.course.finalAmount).toBe(400);
    });

    it('creates a Razorpay order with amount in paise', async () => {
      const service = await buildEnabledService();
      prisma.course.findUnique.mockResolvedValue({ id: 'c1', title: 'C', price: 399 });
      prisma.enrollment.findUnique.mockResolvedValue(null);
      prisma.lesson.findFirst.mockResolvedValue(null);
      prisma.order.findFirst.mockResolvedValue(null);
      prisma.coupon.findFirst.mockResolvedValue(null);
      mockRazorpayInstance.orders.create.mockResolvedValue({ id: 'rzp_1' });
      prisma.order.create.mockResolvedValue({ id: 'o1' });

      await service.createOrder('u1', 'c1');
      expect(mockRazorpayInstance.orders.create).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 39900, currency: 'INR' }),
      );
    });

    describe('verifyPayment', () => {
      it('rejects an invalid signature', async () => {
        const service = await buildEnabledService();
        await expect(
          service.verifyPayment({ razorpayOrderId: 'o', razorpayPaymentId: 'p', razorpaySignature: 'bad-sig' }),
        ).rejects.toBeInstanceOf(BadRequestException);
      });

      it('accepts a valid signature and creates the enrollment', async () => {
        const service = await buildEnabledService();
        const razorpayOrderId = 'order_1';
        const razorpayPaymentId = 'pay_1';
        const validSignature = crypto
          .createHmac('sha256', 'secret')
          .update(`${razorpayOrderId}|${razorpayPaymentId}`)
          .digest('hex');

        prisma.order.findUnique.mockResolvedValue({ id: 'o1', status: 'PENDING', userId: 'u1', courseId: 'c1', couponId: null });
        prisma.$transaction.mockResolvedValue([{ id: 'o1', status: 'PAID' }, { id: 'e1' }]);
        prisma.user.update.mockResolvedValue({});

        const result = await service.verifyPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature: validSignature });
        expect(result.message).toContain('successful');
        expect(prisma.user.update).toHaveBeenCalled();
      });

      it('throws NotFoundException for an unknown order', async () => {
        const service = await buildEnabledService();
        const sig = crypto.createHmac('sha256', 'secret').update('o|p').digest('hex');
        prisma.order.findUnique.mockResolvedValue(null);
        await expect(
          service.verifyPayment({ razorpayOrderId: 'o', razorpayPaymentId: 'p', razorpaySignature: sig }),
        ).rejects.toBeInstanceOf(NotFoundException);
      });

      it('short-circuits when the order is already paid', async () => {
        const service = await buildEnabledService();
        const sig = crypto.createHmac('sha256', 'secret').update('o|p').digest('hex');
        prisma.order.findUnique.mockResolvedValue({ id: 'o1', status: 'PAID' });
        const result = await service.verifyPayment({ razorpayOrderId: 'o', razorpayPaymentId: 'p', razorpaySignature: sig });
        expect(result.alreadyEnrolled).toBe(true);
      });
    });
  });

  describe('validateCoupon', () => {
    it('throws NotFoundException for a missing course', async () => {
      const service = await buildService({});
      prisma.course.findUnique.mockResolvedValue(null);
      await expect(service.validateCoupon('missing', 'CODE')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns invalid for an unknown/expired coupon', async () => {
      const service = await buildService({});
      prisma.course.findUnique.mockResolvedValue({ id: 'c1', price: 399 });
      prisma.coupon.findFirst.mockResolvedValue(null);
      const result = await service.validateCoupon('c1', 'BAD');
      expect(result.valid).toBe(false);
    });

    it('returns the discounted price for a valid coupon', async () => {
      const service = await buildService({});
      prisma.course.findUnique.mockResolvedValue({ id: 'c1', price: 400 });
      prisma.coupon.findFirst.mockResolvedValue({ discountPct: 25 });
      const result = await service.validateCoupon('c1', 'SAVE25');
      expect(result.valid).toBe(true);
      expect(result.finalAmount).toBe(300);
    });
  });

  it('getUserOrders returns orders for the given user', async () => {
    const service = await buildService({});
    prisma.order.findMany.mockResolvedValue([{ id: 'o1' }]);
    await expect(service.getUserOrders('u1')).resolves.toEqual([{ id: 'o1' }]);
  });
});