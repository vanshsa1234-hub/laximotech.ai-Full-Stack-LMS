import { Test } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';

// Used only by the "streamCompletion — with API key configured" suite below.
// Left unconfigured (no return value) here; each test in that suite sets
// `mockCreate.mockResolvedValueOnce(...)` / `mockRejectedValueOnce(...)`.
const mockCreate = jest.fn();
jest.mock('openai', () => {
  const ctor = jest.fn().mockImplementation(() => ({
    chat: { completions: { create: (...args: any[]) => mockCreate(...args) } },
  }));
  return { __esModule: true, default: ctor };
});

function mockRes() {
  return {
    write: jest.fn(),
    end: jest.fn(),
    setHeader: jest.fn(),
    flushHeaders: jest.fn(),
  } as any;
}

// Wraps an array of delta strings into the async-iterable shape the OpenAI
// streaming SDK returns, so `for await (const chunk of stream)` in the
// service works the same as it would against the real API.
function fakeStream(deltas: string[]) {
  return {
    [Symbol.asyncIterator]: async function* () {
      for (const delta of deltas) {
        yield { choices: [{ delta: { content: delta } }] };
      }
    },
  };
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

  describe('streamPublicChat', () => {
    it('falls through to the "not configured" SSE message when no courses exist (no API key in this test)', async () => {
      prisma.course.findMany.mockResolvedValue([]);
      const res = mockRes();
      await service.streamPublicChat([{ role: 'user', content: 'hi' }], res);
      expect(prisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isPublished: true } }),
      );
      expect(res.write).toHaveBeenCalledWith(expect.stringContaining('not configured'));
    });

    it('builds the course catalog into the prompt when published courses exist', async () => {
      prisma.course.findMany.mockResolvedValue([
        { title: 'AI 101', category: 'AI', price: 999, level: 'Beginner', durationHrs: 10, shortDesc: 'Intro to AI' },
      ]);
      const res = mockRes();
      // Client isn't configured in this test module, so we can't observe the
      // prompt text directly — but this still exercises the catalog-building
      // branch (courses.length > 0) instead of the "no courses" fallback.
      await service.streamPublicChat([{ role: 'user', content: 'hi' }], res);
      expect(res.write).toHaveBeenCalledWith(expect.stringContaining('not configured'));
    });
  });

  describe('getChatHistory', () => {
    it('fetches history for a course without filtering by lesson when none is given', async () => {
      prisma.aiChatMessage.findMany.mockResolvedValue([{ id: 'm1' }]);
      const result = await service.getChatHistory('u1', 'course1');
      expect(prisma.aiChatMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'u1', courseId: 'course1' } }),
      );
      expect(result).toEqual([{ id: 'm1' }]);
    });

    it('filters by lessonId when one is given', async () => {
      prisma.aiChatMessage.findMany.mockResolvedValue([]);
      await service.getChatHistory('u1', 'course1', 'lesson1');
      expect(prisma.aiChatMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'u1', courseId: 'course1', lessonId: 'lesson1' } }),
      );
    });
  });
});

// Separate top-level suite: builds its own AiService instance with an API key
// configured, so `this.client` is a real (mocked) OpenAI SDK instance and
// streamCompletion takes its actual streaming branch instead of the
// "not configured" short-circuit exercised above.
describe('AiService — streamCompletion with API key configured', () => {
  let service: AiService;
  let prisma: any;

  beforeEach(async () => {
    mockCreate.mockReset();
    prisma = {
      aiChatMessage: { count: jest.fn().mockResolvedValue(0), create: jest.fn().mockResolvedValue({}), findMany: jest.fn() },
      course: { findUnique: jest.fn(), findMany: jest.fn().mockResolvedValue([]) },
      lesson: { findUnique: jest.fn().mockResolvedValue(null) },
      enrollment: { findUnique: jest.fn() },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('fake-api-key') } },
      ],
    }).compile();

    service = moduleRef.get(AiService);
  });

  afterEach(() => jest.clearAllMocks());

  it('streams response deltas over SSE and persists the assembled assistant reply', async () => {
    mockCreate.mockResolvedValue(fakeStream(['Hel', 'lo!']));
    prisma.course.findUnique.mockResolvedValue({ title: 'Course', category: 'AI' });

    const res = mockRes();
    await service.streamChat('u1', 'course1', null, [{ role: 'user', content: 'hi' }], res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
    expect(res.write).toHaveBeenCalledWith(expect.stringContaining('Hel'));
    expect(res.write).toHaveBeenCalledWith(expect.stringContaining('lo!'));
    expect(res.write).toHaveBeenCalledWith(expect.stringContaining('"done":true'));
    expect(res.end).toHaveBeenCalled();

    // First create() call persists the user's message, second persists the
    // assembled assistant reply once the stream finishes (the `onDone` callback).
    expect(prisma.aiChatMessage.create).toHaveBeenCalledTimes(2);
    expect(prisma.aiChatMessage.create).toHaveBeenLastCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ role: 'assistant', content: 'Hello!' }) }),
    );
  });

  it('writes an SSE error message and still ends the response when the upstream API call throws', async () => {
    mockCreate.mockRejectedValue(new Error('upstream is down'));
    prisma.course.findUnique.mockResolvedValue({ title: 'Course', category: 'AI' });

    const res = mockRes();
    await service.streamChat('u1', 'course1', null, [{ role: 'user', content: 'hi' }], res);

    expect(res.write).toHaveBeenCalledWith(expect.stringContaining('AI service error'));
    expect(res.end).toHaveBeenCalled();
    // The error happened mid-stream, after the user message was already saved —
    // the assistant reply must NOT be persisted since nothing was generated.
    expect(prisma.aiChatMessage.create).toHaveBeenCalledTimes(1);
  });

  it('streamPublicChat streams without persisting anything (no user to attach messages to)', async () => {
    mockCreate.mockResolvedValue(fakeStream(['Hi', ' there']));
    const res = mockRes();

    await service.streamPublicChat([{ role: 'user', content: 'hi' }], res);

    expect(res.write).toHaveBeenCalledWith(expect.stringContaining('Hi'));
    expect(res.write).toHaveBeenCalledWith(expect.stringContaining('"done":true'));
    expect(prisma.aiChatMessage.create).not.toHaveBeenCalled();
  });
});