import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, FriendRequestStatus } from '@prisma/client';

const USER_CARD_SELECT = { id: true, name: true, image: true, role: true, xpPoints: true } as const;

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  // ── Feed ──────────────────────────────────────────────────────
  async getFeed(cursor?: string, limit = 20) {
    const posts = await this.prisma.communityPost.findMany({
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' },
      include: { author: { select: USER_CARD_SELECT } },
    });
    return { posts, nextCursor: posts.length === limit ? posts[posts.length - 1].id : null };
  }

  async createPost(userId: string, data: { content?: string; mediaUrl?: string; mediaType?: string }) {
    if (!data.content?.trim() && !data.mediaUrl) {
      throw new BadRequestException('Post must have text or media.');
    }
    return this.prisma.communityPost.create({
      data: { authorId: userId, content: data.content?.trim(), mediaUrl: data.mediaUrl, mediaType: data.mediaType },
      include: { author: { select: USER_CARD_SELECT } },
    });
  }

  async deletePost(userId: string, postId: string, role: Role) {
    const post = await this.prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found.');
    if (post.authorId !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException("You can't delete this post.");
    }
    await this.prisma.communityPost.delete({ where: { id: postId } });
    return { success: true };
  }

  // ── Members directory ────────────────────────────────────────
  async getMembers(currentUserId: string, search?: string, cursor?: string, limit = 30) {
    const members = await this.prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        OR: [{ role: { in: [Role.ADMIN, Role.INSTRUCTOR] } }, { enrollments: { some: {} } }],
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { xpPoints: 'desc' },
      select: USER_CARD_SELECT,
    });
    return { members, nextCursor: members.length === limit ? members[members.length - 1].id : null };
  }

  // ── Public profile (rank, progress, courses, certificates) ──────
  async getPublicProfile(requesterId: string, targetUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true, name: true, image: true, role: true, bio: true, city: true, xpPoints: true, createdAt: true,
        enrollments: { select: { progress: true } },
        _count: { select: { enrollments: true, certificates: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found.');

    const avgProgress = user.enrollments.length
      ? Math.round(user.enrollments.reduce((s, e) => s + e.progress, 0) / user.enrollments.length)
      : 0;

    const higherXpCount = await this.prisma.user.count({ where: { xpPoints: { gt: user.xpPoints } } });

    const friendStatus = requesterId === targetUserId ? 'SELF' : await this.getFriendStatus(requesterId, targetUserId);

    return {
      id: user.id, name: user.name, image: user.image, role: user.role, bio: user.bio, city: user.city,
      xpPoints: user.xpPoints, memberSince: user.createdAt,
      enrolledCourses: user._count.enrollments,
      certificates: user._count.certificates,
      avgProgress,
      rank: higherXpCount + 1,
      friendStatus,
    };
  }

  // ── Friend requests ───────────────────────────────────────────
  private async getFriendStatus(a: string, b: string): Promise<'NONE' | 'FRIENDS' | 'REQUEST_SENT' | 'REQUEST_RECEIVED'> {
    const req = await this.prisma.friendRequest.findFirst({
      where: { OR: [{ senderId: a, receiverId: b }, { senderId: b, receiverId: a }] },
    });
    if (!req) return 'NONE';
    if (req.status === FriendRequestStatus.ACCEPTED) return 'FRIENDS';
    if (req.status !== FriendRequestStatus.PENDING) return 'NONE';
    return req.senderId === a ? 'REQUEST_SENT' : 'REQUEST_RECEIVED';
  }

  async sendFriendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) throw new BadRequestException("You can't friend yourself.");
    const receiver = await this.prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) throw new NotFoundException('User not found.');

    const existing = await this.prisma.friendRequest.findFirst({
      where: { OR: [{ senderId, receiverId }, { senderId: receiverId, receiverId: senderId }] },
    });

    if (existing) {
      if (existing.status === FriendRequestStatus.ACCEPTED) throw new BadRequestException('Already friends.');
      if (existing.status === FriendRequestStatus.PENDING) {
        // If the other person already sent us a request, accept it instead of erroring.
        if (existing.senderId === receiverId) {
          return this.prisma.friendRequest.update({ where: { id: existing.id }, data: { status: FriendRequestStatus.ACCEPTED } });
        }
        throw new BadRequestException('Friend request already sent.');
      }
      // Previously rejected — allow re-sending.
      return this.prisma.friendRequest.update({
        where: { id: existing.id },
        data: { senderId, receiverId, status: FriendRequestStatus.PENDING },
      });
    }

    return this.prisma.friendRequest.create({ data: { senderId, receiverId } });
  }

  async getMyFriendRequests(userId: string) {
    const [incoming, outgoing] = await Promise.all([
      this.prisma.friendRequest.findMany({
        where: { receiverId: userId, status: FriendRequestStatus.PENDING },
        include: { sender: { select: USER_CARD_SELECT } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.friendRequest.findMany({
        where: { senderId: userId, status: FriendRequestStatus.PENDING },
        include: { receiver: { select: USER_CARD_SELECT } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return { incoming, outgoing };
  }

  async respondToFriendRequest(userId: string, requestId: string, accept: boolean) {
    const request = await this.prisma.friendRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Friend request not found.');
    if (request.receiverId !== userId) throw new ForbiddenException('Not your request to respond to.');
    if (request.status !== FriendRequestStatus.PENDING) throw new BadRequestException('Request already handled.');

    if (accept) {
      return this.prisma.friendRequest.update({ where: { id: requestId }, data: { status: FriendRequestStatus.ACCEPTED } });
    }
    // Reject by deleting so the two users can send a fresh request later.
    await this.prisma.friendRequest.delete({ where: { id: requestId } });
    return { success: true };
  }

  async getFriends(userId: string) {
    const accepted = await this.prisma.friendRequest.findMany({
      where: { status: FriendRequestStatus.ACCEPTED, OR: [{ senderId: userId }, { receiverId: userId }] },
      include: { sender: { select: USER_CARD_SELECT }, receiver: { select: USER_CARD_SELECT } },
    });
    return accepted.map(r => (r.senderId === userId ? r.receiver : r.sender));
  }

  private async areFriends(a: string, b: string) {
    const req = await this.prisma.friendRequest.findFirst({
      where: { status: FriendRequestStatus.ACCEPTED, OR: [{ senderId: a, receiverId: b }, { senderId: b, receiverId: a }] },
    });
    return !!req;
  }

  // ── Direct messages ───────────────────────────────────────────
  private async assertCanMessage(senderId: string, senderRole: Role, receiverId: string) {
    if (senderId === receiverId) throw new BadRequestException("You can't message yourself.");
    const receiver = await this.prisma.user.findUnique({ where: { id: receiverId }, select: { role: true } });
    if (!receiver) throw new NotFoundException('User not found.');

    // Admins can message anyone, and anyone can message an admin directly
    // (no friend request needed) — otherwise the two students must be friends.
    if (senderRole === Role.ADMIN || receiver.role === Role.ADMIN) return;
    const friends = await this.areFriends(senderId, receiverId);
    if (!friends) throw new ForbiddenException('You can only message friends.');
  }

  async sendMessage(senderId: string, senderRole: Role, data: { receiverId: string; content?: string; mediaUrl?: string; mediaType?: string }) {
    if (!data.content?.trim() && !data.mediaUrl) throw new BadRequestException('Message must have text or media.');
    await this.assertCanMessage(senderId, senderRole, data.receiverId);
    return this.prisma.directMessage.create({
      data: {
        senderId, receiverId: data.receiverId,
        content: data.content?.trim(), mediaUrl: data.mediaUrl, mediaType: data.mediaType,
      },
    });
  }

  async getThread(userId: string, userRole: Role, otherUserId: string) {
    await this.assertCanMessage(userId, userRole, otherUserId);

    await this.prisma.directMessage.updateMany({
      where: { senderId: otherUserId, receiverId: userId, readAt: null },
      data: { readAt: new Date() },
    });

    return this.prisma.directMessage.findMany({
      where: { OR: [{ senderId: userId, receiverId: otherUserId }, { senderId: otherUserId, receiverId: userId }] },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getConversations(userId: string) {
    const messages = await this.prisma.directMessage.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      orderBy: { createdAt: 'desc' },
      include: { sender: { select: USER_CARD_SELECT }, receiver: { select: USER_CARD_SELECT } },
    });

    const byPartner = new Map<string, any>();
    for (const m of messages) {
      const partner = m.senderId === userId ? m.receiver : m.sender;
      if (!byPartner.has(partner.id)) {
        byPartner.set(partner.id, {
          partner,
          lastMessage: m.content ?? (m.mediaType === 'VIDEO' ? '📹 Video' : '📷 Photo'),
          lastMessageAt: m.createdAt,
          unreadCount: 0,
        });
      }
      if (m.receiverId === userId && !m.readAt) byPartner.get(partner.id).unreadCount++;
    }
    return Array.from(byPartner.values());
  }
}
