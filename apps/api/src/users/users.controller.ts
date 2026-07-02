import { Controller, Get, Patch, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService }  from './users.service';
import { JwtAuthGuard }  from '../auth/guards/jwt-auth.guard';
import { CurrentUser }   from '../auth/decorators/current-user.decorator';
import { Public }        from '../auth/decorators/public.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user: any) {
    return this.users.getProfile(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me/stats')
  getStats(@CurrentUser() user: any) {
    return this.users.getDashboardStats(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateProfile(@CurrentUser() user: any, @Body() body: any) {
    return this.users.updateProfile(user.id, body);
  }

  @Public()
  @Get('leaderboard')
  getLeaderboard(@Query('limit') limit?: string) {
    return this.users.getLeaderboard(limit ? parseInt(limit) : 20);
  }
}
