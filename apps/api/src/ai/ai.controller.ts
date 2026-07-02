import { Controller, Post, Get, Body, Param, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response }      from 'express';
import { AiService }     from './ai.service';
import { JwtAuthGuard }  from '../auth/guards/jwt-auth.guard';
import { CurrentUser }   from '../auth/decorators/current-user.decorator';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private ai: AiService) {}

  @Post('chat')
  streamChat(
    @CurrentUser() user: any,
    @Body() body: {
      courseId:  string;
      lessonId?: string;
      messages:  { role: 'user' | 'assistant'; content: string }[];
    },
    @Res() res: Response,
  ) {
    return this.ai.streamChat(user.id, body.courseId, body.lessonId ?? null, body.messages, res);
  }

  @Get('history/:courseId')
  getHistory(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
    @Query('lessonId') lessonId?: string,
  ) {
    return this.ai.getChatHistory(user.id, courseId, lessonId);
  }
}
