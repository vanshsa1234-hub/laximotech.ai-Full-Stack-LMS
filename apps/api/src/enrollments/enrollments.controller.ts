import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard }       from '../auth/guards/jwt-auth.guard';
import { CurrentUser }        from '../auth/decorators/current-user.decorator';

@ApiTags('Enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private enrollments: EnrollmentsService) {}

  @Get('me')
  getMyEnrollments(@CurrentUser() user: any) {
    return this.enrollments.getMyEnrollments(user.id);
  }

  @Get('check/:courseId')
  checkEnrollment(@CurrentUser() user: any, @Param('courseId') courseId: string) {
    return this.enrollments.checkEnrollment(user.id, courseId);
  }

  @Get('progress/:courseSlug')
  getProgress(@CurrentUser() user: any, @Param('courseSlug') courseSlug: string) {
    return this.enrollments.getEnrollmentWithProgress(user.id, courseSlug);
  }
}
