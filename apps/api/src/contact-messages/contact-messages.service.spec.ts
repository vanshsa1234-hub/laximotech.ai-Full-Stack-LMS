import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ContactMessagesService } from './contact-messages.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ContactMessagesService', () => {
  let service: ContactMessagesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      contactMessage: { create: jest.fn(), findMany: jest.fn(), count: jest.fn(), update: jest.fn() },
      $transaction: jest.fn(),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [ContactMessagesService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(ContactMessagesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('rejects when name is missing', async () => {
    await expect(service.create({ name: '  ', email: 'a@a.com', subject: 's', message: 'm' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects when email is missing', async () => {
    await expect(service.create({ name: 'A', email: '', subject: 's', message: 'm' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects when message is missing', async () => {
    await expect(service.create({ name: 'A', email: 'a@a.com', subject: 's', message: '   ' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('trims and lowercases fields, defaults subject when blank', async () => {
    prisma.contactMessage.create.mockResolvedValue({});
    await service.create({ name: '  A  ', email: '  A@A.COM  ', subject: '  ', message: '  hi  ' });
    expect(prisma.contactMessage.create).toHaveBeenCalledWith({
      data: { name: 'A', email: 'a@a.com', subject: 'General inquiry', message: 'hi' },
    });
  });

  it('findAll paginates and filters by status', async () => {
    prisma.$transaction.mockResolvedValue([[{ id: 'm1' }], 1]);
    const result = await service.findAll({ status: 'PENDING' });
    expect(result.data).toEqual([{ id: 'm1' }]);
  });

  it('updateStatus updates the status field', async () => {
    prisma.contactMessage.update.mockResolvedValue({});
    await service.updateStatus('m1', 'RESOLVED' as any);
    expect(prisma.contactMessage.update).toHaveBeenCalledWith({ where: { id: 'm1' }, data: { status: 'RESOLVED' } });
  });
});
