import { Test } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
      account: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn(), upsert: jest.fn() },
      verificationToken: { upsert: jest.fn(), findFirst: jest.fn(), delete: jest.fn().mockResolvedValue({}) },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('signed.jwt.token') } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('rejects registration when the email is already in use', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@a.com' });
      await expect(
        service.register({ name: 'A', email: 'a@a.com', password: 'password123' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejects passwords shorter than 8 characters', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.register({ name: 'A', email: 'a@a.com', password: 'short' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('creates a user + credentials account and returns a signed token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ id: 'u1', email: 'a@a.com', role: 'STUDENT' });
      prisma.account.create.mockResolvedValue({});

      const result = await service.register({ name: '  A  ', email: 'A@A.com', password: 'password123' });

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ name: 'A', email: 'a@a.com' }) }),
      );
      expect(prisma.account.create).toHaveBeenCalled();
      expect(result.token).toBe('signed.jwt.token');
    });
  });

  describe('login', () => {
    it('rejects unknown emails without revealing whether the account exists', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login({ email: 'nope@a.com', password: 'x' })).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects OAuth-only accounts trying to log in with a password', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@a.com' });
      prisma.account.findFirst.mockResolvedValue(null);
      await expect(service.login({ email: 'a@a.com', password: 'x' })).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects an incorrect password', async () => {
      const hash = await bcrypt.hash('correctpassword', 4);
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@a.com' });
      prisma.account.findFirst.mockResolvedValue({ access_token: hash });
      await expect(service.login({ email: 'a@a.com', password: 'wrongpassword' })).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('logs in successfully with the correct password', async () => {
      const hash = await bcrypt.hash('correctpassword', 4);
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@a.com', role: 'STUDENT' });
      prisma.account.findFirst.mockResolvedValue({ access_token: hash });
      prisma.user.update.mockResolvedValue({});

      const result = await service.login({ email: 'a@a.com', password: 'correctpassword' });
      expect(result.token).toBe('signed.jwt.token');
    });
  });

  describe('security regression: OAuth sync account takeover', () => {
    it('no longer exposes a syncUser method that mints a JWT from an unverified email', () => {
      // This previously allowed anyone to POST any email address and receive
      // a valid JWT for that (possibly pre-existing) account — full
      // account takeover with zero verification. Confirms it stays removed.
      expect((service as any).syncUser).toBeUndefined();
    });
  });

  describe('changePassword', () => {
    it('rejects when the current password is wrong', async () => {
      const hash = await bcrypt.hash('realpassword', 4);
      prisma.account.findFirst.mockResolvedValue({ id: 'acc1', access_token: hash });
      await expect(
        service.changePassword('u1', { currentPassword: 'wrong', newPassword: 'newpassword123' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('updates the password hash when the current password is correct', async () => {
      const hash = await bcrypt.hash('realpassword', 4);
      prisma.account.findFirst.mockResolvedValue({ id: 'acc1', access_token: hash });
      prisma.account.update.mockResolvedValue({});

      await service.changePassword('u1', { currentPassword: 'realpassword', newPassword: 'newpassword123' });
      expect(prisma.account.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'acc1' } }),
      );
    });
  });
});
