import { Test } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

describe('AdminController', () => {
  let controller: AdminController;
  let service: any;

  beforeEach(async () => {
    service = {
      getDashboardStats: jest.fn().mockResolvedValue({}),
      getAllStudents: jest.fn().mockResolvedValue({}),
      getEnrollmentsByStudent: jest.fn().mockResolvedValue({}),
      getAllOrders: jest.fn().mockResolvedValue({}),
      createCoupon: jest.fn().mockResolvedValue({}),
      getAllCoupons: jest.fn().mockResolvedValue({}),
      toggleCoupon: jest.fn().mockResolvedValue({}),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useValue: service }],
    }).compile();
    controller = moduleRef.get(AdminController);
  });

  it('getStats delegates to service', () => {
    controller.getStats();
    expect(service.getDashboardStats).toHaveBeenCalled();
  });

  it('getStudents forwards the query', () => {
    controller.getStudents({ page: '1' });
    expect(service.getAllStudents).toHaveBeenCalledWith({ page: '1' });
  });

  it('getStudentEnrollments forwards the userId', () => {
    controller.getStudentEnrollments('u1');
    expect(service.getEnrollmentsByStudent).toHaveBeenCalledWith('u1');
  });

  it('getOrders forwards the query', () => {
    controller.getOrders({ status: 'PAID' });
    expect(service.getAllOrders).toHaveBeenCalledWith({ status: 'PAID' });
  });

  it('createCoupon forwards the body', () => {
    controller.createCoupon({ code: 'X' });
    expect(service.createCoupon).toHaveBeenCalledWith({ code: 'X' });
  });

  it('getCoupons delegates to service', () => {
    controller.getCoupons();
    expect(service.getAllCoupons).toHaveBeenCalled();
  });

  it('toggleCoupon forwards id and isActive', () => {
    controller.toggleCoupon('c1', { isActive: false });
    expect(service.toggleCoupon).toHaveBeenCalledWith('c1', false);
  });
});
