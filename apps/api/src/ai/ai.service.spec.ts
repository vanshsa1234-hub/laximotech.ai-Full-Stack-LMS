import { Test } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';

function mockRes() {
  return {
    write: jest.fn(),
    end: jest.fn(),
    setHeader: jest.fn(),
    flushHeaders: jest.fn(),
  } as any;
}

describe('AiService', () => {
  let service: AiService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      aiChatMessage: { count: jest.fn().mockResolvedValue(0), create: jest.fn(), findMany: jest.fn() },
      course: { findUnique: jest.fn(), findMany: jest.fn() },
      lesson: { findUnique: jest.fn() },
      enrollment: { findUnique: jest.fn() },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: PrismaService, useValue: prisma },
        // No API key configured → client is null, streamCompletion short-circuits
        // safely with an error message instead of calling a real API.
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(undefined) } },
      ],
    }).compile();

    service = moduleRef.get(AiService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('streamChat — enrollment gating (paywall bypass regression)', () => {
    it('throws NotFoundException when the course does not exist', async () => {
      prisma.course.findUnique.mockResolvedValue(null);
      await expect(
        service.streamChat('u1', 'missing-course', null, [{ role: 'user', content: 'hi' }], mockRes()),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('blocks access to a non-preview lesson for an unenrolled user', async () => {
      prisma.course.findUnique.mockResolvedValue({ title: 'Course', category: 'AI' });
      prisma.lesson.findUnique.mockResolvedValue({
        title: 'Paid Lesson',
        textContent: 'secret paid content',
        isPreview: false,
        section: { title: 'Section 1' },
      });
      prisma.enrollment.findUnique.mockResolvedValue(null);

      await expect(
        service.streamChat('u1', 'course1', 'lesson1', [{ role: 'user', content: 'hi' }], mockRes()),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(prisma.enrollment.findUnique).toHaveBeenCalledWith({
        where: { userId_courseId: { userId: 'u1', courseId: 'course1' } },
      });
      // Must never have persisted the user's message or leaked lesson content
      expect(prisma.aiChatMessage.create).not.toHaveBeenCalled();
    });

    it('allows access to a non-preview lesson for an enrolled user', async () => {
      prisma.course.findUnique.mockResolvedValue({ title: 'Course', category: 'AI' });
      prisma.lesson.findUnique.mockResolvedValue({
        title: 'Paid Lesson',
        textContent: 'content',
        isPreview: false,
        section: { title: 'Section 1' },
      });
      prisma.enrollment.findUnique.mockResolvedValue({ id: 'enr1' });
      prisma.aiChatMessage.create.mockResolvedValue({});

      const res = mockRes();
      await service.streamChat('u1', 'course1', 'lesson1', [{ role: 'user', content: 'hi' }], res);

      expect(prisma.aiChatMessage.create).toHaveBeenCalled();
      // No API key configured in this test → graceful "not configured" SSE message
      expect(res.write).toHaveBeenCalledWith(expect.stringContaining('not configured'));
    });

    it('allows access to a preview lesson without enrollment', async () => {
      prisma.course.findUnique.mockResolvedValue({ title: 'Course', category: 'AI' });
      prisma.lesson.findUnique.mockResolvedValue({
        title: 'Preview Lesson',
        textContent: 'content',
        isPreview: true,
        section: { title: 'Section 1' },
      });
      prisma.aiChatMessage.create.mockResolvedValue({});

      await service.streamChat('u1', 'course1', 'lesson1', [{ role: 'user', content: 'hi' }], mockRes());

      expect(prisma.enrollment.findUnique).not.toHaveBeenCalled();
      expect(prisma.aiChatMessage.create).toHaveBeenCalled();
    });
  });

  describe('streamChat — rate limiting', () => {
    it('blocks after 20 messages/day for a single course', async () => {
      prisma.aiChatMessage.count.mockResolvedValueOnce(20);
      await expect(
        service.streamChat('u1', 'course1', null, [{ role: 'user', content: 'hi' }], mockRes()),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.course.findUnique).not.toHaveBeenCalled();
    });

    it('blocks after 50 messages/day globally even if under the per-course cap', async () => {
      prisma.aiChatMessage.count
        .mockResolvedValueOnce(5) // per-course count
        .mockResolvedValueOnce(50); // global count

      await expect(
        service.streamChat('u1', 'course1', null, [{ role: 'user', content: 'hi' }], mockRes()),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
