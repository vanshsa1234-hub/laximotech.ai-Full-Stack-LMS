import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: string; pageSize?: string; tag?: string }) {
    const page     = Math.max(1, parseInt(query.page ?? '1'));
    const pageSize = Math.min(20, parseInt(query.pageSize ?? '9'));
    const skip     = (page - 1) * pageSize;

    const where: any = { isPublished: true, ...(query.tag && { tags: { some: { name: query.tag } } }) };

    const [posts, total] = await this.prisma.$transaction([
      this.prisma.blogPost.findMany({
        where, skip, take: pageSize,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true, slug: true, title: true, excerpt: true,
          coverImage: true, publishedAt: true,
          author: { select: { id: true, name: true, image: true } },
          tags:   { select: { name: true } },
        },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return { data: posts, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug, isPublished: true },
      include: {
        author: { select: { id: true, name: true, image: true, bio: true } },
        tags:   { select: { name: true } },
      },
    });
    if (!post) throw new NotFoundException(`Blog post "${slug}" not found.`);
    return post;
  }

  async create(authorId: string, data: {
    slug: string; title: string; excerpt: string; content: string;
    coverImage?: string; metaTitle?: string; metaDesc?: string; tags?: string[];
  }) {
    const { tags, ...rest } = data;
    return this.prisma.blogPost.create({
      data: {
        ...rest, authorId,
        isPublished: false,
        ...(tags && {
          tags: {
            connectOrCreate: tags.map(t => ({
              where:  { name: t },
              create: { name: t },
            })),
          },
        }),
      },
    });
  }

  async publish(id: string) {
    return this.prisma.blogPost.update({
      where: { id },
      data:  { isPublished: true, publishedAt: new Date() },
    });
  }

  async unpublish(id: string) {
    return this.prisma.blogPost.update({
      where: { id },
      data:  { isPublished: false },
    });
  }

  async update(id: string, data: Partial<{
    title: string; excerpt: string; content: string; coverImage: string;
    metaTitle: string; metaDesc: string; tags: string[];
  }>) {
    const { tags, ...rest } = data;
    return this.prisma.blogPost.update({
      where: { id },
      data: {
        ...rest,
        ...(tags && {
          tags: {
            set: [],
            connectOrCreate: tags.map(t => ({
              where:  { name: t },
              create: { name: t },
            })),
          },
        }),
      },
    });
  }

  async remove(id: string) {
    return this.prisma.blogPost.delete({ where: { id } });
  }

  // ── Admin ──────────────────────────────────────────────────
  async findAllAdmin(query: { page?: string; pageSize?: string; status?: string }) {
    const page     = Math.max(1, parseInt(query.page ?? '1'));
    const pageSize = Math.min(50, parseInt(query.pageSize ?? '20'));
    const skip     = (page - 1) * pageSize;
    const where: any = {
      ...(query.status === 'published' && { isPublished: true }),
      ...(query.status === 'draft' && { isPublished: false }),
    };

    const [posts, total] = await this.prisma.$transaction([
      this.prisma.blogPost.findMany({
        where, skip, take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, name: true } },
          tags:   { select: { name: true } },
        },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return { data: posts, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findById(id: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
      include: { tags: { select: { name: true } } },
    });
    if (!post) throw new NotFoundException(`Blog post not found.`);
    return post;
  }
}
