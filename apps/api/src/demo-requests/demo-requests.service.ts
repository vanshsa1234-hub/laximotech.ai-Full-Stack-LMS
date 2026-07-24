import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DemoRequestStatus } from '@prisma/client';

@Injectable()
export class DemoRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string; phone: string; email: string;
    topic: string; slot: string; mode: string;
  }) {
    if (!data.name || !data.phone || !data.email || !data.topic || !data.slot) {
      throw new BadRequestException('Missing required fields');
    }
    return this.prisma.demoRequest.create({
      data: {
        name:  data.name.trim(),
        phone: data.phone.trim(),
        email: data.email.trim().toLowerCase(),
        topic: data.topic,
        slot:  data.slot,
        mode:  data.mode === 'offline' ? 'offline' : 'online',
      },
    });
  }

  async findAll(query: { page?: string; status?: string }) {
    const page     = Math.max(1, parseInt(query.page ?? '1'));
    const pageSize = 20;
    const skip     = (page - 1) * pageSize;
    const where: any = { ...(query.status && { status: query.status as DemoRequestStatus }) };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.demoRequest.findMany({
        where, skip, take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.demoRequest.count({ where }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async updateStatus(id: string, status: DemoRequestStatus) {
    return this.prisma.demoRequest.update({ where: { id }, data: { status } });
  }
}
