import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class InstructorsService {
  constructor(private prisma: PrismaService) {}

  // Anyone who can legitimately be attached to a course as its teacher —
  // real ADMIN and INSTRUCTOR users only, never placeholder text.
  async findAll() {
    return this.prisma.user.findMany({
      where: { role: { in: [Role.INSTRUCTOR, Role.ADMIN] } },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true, name: true, email: true, image: true, bio: true,
        phone: true, city: true, linkedinUrl: true, role: true, createdAt: true,
        _count: { select: { coursesCrated: true } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, image: true, bio: true,
        phone: true, city: true, linkedinUrl: true, role: true,
        coursesCrated: { select: { id: true, title: true, slug: true, isPublished: true } },
      },
    });
  }

  async create(data: {
    name: string; email: string; bio?: string; phone?: string;
    city?: string; linkedinUrl?: string; image?: string;
  }) {
    if (!data.name?.trim() || !data.email?.trim()) {
      throw new BadRequestException('Name and email are required.');
    }
    const existing = await this.prisma.user.findUnique({ where: { email: data.email.trim().toLowerCase() } });
    if (existing) throw new ConflictException('A user with this email already exists.');

    return this.prisma.user.create({
      data: {
        name:        data.name.trim(),
        email:       data.email.trim().toLowerCase(),
        role:        Role.INSTRUCTOR,
        bio:         data.bio?.trim() || null,
        phone:       data.phone?.trim() || null,
        city:        data.city?.trim() || null,
        linkedinUrl: data.linkedinUrl?.trim() || null,
        image:       data.image?.trim() || null,
      },
    });
  }

  async update(id: string, data: Partial<{
    name: string; bio: string; phone: string; city: string; linkedinUrl: string; image: string;
  }>) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async remove(id: string) {
    const courseCount = await this.prisma.course.count({ where: { instructorId: id } });
    if (courseCount > 0) {
      throw new BadRequestException(
        `Cannot remove this instructor — they are assigned to ${courseCount} course(s). Reassign those courses first.`,
      );
    }
    return this.prisma.user.delete({ where: { id } });
  }
}
