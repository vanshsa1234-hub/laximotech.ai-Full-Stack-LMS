import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { Public }       from '../auth/decorators/public.decorator';
import { JwtAuthGuard }  from '../auth/guards/jwt-auth.guard';
import { CurrentUser }   from '../auth/decorators/current-user.decorator';

@ApiTags('Reviews')
@Controller()
export class ReviewsController {
  constructor(private reviews: ReviewsService) {}

  @Public()
  @Get('reviews/featured')
  featured() { return this.reviews.featured(); }

  @Public()
  @Get('platform-stats')
  platformStats() { return this.reviews.platformStats(); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('courses/:courseId/reviews')
  upsert(@CurrentUser() user: any, @Param('courseId') courseId: string, @Body() body: { rating: number; comment?: string }) {
    return this.reviews.upsert(user.id, courseId, body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('courses/:courseId/reviews/mine')
  myReview(@CurrentUser() user: any, @Param('courseId') courseId: string) {
    return this.reviews.myReview(user.id, courseId);
  }
}
