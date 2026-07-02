import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Validates JWTs issued by NextAuth (AUTH_SECRET) for normal app requests.
 * NextAuth JWTs use payload shape: { id, role, email, name, picture, sub, iat, exp, jti }
 * (NextAuth v5 JWT callback puts custom fields directly on the token).
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Must match AUTH_SECRET in apps/web/.env.local exactly —
      // this is what makes "one login, works everywhere" possible.
      secretOrKey: config.get<string>('AUTH_SECRET') ?? config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // NextAuth JWT puts user id under `id` (set in jwt callback) or `sub`
    const userId = payload.id ?? payload.sub;
    if (!userId) throw new UnauthorizedException('Invalid token.');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, name: true, role: true,
        image: true, xpPoints: true, streakDays: true,
      },
    });

    if (!user) throw new UnauthorizedException('User not found.');
    return user;
  }
}
