import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CoursesService', () => {
  let service: CoursesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      course: { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
      review: { aggregate: jest.fn().mockResolvedValue({ _avg: { rating: null } }) },
      section: { count: jest.fn().mockResolvedValue(0), create: jest.fn(), update: jest.fn(), findUnique: jest.fn() },
      lesson: { count: jest.fn().mockResolvedValue(0), create: jest.fn(), update: jest.fn(), findUnique: jest.fn() },
      quiz: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
      quizQuestion: { deleteMany: jest.fn() },
      quizAnswerRecord: { deleteMany: jest.fn() },
      $transaction: jest.fn(),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [CoursesService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(CoursesService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('paginates and attaches avgRating per course', async () => {
      prisma.$transaction.mockResolvedValue([[{ id: 'c1' }], 1]);
      prisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.5 } });
      const result = await service.findAll({});
      expect(result.data[0].avgRating).toBe(4.5);
    });

    it('sorts by newest/price/duration/default', async () => {
      prisma.$transaction.mockResolvedValue([[], 0]);
      await service.findAll({ sort: 'newest' });
      await service.findAll({ sort: 'price' });
      await service.findAll({ sort: 'duration' });
      await service.findAll({});
      expect(prisma.$transaction).toHaveBeenCalledTimes(4);
    });
  });

  it('findAllForAdmin returns all matching courses with total count', async () => {
    prisma.course.findMany.mockResolvedValue([{ id: 'c1' }, { id: 'c2' }]);
    const result = await service.findAllForAdmin({});
    expect(result.total).toBe(2);
  });

  describe('findBySlug', () => {
    it('throws NotFoundException for a missing/unpublished course', async () => {
      prisma.course.findUnique.mockResolvedValue(null);
      await expect(service.findBySlug('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns the course with avgRating attached', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 'c1', slug: 'x' });
      prisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.2 } });
      const result = await service.findBySlug('x');
      expect(result.avgRating).toBe(4.2);
    });
  });

  describe('findById', () => {
    it('throws NotFoundException when missing', async () => {
      prisma.course.findUnique.mockResolvedValue(null);
      await expect(service.findById('missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('getBuilder', () => {
    it('throws NotFoundException when missing', async () => {
      prisma.course.findUnique.mockResolvedValue(null);
      await expect(service.getBuilder('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns full builder tree when found', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 'c1', sections: [] });
      await expect(service.getBuilder('c1')).resolves.toEqual({ id: 'c1', sections: [] });
    });
  });

  describe('createSection', () => {
    it('throws when the course does not exist', async () => {
      prisma.course.findUnique.mockResolvedValue(null);
      await expect(service.createSection('missing', { title: 'S1' })).rejects.toBeInstanceOf(NotFoundException);
    });

    it('auto-increments order when not provided', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 'c1' });
      prisma.section.count.mockResolvedValue(2);
      prisma.section.create.mockResolvedValue({});
      await service.createSection('c1', { title: 'S3' });
      expect(prisma.section.create).toHaveBeenCalledWith({ data: { courseId: 'c1', title: 'S3', order: 3 } });
    });
  });

  it('updateSection only sets provided fields', async () => {
    prisma.section.update.mockResolvedValue({});
    await service.updateSection('s1', { title: 'New' });
    expect(prisma.section.update).toHaveBeenCalledWith({ where: { id: 's1' }, data: { title: 'New' } });
  });

  describe('createLesson', () => {
    it('throws when the section does not exist', async () => {
      prisma.section.findUnique.mockResolvedValue(null);
      await expect(service.createLesson('missing', {})).rejects.toBeInstanceOf(NotFoundException);
    });

    it('creates the lesson and recalculates totalLessons', async () => {
      prisma.section.findUnique.mockResolvedValue({ courseId: 'c1' });
      prisma.lesson.count.mockResolvedValueOnce(0).mockResolvedValueOnce(5);
      prisma.lesson.create.mockResolvedValue({ id: 'l1' });
      prisma.course.update.mockResolvedValue({});

      await service.createLesson('s1', { title: 'L1' });
      expect(prisma.course.update).toHaveBeenCalledWith({ where: { id: 'c1' }, data: { totalLessons: 5 } });
    });
  });

  it('updateLesson builds a partial payload (only defined fields)', async () => {
    prisma.lesson.update.mockResolvedValue({});
    await service.updateLesson('l1', { title: 'Updated' });
    const arg = prisma.lesson.update.mock.calls[0][0];
    expect(arg.data.title).toBe('Updated');
    expect(arg.data.sectionId).toBeUndefined();
  });

  describe('upsertLessonQuiz', () => {
    it('throws NotFoundException when the lesson does not exist', async () => {
      prisma.lesson.findUnique.mockResolvedValue(null);
      await expect(
        service.upsertLessonQuiz('missing', { title: 'Q', questions: [] }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('creates a new quiz when none exists yet', async () => {
      prisma.lesson.findUnique.mockResolvedValue({ id: 'l1' });
      prisma.quiz.findUnique.mockResolvedValue(null);
      prisma.quiz.create.mockResolvedValue({ id: 'q1' });

      await service.upsertLessonQuiz('l1', {
        title: 'Quiz 1',
        questions: [{ question: 'Q1', options: ['a', 'b'], correctIndex: 0, order: 1 }],
      });
      expect(prisma.quiz.create).toHaveBeenCalled();
    });

    it('replaces questions on an existing quiz', async () => {
      prisma.lesson.findUnique.mockResolvedValue({ id: 'l1' });
      prisma.quiz.findUnique.mockResolvedValue({ id: 'existingQuiz' });
      prisma.quiz.update.mockResolvedValue({ id: 'existingQuiz' });

      await service.upsertLessonQuiz('l1', {
        title: 'Quiz 1',
        questions: [{ question: 'Q1', options: ['a', 'b'], correctIndex: 1, order: 1 }],
      });
      expect(prisma.quizAnswerRecord.deleteMany).toHaveBeenCalled();
      expect(prisma.quizQuestion.deleteMany).toHaveBeenCalledWith({ where: { quizId: 'existingQuiz' } });
      expect(prisma.quiz.update).toHaveBeenCalled();
    });
  });

  it('create passes data through with the course select', async () => {
    prisma.course.create.mockResolvedValue({ id: 'c1' });
    await service.create({
      slug: 's', title: 't', description: 'd', shortDesc: 'sd', price: 399,
      level: 'BEGINNER', category: 'AI', language: 'en', durationHrs: 5, instructorId: 'i1',
    });
    expect(prisma.course.create).toHaveBeenCalled();
  });

  it('update forwards partial fields', async () => {
    prisma.course.update.mockResolvedValue({});
    await service.update('c1', { isPublished: true });
    expect(prisma.course.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'c1' }, data: { isPublished: true } }),
    );
  });

  it('recalcTotalLessons counts lessons across the course and updates it', async () => {
    prisma.lesson.count.mockResolvedValue(7);
    prisma.course.update.mockResolvedValue({});
    await service.recalcTotalLessons('c1');
    expect(prisma.course.update).toHaveBeenCalledWith({ where: { id: 'c1' }, data: { totalLessons: 7 } });
  });
});
