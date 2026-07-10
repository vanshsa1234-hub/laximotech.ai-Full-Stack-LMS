import { Test } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CommentsService', () => {
  let service: CommentsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = { comment: { create: jest.fn(), findMany: jest.fn() }, commentVote: { upsert: jest.fn() } };

    const moduleRef = await Test.createTestingModule({
      providers: [CommentsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(CommentsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('createComment — impersonation regression', () => {
    it('always attributes the comment to the authenticated userId, even if the payload tries to spoof it', async () => {
      prisma.comment.create.mockResolvedValue({ id: 'c1' });

      const spoofedPayload: any = {
        lessonId: 'lesson1',
        body: 'hello',
        userId: 'someone-elses-user-id', // attempted impersonation
      };

      await service.createComment('real-user-id', spoofedPayload);

      const callArg = prisma.comment.create.mock.calls[0][0];
      expect(callArg.data.userId).toBe('real-user-id');
      expect(callArg.data.userId).not.toBe('someone-elses-user-id');
    });

    it('derives comment type LESSON when lessonId is present', async () => {
      prisma.comment.create.mockResolvedValue({});
      await service.createComment('u1', { lessonId: 'l1', body: 'hi' });
      expect(prisma.comment.create.mock.calls[0][0].data.type).toBe('LESSON');
    });

    it('derives comment type COURSE when only courseId is present', async () => {
      prisma.comment.create.mockResolvedValue({});
      await service.createComment('u1', { courseId: 'c1', body: 'hi' });
      expect(prisma.comment.create.mock.calls[0][0].data.type).toBe('COURSE');
    });

    it('derives comment type LESSON for replies (parentId set)', async () => {
      prisma.comment.create.mockResolvedValue({});
      await service.createComment('u1', { courseId: 'c1', body: 'hi', parentId: 'p1' });
      expect(prisma.comment.create.mock.calls[0][0].data.type).toBe('LESSON');
    });
  });
});
