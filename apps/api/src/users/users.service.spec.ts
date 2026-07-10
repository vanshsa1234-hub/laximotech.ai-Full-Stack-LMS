import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn(), update: jest.fn(), findMany: jest.fn() },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getProfile', () => {
    it('throws NotFoundException when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.getProfile('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns the user when found', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', name: 'A' });
      await expect(service.getProfile('u1')).resolves.toEqual({ id: 'u1', name: 'A' });
    });
  });

  describe('updateProfile — mass-assignment regression', () => {
    it('only forwards the whitelisted profile fields to Prisma, even if extra fields are injected', async () => {
      prisma.user.update.mockResolvedValue({ id: 'u1' });

      const maliciousPayload: any = {
        name: 'A',
        bio: 'hi',
        // Attempted privilege escalation / injection via extra keys:
        role: 'ADMIN',
        id: 'someone-elses-id',
        xpPoints: 999999,
        email: 'hijacked@evil.com',
      };

      await service.updateProfile('u1', maliciousPayload);

      const callArg = prisma.user.update.mock.calls[0][0];
      expect(callArg.where).toEqual({ id: 'u1' });
      expect(callArg.data).not.toHaveProperty('role');
      expect(callArg.data).not.toHaveProperty('xpPoints');
      expect(callArg.data).not.toHaveProperty('email');
      expect(callArg.data).not.toHaveProperty('id');
      expect(callArg.data.name).toBe('A');
      expect(callArg.data.bio).toBe('hi');
    });

    it('updates the target user identified by userId, not by any id in the payload', async () => {
      prisma.user.update.mockResolvedValue({ id: 'u1' });
      await service.updateProfile('u1', { name: 'New Name' } as any);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'u1' } }),
      );
    });
  });
});
