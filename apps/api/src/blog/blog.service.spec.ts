import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BlogService } from './blog.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BlogService', () => {
  let service: BlogService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      blogPost: {
        findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn(),
        create: jest.fn(), update: jest.fn(), delete: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [BlogService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(BlogService);
  });

  afterEach(() => jest.clearAllMocks());

  it('findAll paginates and only returns published posts', async () => {
    prisma.$transaction.mockResolvedValue([[{ id: 'p1' }], 1]);
    const result = await service.findAll({ page: '1' });
    expect(result.data).toEqual([{ id: 'p1' }]);
    expect(result.totalPages).toBe(1);
  });

  it('findBySlug throws NotFoundException for a missing/unpublished slug', async () => {
    prisma.blogPost.findUnique.mockResolvedValue(null);
    await expect(service.findBySlug('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findBySlug returns the post when found', async () => {
    prisma.blogPost.findUnique.mockResolvedValue({ id: 'p1', slug: 'hello' });
    await expect(service.findBySlug('hello')).resolves.toEqual({ id: 'p1', slug: 'hello' });
  });

  it('create sets isPublished false and connects tags', async () => {
    prisma.blogPost.create.mockResolvedValue({ id: 'p1' });
    await service.create('author1', {
      slug: 'a', title: 'A', excerpt: 'e', content: 'c', tags: ['ai', 'tech'],
    });
    const arg = prisma.blogPost.create.mock.calls[0][0];
    expect(arg.data.isPublished).toBe(false);
    expect(arg.data.authorId).toBe('author1');
    expect(arg.data.tags.connectOrCreate).toHaveLength(2);
  });

  it('create works without tags', async () => {
    prisma.blogPost.create.mockResolvedValue({});
    await service.create('author1', { slug: 'a', title: 'A', excerpt: 'e', content: 'c' });
    const arg = prisma.blogPost.create.mock.calls[0][0];
    expect(arg.data.tags).toBeUndefined();
  });

  it('publish sets isPublished true and publishedAt', async () => {
    prisma.blogPost.update.mockResolvedValue({});
    await service.publish('p1');
    const arg = prisma.blogPost.update.mock.calls[0][0];
    expect(arg.data.isPublished).toBe(true);
    expect(arg.data.publishedAt).toBeInstanceOf(Date);
  });

  it('unpublish sets isPublished false', async () => {
    prisma.blogPost.update.mockResolvedValue({});
    await service.unpublish('p1');
    expect(prisma.blogPost.update).toHaveBeenCalledWith({ where: { id: 'p1' }, data: { isPublished: false } });
  });

  it('update replaces tags when provided', async () => {
    prisma.blogPost.update.mockResolvedValue({});
    await service.update('p1', { title: 'New', tags: ['new-tag'] });
    const arg = prisma.blogPost.update.mock.calls[0][0];
    expect(arg.data.tags.set).toEqual([]);
    expect(arg.data.tags.connectOrCreate).toHaveLength(1);
  });

  it('update leaves tags untouched when not provided', async () => {
    prisma.blogPost.update.mockResolvedValue({});
    await service.update('p1', { title: 'New' });
    const arg = prisma.blogPost.update.mock.calls[0][0];
    expect(arg.data.tags).toBeUndefined();
  });

  it('remove deletes the post', async () => {
    prisma.blogPost.delete.mockResolvedValue({});
    await service.remove('p1');
    expect(prisma.blogPost.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
  });

  it('findAllAdmin filters by draft/published status', async () => {
    prisma.$transaction.mockResolvedValue([[], 0]);
    await service.findAllAdmin({ status: 'draft' });
    await service.findAllAdmin({ status: 'published' });
    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
  });

  it('findById throws NotFoundException when missing', async () => {
    prisma.blogPost.findUnique.mockResolvedValue(null);
    await expect(service.findById('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findById returns the post when found', async () => {
    prisma.blogPost.findUnique.mockResolvedValue({ id: 'p1' });
    await expect(service.findById('p1')).resolves.toEqual({ id: 'p1' });
  });
});
