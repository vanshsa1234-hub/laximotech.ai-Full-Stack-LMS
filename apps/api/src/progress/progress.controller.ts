import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { JwtAuthGuard }    from '../auth/guards/jwt-auth.guard';
import { CurrentUser }     from '../auth/decorators/current-user.decorator';

@ApiTags('Progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private progress: ProgressService) {}

  @Post()
  update(
    @CurrentUser() user: any,
    @Body() body: { lessonId: string; watchedSeconds: number; bookmarkSeconds?: number },
  ) {
    return this.progress.updateProgress(user.id, body.lessonId, body.watchedSeconds, body.bookmarkSeconds);
  }

  @Get('course/:courseId')
  getCourseProgress(@CurrentUser() user: any, @Param('courseId') courseId: string) {
    return this.progress.getCourseProgress(user.id, courseId);
  }
}
