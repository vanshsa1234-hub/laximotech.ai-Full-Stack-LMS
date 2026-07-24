import {
  Injectable, UnauthorizedException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) { }

  async register(data: { name: string; email: string; password: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('An account with this email already exists.');
    if (data.password.length < 8) throw new BadRequestException('Password must be at least 8 characters.');

    const hash = await bcrypt.hash(data.password, 12);
    const user = await this.prisma.user.create({
      data: { name: data.name.trim(), email: data.email.toLowerCase().trim(), emailVerified: new Date() },
    });
    await this.prisma.account.create({
      data: { userId: user.id, type: 'credentials', provider: 'credentials', providerAccountId: user.email, access_token: hash },
    });
    const token = this.generateToken(user.id, user.email, user.role);
    return { user: this.sanitizeUser(user), token, message: 'Account created successfully!' };
  }

  async login(data: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: data.email.toLowerCase().trim() } });
    if (!user) throw new UnauthorizedException('Invalid email or password.');

    const account = await this.prisma.account.findFirst({ where: { userId: user.id, provider: 'credentials' } });
    if (!account?.access_token) {
      throw new UnauthorizedException('This account uses Google or magic-link login. Please use that method.');
    }

    const valid = await bcrypt.compare(data.password, account.access_token);
    if (!valid) throw new UnauthorizedException('Invalid email or password.');

    await this.prisma.user.update({ where: { id: user.id }, data: { lastActiveAt: new Date() } });
    const token = this.generateToken(user.id, user.email, user.role);
    return { user: this.sanitizeUser(user), token, message: 'Login successful!' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'If that email exists, a reset link has been sent.' };

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await this.prisma.verificationToken.create({
      data: { identifier: email, token: resetToken, expires: resetExpiry },
    });
    console.log(`[DEV] Reset token for ${email}: ${resetToken}`);
    return { message: 'If that email exists, a reset link has been sent.' };
  }

  async resetPassword(data: { token: string; email: string; newPassword: string }) {
    const record = await this.prisma.verificationToken.findFirst({ where: { identifier: data.email, token: data.token } });
    if (!record || record.expires < new Date()) throw new BadRequestException('Reset link is invalid or expired.');
    if (data.newPassword.length < 8) throw new BadRequestException('Password must be at least 8 characters.');

    const user = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new BadRequestException('User not found.');

    const hash = await bcrypt.hash(data.newPassword, 12);
    await this.prisma.account.upsert({
      where: { provider_providerAccountId: { provider: 'credentials', providerAccountId: data.email } },
      update: { access_token: hash },
      create: { userId: user.id, type: 'credentials', provider: 'credentials', providerAccountId: data.email, access_token: hash },
    });
    await this.prisma.verificationToken.delete({
      where: { identifier_token: { identifier: data.email, token: data.token } },
    }).catch(() => { });
    return { message: 'Password reset successful. You can now log in.' };
  }

  async changePassword(userId: string, data: { currentPassword: string; newPassword: string }) {
    const account = await this.prisma.account.findFirst({ where: { userId, provider: 'credentials' } });
    if (!account?.access_token) throw new BadRequestException('This account uses OAuth login. Password change not applicable.');
    const valid = await bcrypt.compare(data.currentPassword, account.access_token);
    if (!valid) throw new UnauthorizedException('Current password is incorrect.');
    if (data.newPassword.length < 8) throw new BadRequestException('New password must be at least 8 characters.');
    const hash = await bcrypt.hash(data.newPassword, 12);
    await this.prisma.account.update({ where: { id: account.id }, data: { access_token: hash } });
    return { message: 'Password changed successfully.' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, image: true, role: true,
        xpPoints: true, streakDays: true, city: true, bio: true,
        linkedinUrl: true, createdAt: true,
        _count: { select: { enrollments: true, certificates: true } },
      },
    });
    if (!user) throw new UnauthorizedException('User not found.');
    const hasPassword = await this.prisma.account.findFirst({ where: { userId, provider: 'credentials' } });
    return { ...user, hasPassword: !!hasPassword };
  }

  generateToken(userId: string, email: string, role: string): string {
    return this.jwt.sign({ sub: userId, email, role });
  }

  private sanitizeUser(user: any) { return user; }
}