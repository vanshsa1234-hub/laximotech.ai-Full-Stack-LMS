import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

// Gates the Community feature: only students who have enrolled in at least
// one course can access it, plus ADMIN/INSTRUCTOR who always have access.
@Injectable()
export class EnrolledGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Please log in to continue.');
    if (user.role === Role.ADMIN || user.role === Role.INSTRUCTOR) return true;

    const count = await this.prisma.enrollment.count({ where: { userId: user.id } });
    if (count < 1) {
      throw new ForbiddenException('Enroll in at least one course to access the community.');
    }
    return true;
  }
}
