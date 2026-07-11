import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prisma: any;

  beforeEach(async () => {
    prisma = { user: { findUnique: jest.fn() } };
    const config = { get: jest.fn().mockReturnValue('test-secret') };

    const moduleRef = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    strategy = moduleRef.get(JwtStrategy);
  });

  afterEach(() => jest.clearAllMocks());

  it('throws UnauthorizedException when the payload has neither id nor sub', async () => {
    await expect(strategy.validate({})).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws UnauthorizedException when the user no longer exists', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(strategy.validate({ id: 'u1' })).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('resolves the user using payload.id when present', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'STUDENT' });
    const result = await strategy.validate({ id: 'u1' });
    expect(result).toEqual({ id: 'u1', role: 'STUDENT' });
    expect(prisma.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'u1' } }));
  });

  it('falls back to payload.sub when id is absent (NextAuth default JWT shape)', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u2', role: 'ADMIN' });
    await strategy.validate({ sub: 'u2' });
    expect(prisma.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'u2' } }));
  });
});
