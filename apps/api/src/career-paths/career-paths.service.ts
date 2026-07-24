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

  // ── Admin ──────────────────────────────────────────────────
  async findById(id: string) {
    const path = await this.prisma.careerPath.findUnique({
      where: { id },
      include: {
        courses: {
          orderBy: { step: 'asc' },
          include: { course: { select: { id: true, slug: true, title: true, thumbnailUrl: true } } },
        },
      },
    });
    if (!path) throw new NotFoundException(`Career path not found.`);
    return path;
  }

  async create(data: {
    slug: string; title: string; description: string;
    avgSalary: string; iconUrl?: string; order?: number;
  }) {
    return this.prisma.careerPath.create({
      data: {
        slug:        data.slug,
        title:       data.title,
        description: data.description,
        avgSalary:   data.avgSalary,
        iconUrl:     data.iconUrl,
        order:       data.order ?? 0,
      },
    });
  }

  async update(id: string, data: Partial<{
    title: string; description: string; avgSalary: string; iconUrl: string; order: number;
  }>) {
    return this.prisma.careerPath.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.careerPath.delete({ where: { id } });
  }

  // ── Path <-> Course management ───────────────────────────────
  async addCourse(pathId: string, data: { courseId: string; step: number; label: string }) {
    return this.prisma.careerPathCourse.create({
      data: {
        careerPathId: pathId,
        courseId:     data.courseId,
        step:         Number(data.step),
        label:        data.label,
      },
    });
  }

  async removeCourse(entryId: string) {
    return this.prisma.careerPathCourse.delete({ where: { id: entryId } });
  }
}
