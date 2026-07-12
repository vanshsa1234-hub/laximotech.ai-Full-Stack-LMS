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
      verificationToken: { upsert: jest.fn(), findFirst: jest.fn(), create: jest.fn(), deleteMany: jest.fn(), delete: jest.fn().mockResolvedValue({}) },
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

  describe('forgotPassword', () => {
    it('returns a generic message without creating a reset token when the email does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const result = await service.forgotPassword('nope@a.com');
      expect(result.message).toMatch(/if that email exists/i);
      expect(prisma.verificationToken.upsert).not.toHaveBeenCalled();
    });

    it('clears any stale token for the email, then creates a fresh reset token', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@a.com' });
      prisma.verificationToken.deleteMany.mockResolvedValue({ count: 1 });
      prisma.verificationToken.create.mockResolvedValue({});
      const result = await service.forgotPassword('a@a.com');
      expect(prisma.verificationToken.deleteMany).toHaveBeenCalledWith({ where: { identifier: 'a@a.com' } });
      expect(prisma.verificationToken.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ identifier: 'a@a.com' }) }),
      );
      expect(result.message).toMatch(/if that email exists/i);
    });
  });

  describe('resetPassword', () => {
    it('rejects an invalid or unknown reset token', async () => {
      prisma.verificationToken.findFirst.mockResolvedValue(null);
      await expect(
        service.resetPassword({ token: 'bad', email: 'a@a.com', newPassword: 'newpassword123' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects an expired reset token', async () => {
      prisma.verificationToken.findFirst.mockResolvedValue({ expires: new Date(Date.now() - 1000) });
      await expect(
        service.resetPassword({ token: 'tok', email: 'a@a.com', newPassword: 'newpassword123' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects a new password shorter than 8 characters', async () => {
      prisma.verificationToken.findFirst.mockResolvedValue({ expires: new Date(Date.now() + 60000) });
      await expect(
        service.resetPassword({ token: 'tok', email: 'a@a.com', newPassword: 'short' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects when the user no longer exists', async () => {
      prisma.verificationToken.findFirst.mockResolvedValue({ expires: new Date(Date.now() + 60000) });
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.resetPassword({ token: 'tok', email: 'a@a.com', newPassword: 'newpassword123' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('resets the password and deletes the used token on success', async () => {
      prisma.verificationToken.findFirst.mockResolvedValue({ expires: new Date(Date.now() + 60000) });
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@a.com' });
      prisma.account.upsert.mockResolvedValue({});

      const result = await service.resetPassword({ token: 'tok', email: 'a@a.com', newPassword: 'newpassword123' });

      expect(prisma.account.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { provider_providerAccountId: { provider: 'credentials', providerAccountId: 'a@a.com' } },
        }),
      );
      expect(prisma.verificationToken.delete).toHaveBeenCalledWith({
        where: { identifier_token: { identifier: 'a@a.com', token: 'tok' } },
      });
      expect(result.message).toMatch(/successful/i);
    });
  });

  describe('getProfile', () => {
    it('throws UnauthorizedException when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.getProfile('missing')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('reports hasPassword true when a credentials account exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@a.com' });
      prisma.account.findFirst.mockResolvedValue({ id: 'acc1' });
      const result = await service.getProfile('u1');
      expect(result.hasPassword).toBe(true);
    });

    it('reports hasPassword false when no credentials account exists (OAuth-only user)', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@a.com' });
      prisma.account.findFirst.mockResolvedValue(null);
      const result = await service.getProfile('u1');
      expect(result.hasPassword).toBe(false);
    });
  });
});