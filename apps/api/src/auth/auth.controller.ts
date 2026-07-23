import { Controller, Post, Get, Body, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService }   from './auth.service';
import { JwtAuthGuard }  from './guards/jwt-auth.guard';
import { CurrentUser }   from './decorators/current-user.decorator';
import { Public }        from './decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  /** Register with email + password */
  @Public()
  @Post('register')
  register(@Body() body: { name: string; email: string; password: string }) {
    return this.auth.register(body);
  }

  /** Login with email + password */
  @Public()
  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body);
  }

  /** Forgot password — sends reset link */
  @Public()
  @Post('forgot-password')
  forgotPassword(@Body() body: { email: string }) {
    return this.auth.forgotPassword(body.email);
  }

  /** Reset password using token from email */
  @Public()
  @Post('reset-password')
  resetPassword(@Body() body: { token: string; email: string; newPassword: string }) {
    return this.auth.resetPassword(body);
  }

  /** Change password (must be logged in) */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(
    @CurrentUser() user: any,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.auth.changePassword(user.id, body);
  }

  /** Get current user profile */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: any) {
    return this.auth.getProfile(user.id);
  }
}