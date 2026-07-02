import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CareerPathsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.careerPath.findMany({
      orderBy: { order: 'asc' },
      include: {
        courses: {
          orderBy: { step: 'asc' },
          include: {
            course: {
              select: { id: true, slug: true, title: true, shortDesc: true,
                thumbnailUrl: true, price: true, durationHrs: true, level: true, category: true }
            },
          },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    const path = await this.prisma.careerPath.findUnique({
      where: { slug },
      include: {
        courses: {
          orderBy: { step: 'asc' },
          include: {
            course: {
              select: { id: true, slug: true, title: true, shortDesc: true, description: true,
                thumbnailUrl: true, price: true, durationHrs: true, totalLessons: true,
                level: true, category: true,
                instructor: { select: { name: true } },
                _count: { select: { enrollments: true } } }
            },
          },
        },
      },
    });
    if (!path) throw new NotFoundException(`Career path "${slug}" not found.`);
    return path;
  }
}
