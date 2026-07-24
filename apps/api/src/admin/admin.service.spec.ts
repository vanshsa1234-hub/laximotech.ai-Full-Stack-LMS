import { Test } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: { count: jest.fn(), findMany: jest.fn() },
      course: { count: jest.fn() },
      enrollment: { count: jest.fn(), groupBy: jest.fn().mockResolvedValue([]), findMany: jest.fn() },
      order: {
        aggregate: jest.fn().mockResolvedValue({ _sum: { amount: null } }),
        findMany: jest.fn().mockResolvedValue([]),
        groupBy: jest.fn().mockResolvedValue([]),
        count: jest.fn(),
      },
      certificate: { count: jest.fn() },
      demoRequest: { count: jest.fn() },
      coupon: { create: jest.fn(), findMany: jest.fn(), update: jest.fn() },
      $transaction: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [AdminService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(AdminService);
  });

  afterEach(() => jest.clearAllMocks());

  it('getDashboardStats aggregates counts and converts paise to rupees', async () => {
    prisma.user.count.mockResolvedValue(10);
    prisma.course.count.mockResolvedValue(5);
    prisma.enrollment.count.mockResolvedValue(20);
    prisma.order.aggregate.mockResolvedValue({ _sum: { amount: 150000 } });
    prisma.certificate.count.mockResolvedValue(3);
    prisma.demoRequest.count.mockResolvedValue(2);

    const result = await service.getDashboardStats();
    expect(result.totalRevenuePaise).toBe(150000);
    expect(result.totalRevenueRs).toBe(1500);
    expect(result.totalStudents).toBe(10);
  });

  it('getDashboardStats defaults revenue to 0 when there are no paid orders', async () => {
    prisma.user.count.mockResolvedValue(0);
    prisma.course.count.mockResolvedValue(0);
    prisma.enrollment.count.mockResolvedValue(0);
    prisma.certificate.count.mockResolvedValue(0);
    prisma.demoRequest.count.mockResolvedValue(0);

    const result = await service.getDashboardStats();
    expect(result.totalRevenuePaise).toBe(0);
    expect(result.totalRevenueRs).toBe(0);
  });

  it('getAllStudents applies search filter and pagination', async () => {
    prisma.$transaction.mockResolvedValue([[{ id: 'u1' }], 1]);
    const result = await service.getAllStudents({ page: '2', search: 'john' });
    expect(result.page).toBe(2);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it('getAllStudents defaults to page 1 with no search', async () => {
    prisma.$transaction.mockResolvedValue([[], 0]);
    const result = await service.getAllStudents({});
    expect(result.page).toBe(1);
  });

  it('getAllOrders filters by status when provided', async () => {
    prisma.$transaction.mockResolvedValue([[{ id: 'o1' }], 1]);
    const result = await service.getAllOrders({ status: 'PAID' });
    expect(result.data).toEqual([{ id: 'o1' }]);
  });

  it('createCoupon uppercases the code and sets isActive true', async () => {
    prisma.coupon.create.mockResolvedValue({ id: 'c1' });
    await service.createCoupon({ code: 'save10', discountPct: 10 });
    expect(prisma.coupon.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ code: 'SAVE10', isActive: true }) }),
    );
  });

  it('createCoupon converts expiresAt string to a Date', async () => {
    prisma.coupon.create.mockResolvedValue({});
    await service.createCoupon({ code: 'X', discountPct: 5, expiresAt: '2027-01-01' });
    const arg = prisma.coupon.create.mock.calls[0][0];
    expect(arg.data.expiresAt).toBeInstanceOf(Date);
  });

  it('toggleCoupon updates isActive', async () => {
    prisma.coupon.update.mockResolvedValue({});
    await service.toggleCoupon('c1', false);
    expect(prisma.coupon.update).toHaveBeenCalledWith({ where: { id: 'c1' }, data: { isActive: false } });
  });

  it('getEnrollmentsByStudent returns enrollments for the given user', async () => {
    prisma.enrollment.findMany.mockResolvedValue([{ id: 'e1' }]);
    const result = await service.getEnrollmentsByStudent('u1');
    expect(prisma.enrollment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'u1' } }),
    );
    expect(result).toEqual([{ id: 'e1' }]);
  });
});
