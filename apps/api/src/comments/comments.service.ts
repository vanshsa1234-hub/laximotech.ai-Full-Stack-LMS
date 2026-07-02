import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  private commentSelect = {
    id: true, body: true, createdAt: true, parentId: true,
    user: { select: { id: true, name: true, image: true, role: true } },
    votes: { select: { isUpvote: true } },
    _count: { select: { replies: true } },
  };

  async getLessonComments(lessonId: string) {
    const comments = await this.prisma.comment.findMany({
      where:   { lessonId, parentId: null },
      orderBy: [{ votes: { _count: 'desc' } }, { createdAt: 'desc' }],
      select:  this.commentSelect,
      take:    50,
    });
    return comments.map(c => ({
      ...c,
      upvotes: (c.votes as any[]).filter(v => v.isUpvote).length,
    }));
  }

  async getReplies(parentId: string) {
    const replies = await this.prisma.comment.findMany({
      where:   { parentId },
      orderBy: { createdAt: 'asc' },
      select:  this.commentSelect,
    });
    return replies.map(r => ({ ...r, upvotes: (r.votes as any[]).filter(v => v.isUpvote).length }));
  }

  async createComment(userId: string, data: { lessonId?: string; courseId?: string; body: string; parentId?: string }) {
    return this.prisma.comment.create({
      data: { userId, ...data, type: data.parentId ? 'LESSON' : (data.lessonId ? 'LESSON' : 'COURSE') },
      select: this.commentSelect,
    });
  }

  async voteComment(userId: string, commentId: string, isUpvote: boolean) {
    return this.prisma.commentVote.upsert({
      where:  { userId_commentId: { userId, commentId } },
      update: { isUpvote },
      create: { userId, commentId, isUpvote },
    });
  }

  async deleteComment(userId: string, commentId: string, userRole: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found.');
    if (comment.userId !== userId && userRole !== 'ADMIN') throw new ForbiddenException('Not authorized.');
    return this.prisma.comment.delete({ where: { id: commentId } });
  }
}
