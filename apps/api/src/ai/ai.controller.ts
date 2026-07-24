import { Controller, Post, Get, Body, Param, Query, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response }      from 'express';
import { AiService }     from './ai.service';
import { Public }        from '../auth/decorators/public.decorator';
import { JwtAuthGuard }  from '../auth/guards/jwt-auth.guard';
import { CurrentUser }   from '../auth/decorators/current-user.decorator';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private ai: AiService) {}

  // Homepage assistant — usable before login. Rate-limited by IP since
  // there's no logged-in user to key off of.
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('public-chat')
  streamPublicChat(
    @Body() body: { messages: { role: 'user' | 'assistant'; content: string }[] },
    @Res() res: Response,
  ) {
    return this.ai.streamPublicChat(body.messages, res);
  }

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
