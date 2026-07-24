import { Test } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: any;

  beforeEach(async () => {
    service = {
      createOrder: jest.fn().mockResolvedValue({}),
      verifyPayment: jest.fn().mockResolvedValue({}),
      validateCoupon: jest.fn().mockResolvedValue({}),
      getUserOrders: jest.fn().mockResolvedValue([]),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: service }],
    }).compile();
    controller = moduleRef.get(OrdersController);
  });

  it('create forwards user id, courseId, and couponCode', () => {
    controller.create({ id: 'u1' }, { courseId: 'c1', couponCode: 'SAVE10' });
    expect(service.createOrder).toHaveBeenCalledWith('u1', 'c1', 'SAVE10');
  });

  it('verify forwards the full body', () => {
    const body = { razorpayOrderId: 'o', razorpayPaymentId: 'p', razorpaySignature: 's' };
    controller.verify(body);
    expect(service.verifyPayment).toHaveBeenCalledWith(body);
  });

  it('validateCoupon forwards courseId and couponCode', () => {
    controller.validateCoupon({ courseId: 'c1', couponCode: 'X' });
    expect(service.validateCoupon).toHaveBeenCalledWith('c1', 'X');
  });

  it('myOrders forwards user id', () => {
    controller.myOrders({ id: 'u1' });
    expect(service.getUserOrders).toHaveBeenCalledWith('u1');
  });
});
