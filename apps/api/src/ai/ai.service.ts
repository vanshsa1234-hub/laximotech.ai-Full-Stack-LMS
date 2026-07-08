import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Response }      from 'express';
import OpenAI from 'openai';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

@Injectable()
export class AiService {
  private client: OpenAI | null = null;
  private model: string;

  constructor(private config: ConfigService, private prisma: PrismaService) {
    const apiKey = config.get<string>('OPENROUTER_API_KEY');
    this.model = config.get<string>('OPENROUTER_MODEL') ?? 'openai/gpt-4o-mini';
    if (apiKey) {
      // OpenRouter exposes an OpenAI-compatible API — same SDK, different
      // base URL and key. Gives access to many models (GPT, Gemini, Llama,
      // Claude, etc.) behind one account instead of juggling several keys.
      this.client = new OpenAI({
        apiKey,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': config.get<string>('APP_URL') ?? 'https://laximotech.ai',
          'X-Title': 'laximotech.ai',
        },
      });
    } else {
      console.warn('⚠️  OPENROUTER_API_KEY missing — AI Study Buddy disabled.');
    }
  }

  private async streamCompletion(systemPrompt: string, messages: ChatMessage[], res: Response, onDone?: (fullText: string) => void) {
    if (!this.client) {
      res.write(`data: ${JSON.stringify({ error: 'AI Study Buddy is not configured on this server yet.' })}\n\n`);
      res.end();
      return;
    }

    res.setHeader('Content-Type',  'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection',    'keep-alive');
    res.flushHeaders();

    let fullResponse = '';
    try {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 500,
        stream: true,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? '';
        if (delta) {
          fullResponse += delta;
          res.write(`data: ${JSON.stringify({ delta })}\n\n`);
        }
      }

      onDone?.(fullResponse);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (err: any) {
      console.error('OpenRouter API error:', err?.message ?? err);
      res.write(`data: ${JSON.stringify({ error: 'AI service error. Please try again.' })}\n\n`);
      res.end();
    }
  }

  // Logged-in student, studying a specific course/lesson — chat history is
  // persisted so it survives a page refresh.
  async streamChat(
    userId:   string,
    courseId: string,
    lessonId: string | null,
    messages: ChatMessage[],
    res:      Response,
  ) {
    // Rate limit: 20 messages/day
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const msgCount = await this.prisma.aiChatMessage.count({
      where: { userId, courseId, createdAt: { gte: todayStart } },
    });
    if (msgCount >= 20) {
      throw new ForbiddenException('Daily limit of 20 AI messages reached. Upgrade for unlimited access.');
    }

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

    const lastUserMsg = messages[messages.length - 1];
    await this.prisma.aiChatMessage.create({
      data: { userId, courseId, lessonId, role: 'user', content: lastUserMsg.content },
    });

    await this.streamCompletion(systemPrompt, messages, res, async (fullResponse) => {
      await this.prisma.aiChatMessage.create({
        data: { userId, courseId, lessonId, role: 'assistant', content: fullResponse },
      });
    });
  }

  // Public homepage assistant — no login required, general questions about
  // the platform (courses, pricing, career paths). Not tied to any course,
  // and nothing is persisted since there's no logged-in user to attach it to.
  // Rate-limited by IP at the controller level (ThrottlerGuard), not per-user.
  async streamPublicChat(messages: ChatMessage[], res: Response) {
    // Pull real course + pricing data so the assistant answers "what courses
    // do you have" / "how much does X cost" with actual facts, not guesses.
    const courses = await this.prisma.course.findMany({
      where:  { isPublished: true },
      select: { title: true, category: true, price: true, level: true, durationHrs: true, shortDesc: true },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const courseList = courses.length > 0
      ? courses.map(c => `- ${c.title} (${c.category}, ${c.level}, ${c.durationHrs}h) — Rs ${c.price}: ${c.shortDesc}`).join('\n')
      : 'No courses are published yet.';

    const systemPrompt = `You are the AI assistant for laximotech.ai, an Indian ed-tech platform teaching AI, Data Science, Programming, Robotics/IoT, and Cybersecurity — in Hindi + English.

You're talking to a visitor who has NOT logged in yet, on the public homepage.

REAL, CURRENT COURSE CATALOG (use this — don't invent courses or prices):
${courseList}

Rules:
1. Help them figure out which course/career path fits their goals, using the real catalog above for names, prices, and durations.
2. If asked about a course or price, answer directly from the catalog above. If something isn't in the list, say you're not sure and suggest checking the /courses page rather than guessing.
3. Explain in simple Hindi-English mix (Hinglish) when helpful.
4. Be encouraging and friendly — this may be their first impression of the platform.
5. Keep answers concise (2-4 sentences).
6. If asked something entirely unrelated to learning/careers/this platform, politely redirect.`;

    await this.streamCompletion(systemPrompt, messages, res);
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