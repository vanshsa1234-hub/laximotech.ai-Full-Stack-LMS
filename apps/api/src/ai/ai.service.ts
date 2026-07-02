import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Response }      from 'express';
import OpenAI            from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI | null = null;

  constructor(private config: ConfigService, private prisma: PrismaService) {
    const apiKey = config.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    } else {
      console.warn('⚠️  OpenAI API key missing — AI Study Buddy disabled.');
    }
  }

  async streamChat(
    userId:   string,
    courseId: string,
    lessonId: string | null,
    messages: { role: 'user' | 'assistant'; content: string }[],
    res:      Response,
  ) {
    if (!this.openai) {
      res.status(503).json({ error: 'AI Study Buddy not configured.' });
      return;
    }

    // Rate limit: 20 messages/day
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const msgCount = await this.prisma.aiChatMessage.count({
      where: { userId, courseId, createdAt: { gte: todayStart } },
    });
    if (msgCount >= 20) {
      throw new ForbiddenException('Daily limit of 20 AI messages reached. Upgrade for unlimited access.');
    }

    // Fetch course + lesson context
    const course = await this.prisma.course.findUnique({
      where:  { id: courseId },
      select: { title: true, description: true, category: true },
    });

    let lessonContext = '';
    if (lessonId) {
      const lesson = await this.prisma.lesson.findUnique({
        where:  { id: lessonId },
        select: { title: true, textContent: true, section: { select: { title: true } } },
      });
      if (lesson) {
        lessonContext = `\nCurrent lesson: "${lesson.title}" in section "${lesson.section.title}"`;
        if (lesson.textContent) lessonContext += `\nLesson notes: ${lesson.textContent.slice(0, 800)}`;
      }
    }

    const systemPrompt = `You are an AI Study Buddy for laximotech.ai, India's most affordable AI & tech learning platform.

You are helping a student with the course: "${course?.title ?? 'Unknown Course'}"
Category: ${course?.category ?? ''}${lessonContext}

Rules:
1. Answer ONLY questions related to this course or its topics. Politely redirect off-topic questions.
2. Explain in simple Hindi-English mix (Hinglish) when helpful — many students prefer this.
3. Be encouraging, friendly, and patient. Students may be beginners.
4. Use examples relevant to India (Indian companies, cities, real-life scenarios).
5. Keep answers concise (2-4 sentences) unless a detailed explanation is needed.
6. If the student is stuck, ask a guiding question rather than giving the answer immediately.
7. Never make up technical facts. If unsure, say so.`;

    // Save user message to DB
    const lastUserMsg = messages[messages.length - 1];
    await this.prisma.aiChatMessage.create({
      data: { userId, courseId, lessonId, role: 'user', content: lastUserMsg.content },
    });

    // Set up SSE headers
    res.setHeader('Content-Type',  'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection',    'keep-alive');
    res.flushHeaders();

    let fullResponse = '';

    try {
      const stream = await this.openai.chat.completions.create({
        model:    this.config.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini',
        stream:   true,
        max_tokens: 500,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-10), // last 10 messages for context window
        ],
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? '';
        if (delta) {
          fullResponse += delta;
          res.write(`data: ${JSON.stringify({ delta })}\n\n`);
        }
      }

      // Save assistant response to DB
      await this.prisma.aiChatMessage.create({
        data: { userId, courseId, lessonId, role: 'assistant', content: fullResponse },
      });

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ error: 'AI service error. Please try again.' })}\n\n`);
      res.end();
    }
  }

  async getChatHistory(userId: string, courseId: string, lessonId?: string) {
    return this.prisma.aiChatMessage.findMany({
      where:   { userId, courseId, ...(lessonId && { lessonId }) },
      orderBy: { createdAt: 'asc' },
      take:    30,
      select:  { id: true, role: true, content: true, createdAt: true },
    });
  }
}
