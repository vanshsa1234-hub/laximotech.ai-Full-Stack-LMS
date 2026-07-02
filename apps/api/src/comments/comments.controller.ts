import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { JwtAuthGuard }    from '../auth/guards/jwt-auth.guard';
import { CurrentUser }     from '../auth/decorators/current-user.decorator';
import { Public }          from '../auth/decorators/public.decorator';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private comments: CommentsService) {}

  @Public()
  @Get('lesson/:lessonId')
  getLessonComments(@Param('lessonId') lessonId: string) { return this.comments.getLessonComments(lessonId); }

  @Public()
  @Get('replies/:parentId')
  getReplies(@Param('parentId') parentId: string) { return this.comments.getReplies(parentId); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: any, @Body() body: any) { return this.comments.createComment(user.id, body); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/vote')
  vote(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { isUpvote: boolean }) {
    return this.comments.voteComment(user.id, id, body.isUpvote);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.comments.deleteComment(user.id, id, user.role);
  }
}
