import { Test } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

describe('LessonsService', () => {
  let service: LessonsService;
  let prisma: any;
  let storage: any;

  const paidLesson = {
    id: 'lesson1',
    title: 'Paid Lesson',
    isPreview: false,
    videoUrl: 'raw/video1.mp4',
    pdfUrl: null,
    subtitleHiUrl: null,
    subtitleEnUrl: null,
    section: { id: 's1', title: 'Section 1', order: 1, course: { id: 'course1', slug: 'c1', title: 'Course' } },
    quiz: null,
  };

  beforeEach(async () => {
    prisma = {
      lesson: { findUnique: jest.fn() },
      enrollment: { findUnique: jest.fn() },
      lessonProgress: { findUnique: jest.fn(), findMany: jest.fn() },
      course: { findUnique: jest.fn() },
      section: { findMany: jest.fn() },
    };
    storage = { getViewUrl: jest.fn().mockResolvedValue('https://signed.example.com/video1.mp4') };

    const moduleRef = await Test.createTestingModule({
      providers: [
        LessonsService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    service = moduleRef.get(LessonsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getLesson — access control', () => {
    it('throws NotFoundException when the lesson does not exist', async () => {
      prisma.lesson.findUnique.mockResolvedValue(null);
      await expect(service.getLesson('missing', 'u1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('blocks a non-preview lesson for an unenrolled user (video streaming auth)', async () => {
      prisma.lesson.findUnique.mockResolvedValue(paidLesson);
      prisma.enrollment.findUnique.mockResolvedValue(null);

      await expect(service.getLesson('lesson1', 'u1')).rejects.toBeInstanceOf(ForbiddenException);
      // Must never generate a signed URL for content the user can't access
      expect(storage.getViewUrl).not.toHaveBeenCalled();
    });

    it('allows a non-preview lesson for an enrolled user and returns a signed video URL', async () => {
      prisma.lesson.findUnique.mockResolvedValue(paidLesson);
      prisma.enrollment.findUnique.mockResolvedValue({ id: 'enr1' });
      prisma.lessonProgress.findUnique.mockResolvedValue(null);

      const result = await service.getLesson('lesson1', 'u1');
      expect(result.videoUrl).toBe('https://signed.example.com/video1.mp4');
      expect(storage.getViewUrl).toHaveBeenCalledWith('raw/video1.mp4', 7200);
    });

    it('allows a preview lesson without checking enrollment', async () => {
      prisma.lesson.findUnique.mockResolvedValue({ ...paidLesson, isPreview: true, videoUrl: null });
      prisma.lessonProgress.findUnique.mockResolvedValue(null);

      await service.getLesson('lesson1', 'u1');
      expect(prisma.enrollment.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('getCourseLessons — lock state', () => {
    it('throws NotFoundException for an unknown course slug', async () => {
      prisma.course.findUnique.mockResolvedValue(null);
      await expect(service.getCourseLessons('missing-slug', 'u1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('marks non-preview lessons as locked for unenrolled users', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 'course1' });
      prisma.enrollment.findUnique.mockResolvedValue(null);
      prisma.section.findMany.mockResolvedValue([
        { id: 's1', title: 'S1', order: 1, lessons: [{ id: 'l1', isPreview: false }, { id: 'l2', isPreview: true }] },
      ]);

      const result = await service.getCourseLessons('c1', 'u1');
      expect(result.isEnrolled).toBe(false);
      expect(result.sections[0].lessons[0].isLocked).toBe(true);
      expect(result.sections[0].lessons[1].isLocked).toBe(false);
      // Unenrolled users shouldn't trigger a progress lookup at all
      expect(prisma.lessonProgress.findMany).not.toHaveBeenCalled();
    });

    it('unlocks all lessons and attaches progress for enrolled users', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 'course1' });
      prisma.enrollment.findUnique.mockResolvedValue({ id: 'enr1' });
      prisma.section.findMany.mockResolvedValue([
        { id: 's1', title: 'S1', order: 1, lessons: [{ id: 'l1', isPreview: false }] },
      ]);
      prisma.lessonProgress.findMany.mockResolvedValue([
        { lessonId: 'l1', isCompleted: true, watchedSeconds: 120 },
      ]);

      const result = await service.getCourseLessons('c1', 'u1');
      expect(result.isEnrolled).toBe(true);
      expect(result.sections[0].lessons[0].isLocked).toBe(false);
      expect(result.sections[0].lessons[0].progress).toEqual({
        lessonId: 'l1', isCompleted: true, watchedSeconds: 120,
      });
    });
  });
});
