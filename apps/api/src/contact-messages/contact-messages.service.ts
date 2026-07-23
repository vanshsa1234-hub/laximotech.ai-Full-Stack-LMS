import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContactMessageStatus } from '@prisma/client';

@Injectable()
export class ContactMessagesService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; email: string; subject: string; message: string }) {
    if (!data.name?.trim() || !data.email?.trim() || !data.message?.trim()) {
      throw new BadRequestException('Name, email, and message are required.');
    }
    return this.prisma.contactMessage.create({
      data: {
        name:    data.name.trim(),
        email:   data.email.trim().toLowerCase(),
        subject: data.subject?.trim() || 'General inquiry',
        message: data.message.trim(),
      },
    });
  }

  async findAll(query: { page?: string; status?: string }) {
    const page     = Math.max(1, parseInt(query.page ?? '1'));
    const pageSize = 20;
    const skip     = (page - 1) * pageSize;
    const where: any = { ...(query.status && { status: query.status as ContactMessageStatus }) };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.contactMessage.findMany({ where, skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
      this.prisma.contactMessage.count({ where }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async updateStatus(id: string, status: ContactMessageStatus) {
    return this.prisma.contactMessage.update({ where: { id }, data: { status } });
  }
}
