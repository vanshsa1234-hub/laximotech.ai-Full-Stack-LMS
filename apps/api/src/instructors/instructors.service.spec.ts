import { Test } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { InstructorsService } from './instructors.service';
import { PrismaService } from '../prisma/prisma.service';

describe('InstructorsService', () => {
  let service: InstructorsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
      course: { count: jest.fn() },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [InstructorsService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(InstructorsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('findAll returns admins and instructors only', async () => {
    prisma.user.findMany.mockResolvedValue([{ id: 'i1' }]);
    await service.findAll();
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { role: { in: ['INSTRUCTOR', 'ADMIN'] } } }),
    );
  });

  it('create rejects missing name/email', async () => {
    await expect(service.create({ name: '', email: 'a@a.com' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('create rejects a duplicate email', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'existing' });
    await expect(service.create({ name: 'A', email: 'a@a.com' })).rejects.toBeInstanceOf(ConflictException);
  });

  it('create normalizes email and sets role INSTRUCTOR', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({});
    await service.create({ name: '  A  ', email: '  A@A.COM  ' });
    const arg = prisma.user.create.mock.calls[0][0];
    expect(arg.data.email).toBe('a@a.com');
    expect(arg.data.role).toBe('INSTRUCTOR');
  });

  it('update forwards partial data', async () => {
    prisma.user.update.mockResolvedValue({});
    await service.update('i1', { bio: 'New bio' });
    expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 'i1' }, data: { bio: 'New bio' } });
  });

  it('remove blocks deletion when the instructor has active courses', async () => {
    prisma.course.count.mockResolvedValue(3);
    await expect(service.remove('i1')).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it('remove deletes the instructor when they have no courses', async () => {
    prisma.course.count.mockResolvedValue(0);
    prisma.user.delete.mockResolvedValue({});
    await service.remove('i1');
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'i1' } });
  });
});
