import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { DemoRequestsService } from './demo-requests.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DemoRequestsService', () => {
  let service: DemoRequestsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      demoRequest: { create: jest.fn(), findMany: jest.fn(), count: jest.fn(), update: jest.fn() },
      $transaction: jest.fn(),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [DemoRequestsService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(DemoRequestsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('rejects when required fields are missing', async () => {
    await expect(
      service.create({ name: '', phone: '999', email: 'a@a.com', topic: 't', slot: 's', mode: 'online' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates a demo request, normalizing mode to online/offline', async () => {
    prisma.demoRequest.create.mockResolvedValue({});
    await service.create({ name: 'A', phone: '999', email: 'A@A.com', topic: 't', slot: 's', mode: 'weird-value' });
    const arg = prisma.demoRequest.create.mock.calls[0][0];
    expect(arg.data.mode).toBe('online');
    expect(arg.data.email).toBe('a@a.com');
  });

  it('preserves "offline" mode exactly', async () => {
    prisma.demoRequest.create.mockResolvedValue({});
    await service.create({ name: 'A', phone: '999', email: 'a@a.com', topic: 't', slot: 's', mode: 'offline' });
    expect(prisma.demoRequest.create.mock.calls[0][0].data.mode).toBe('offline');
  });

  it('findAll paginates and filters by status', async () => {
    prisma.$transaction.mockResolvedValue([[{ id: 'd1' }], 1]);
    const result = await service.findAll({ status: 'PENDING' });
    expect(result.data).toEqual([{ id: 'd1' }]);
  });

  it('updateStatus updates the status field', async () => {
    prisma.demoRequest.update.mockResolvedValue({});
    await service.updateStatus('d1', 'CONTACTED' as any);
    expect(prisma.demoRequest.update).toHaveBeenCalledWith({ where: { id: 'd1' }, data: { status: 'CONTACTED' } });
  });
});
