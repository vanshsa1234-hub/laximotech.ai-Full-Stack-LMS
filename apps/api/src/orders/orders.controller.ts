import { Controller, Post, Get, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService }   from './orders.service';
import { JwtAuthGuard }    from '../auth/guards/jwt-auth.guard';
import { CurrentUser }     from '../auth/decorators/current-user.decorator';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() body: { courseId: string; couponCode?: string }) {
    return this.orders.createOrder(user.id, body.courseId, body.couponCode);
  }

  @Post('verify')
  verify(@Body() body: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) {
    return this.orders.verifyPayment(body);
  }

  @Post('validate-coupon')
  validateCoupon(@Body() body: { courseId: string; couponCode: string }) {
    return this.orders.validateCoupon(body.courseId, body.couponCode);
  }

  @Get('me')
  myOrders(@CurrentUser() user: any) {
    return this.orders.getUserOrders(user.id);
  }
}
