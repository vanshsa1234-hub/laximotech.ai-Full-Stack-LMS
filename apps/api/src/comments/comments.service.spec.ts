import { Test } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CommentsService', () => {
  let service: CommentsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      comment: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), delete: jest.fn() },
      commentVote: { upsert: jest.fn() },
    };

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

  describe('getLessonComments', () => {
    it('fetches top-level comments for a lesson and computes upvote counts', async () => {
      prisma.comment.findMany.mockResolvedValue([
        { id: 'c1', votes: [{ isUpvote: true }, { isUpvote: false }, { isUpvote: true }] },
        { id: 'c2', votes: [] },
      ]);

      const result = await service.getLessonComments('lesson1');

      expect(prisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { lessonId: 'lesson1', parentId: null } }),
      );
      expect(result[0].upvotes).toBe(2);
      expect(result[1].upvotes).toBe(0);
    });
  });

  describe('getReplies', () => {
    it('fetches replies for a parent comment and computes upvote counts', async () => {
      prisma.comment.findMany.mockResolvedValue([
        { id: 'r1', votes: [{ isUpvote: true }] },
      ]);

      const result = await service.getReplies('parent1');

      expect(prisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { parentId: 'parent1' } }),
      );
      expect(result[0].upvotes).toBe(1);
    });
  });

  describe('voteComment', () => {
    it('upserts the vote keyed by userId + commentId', async () => {
      prisma.commentVote.upsert.mockResolvedValue({});
      await service.voteComment('u1', 'c1', true);
      expect(prisma.commentVote.upsert).toHaveBeenCalledWith({
        where:  { userId_commentId: { userId: 'u1', commentId: 'c1' } },
        update: { isUpvote: true },
        create: { userId: 'u1', commentId: 'c1', isUpvote: true },
      });
    });
  });

  describe('deleteComment', () => {
    it('throws NotFoundException for a missing comment', async () => {
      prisma.comment.findUnique.mockResolvedValue(null);
      await expect(service.deleteComment('u1', 'missing', 'STUDENT')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ForbiddenException when a non-owner, non-admin tries to delete', async () => {
      prisma.comment.findUnique.mockResolvedValue({ id: 'c1', userId: 'someone-else' });
      await expect(service.deleteComment('u1', 'c1', 'STUDENT')).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.comment.delete).not.toHaveBeenCalled();
    });

    it('allows the owner to delete their own comment', async () => {
      prisma.comment.findUnique.mockResolvedValue({ id: 'c1', userId: 'u1' });
      prisma.comment.delete.mockResolvedValue({});
      await service.deleteComment('u1', 'c1', 'STUDENT');
      expect(prisma.comment.delete).toHaveBeenCalledWith({ where: { id: 'c1' } });
    });

    it('allows an ADMIN to delete any comment regardless of ownership', async () => {
      prisma.comment.findUnique.mockResolvedValue({ id: 'c1', userId: 'someone-else' });
      prisma.comment.delete.mockResolvedValue({});
      await service.deleteComment('admin1', 'c1', 'ADMIN');
      expect(prisma.comment.delete).toHaveBeenCalledWith({ where: { id: 'c1' } });
    });
  });
});