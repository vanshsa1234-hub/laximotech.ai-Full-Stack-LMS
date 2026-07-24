import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard }   from '../auth/guards/roles.guard';
import { Roles }        from '../auth/decorators/roles.decorator';
import { Role }         from '@prisma/client';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('stats')
  getStats() { return this.admin.getDashboardStats(); }

  @Get('students')
  getStudents(@Query() q: Record<string, string>) { return this.admin.getAllStudents(q); }

  @Get('students/:userId/enrollments')
  getStudentEnrollments(@Param('userId') userId: string) { return this.admin.getEnrollmentsByStudent(userId); }

  @Get('orders')
  getOrders(@Query() q: Record<string, string>) { return this.admin.getAllOrders(q); }

  @Post('coupons')
  createCoupon(@Body() body: any) { return this.admin.createCoupon(body); }

  @Get('coupons')
  getCoupons() { return this.admin.getAllCoupons(); }

  @Patch('coupons/:id/toggle')
  toggleCoupon(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    return this.admin.toggleCoupon(id, body.isActive);
  }
}
