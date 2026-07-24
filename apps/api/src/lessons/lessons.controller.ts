import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard }   from '../auth/guards/jwt-auth.guard';
import { CurrentUser }    from '../auth/decorators/current-user.decorator';

@ApiTags('Lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lessons')
export class LessonsController {
  constructor(private lessons: LessonsService) {}

  @Get(':lessonId')
  getLesson(@Param('lessonId') lessonId: string, @CurrentUser() user: any) {
    return this.lessons.getLesson(lessonId, user.id);
  }

  @Get('course/:courseSlug')
  getCourseLessons(@Param('courseSlug') courseSlug: string, @CurrentUser() user: any) {
    return this.lessons.getCourseLessons(courseSlug, user.id);
  }
}
