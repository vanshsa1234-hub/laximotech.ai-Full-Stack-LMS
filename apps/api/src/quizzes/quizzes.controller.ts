// C:\Users\LENOVO\Downloads\laximotech(project)\laximotech7\apps\api\src\quizzes\quizzes.controller.ts
import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { JwtAuthGuard }   from '../auth/guards/jwt-auth.guard';
import { RolesGuard }     from '../auth/guards/roles.guard';
import { Roles }          from '../auth/decorators/roles.decorator';
import { CurrentUser }    from '../auth/decorators/current-user.decorator';
import { Role }           from '@prisma/client';

@ApiTags('Quizzes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quizzes')
export class QuizzesController {
  constructor(private quizzes: QuizzesService) {}

  @Get('history/:courseId')
  history(@CurrentUser() user: any, @Param('courseId') courseId: string) {
    return this.quizzes.getUserQuizHistory(user.id, courseId);
  }

  @Get(':quizId')
  getQuiz(@Param('quizId') quizId: string, @CurrentUser() user: any) {
    return this.quizzes.getQuiz(quizId, user.id);
  }

  @Post(':quizId/submit')
  submit(
    @Param('quizId') quizId: string,
    @CurrentUser() user: any,
    @Body() body: { answers: number[]; timeTakenSec?: number },
  ) {
    return this.quizzes.submitQuiz(quizId, user.id, body.answers, body.timeTakenSec);
  }

  // Admin only
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @Post('lesson/:lessonId')
  createQuiz(@Param('lessonId') lessonId: string, @Body() body: any) {
    return this.quizzes.createQuiz(lessonId, body);
  }
}
