import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CareerPathsService } from './career-paths.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CareerPathsService', () => {
  let service: CareerPathsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      careerPath: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
      careerPathCourse: { create: jest.fn(), delete: jest.fn() },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [CareerPathsService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(CareerPathsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('findAll returns all paths ordered by order asc', async () => {
    prisma.careerPath.findMany.mockResolvedValue([{ id: 'p1' }]);
    await expect(service.findAll()).resolves.toEqual([{ id: 'p1' }]);
  });

  it('findBySlug throws NotFoundException when missing', async () => {
    prisma.careerPath.findUnique.mockResolvedValue(null);
    await expect(service.findBySlug('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findBySlug returns the path when found', async () => {
    prisma.careerPath.findUnique.mockResolvedValue({ id: 'p1', slug: 'dev' });
    await expect(service.findBySlug('dev')).resolves.toEqual({ id: 'p1', slug: 'dev' });
  });

  it('findById throws NotFoundException when missing', async () => {
    prisma.careerPath.findUnique.mockResolvedValue(null);
    await expect(service.findById('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create defaults order to 0', async () => {
    prisma.careerPath.create.mockResolvedValue({});
    await service.create({ slug: 's', title: 't', description: 'd', avgSalary: '10L' });
    expect(prisma.careerPath.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ order: 0 }) }),
    );
  });

  it('update forwards partial data', async () => {
    prisma.careerPath.update.mockResolvedValue({});
    await service.update('p1', { title: 'New' });
    expect(prisma.careerPath.update).toHaveBeenCalledWith({ where: { id: 'p1' }, data: { title: 'New' } });
  });

  it('remove deletes the path', async () => {
    prisma.careerPath.delete.mockResolvedValue({});
    await service.remove('p1');
    expect(prisma.careerPath.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
  });

  it('addCourse coerces step to a number', async () => {
    prisma.careerPathCourse.create.mockResolvedValue({});
    await service.addCourse('path1', { courseId: 'c1', step: '2' as any, label: 'Step 2' });
    const arg = prisma.careerPathCourse.create.mock.calls[0][0];
    expect(arg.data.step).toBe(2);
    expect(typeof arg.data.step).toBe('number');
  });

  it('removeCourse deletes the join entry', async () => {
    prisma.careerPathCourse.delete.mockResolvedValue({});
    await service.removeCourse('entry1');
    expect(prisma.careerPathCourse.delete).toHaveBeenCalledWith({ where: { id: 'entry1' } });
  });
});
