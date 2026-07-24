import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EnrolledGuard } from '../auth/guards/enrolled.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Community')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, EnrolledGuard)
@Controller('community')
export class CommunityController {
  constructor(private community: CommunityService) {}

  // Feed
  @Get('feed')
  getFeed(@Query('cursor') cursor?: string, @Query('limit') limit?: string) {
    return this.community.getFeed(cursor, limit ? parseInt(limit) : 20);
  }

  @Post('posts')
  createPost(@CurrentUser() user: any, @Body() body: { content?: string; mediaUrl?: string; mediaType?: string }) {
    return this.community.createPost(user.id, body);
  }

  @Delete('posts/:id')
  deletePost(@CurrentUser() user: any, @Param('id') id: string) {
    return this.community.deletePost(user.id, id, user.role);
  }

  // Members directory
  @Get('members')
  getMembers(@CurrentUser() user: any, @Query('search') search?: string, @Query('cursor') cursor?: string, @Query('limit') limit?: string) {
    return this.community.getMembers(user.id, search, cursor, limit ? parseInt(limit) : 30);
  }

  // Public profile
  @Get('users/:id')
  getProfile(@CurrentUser() user: any, @Param('id') id: string) {
    return this.community.getPublicProfile(user.id, id);
  }

  // Friend requests
  @Post('friend-requests')
  sendRequest(@CurrentUser() user: any, @Body() body: { receiverId: string }) {
    return this.community.sendFriendRequest(user.id, body.receiverId);
  }

  @Get('friend-requests')
  myRequests(@CurrentUser() user: any) {
    return this.community.getMyFriendRequests(user.id);
  }

  @Post('friend-requests/:id/accept')
  accept(@CurrentUser() user: any, @Param('id') id: string) {
    return this.community.respondToFriendRequest(user.id, id, true);
  }

  @Post('friend-requests/:id/reject')
  reject(@CurrentUser() user: any, @Param('id') id: string) {
    return this.community.respondToFriendRequest(user.id, id, false);
  }

  @Get('friends')
  friends(@CurrentUser() user: any) {
    return this.community.getFriends(user.id);
  }

  // Direct messages
  @Get('conversations')
  conversations(@CurrentUser() user: any) {
    return this.community.getConversations(user.id);
  }

  @Get('messages/:userId')
  thread(@CurrentUser() user: any, @Param('userId') otherUserId: string) {
    return this.community.getThread(user.id, user.role, otherUserId);
  }

  @Post('messages')
  sendMessage(@CurrentUser() user: any, @Body() body: { receiverId: string; content?: string; mediaUrl?: string; mediaType?: string }) {
    return this.community.sendMessage(user.id, user.role, body);
  }
}
