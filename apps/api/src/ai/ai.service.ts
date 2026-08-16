import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RagService }    from './rag/rag.service';
import { Response }      from 'express';
import OpenAI from 'openai';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

@Injectable()
export class AiService {
  private client: OpenAI | null = null;
  private model: string;

  constructor(private config: ConfigService, private prisma: PrismaService, private rag: RagService) {
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
    // Rate limit: 20 messages/day per course, 50/day globally
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const [msgCount, globalCount] = await Promise.all([
      this.prisma.aiChatMessage.count({ where: { userId, courseId, createdAt: { gte: todayStart } } }),
      this.prisma.aiChatMessage.count({ where: { userId, createdAt: { gte: todayStart } } }),
    ]);
    if (msgCount >= 20) {
      throw new ForbiddenException('Daily limit of 20 AI messages reached. Upgrade for unlimited access.');
    }
    if (globalCount >= 50) {
      throw new ForbiddenException('Daily limit of 50 AI messages reached across all courses.');
    }

    const course = await this.prisma.course.findUnique({
      where:  { id: courseId },
      select: { title: true, description: true, category: true },
    });
    if (!course) throw new NotFoundException('Course not found.');

    let lessonContext = '';
    if (lessonId) {
      const lesson = await this.prisma.lesson.findUnique({
        where:  { id: lessonId },
        select: { title: true, textContent: true, isPreview: true, section: { select: { title: true } } },
      });
      if (lesson) {
        // Non-preview lessons require enrollment — otherwise anyone could
        // extract paid lesson content via the AI chat context.
        if (!lesson.isPreview) {
          const enrollment = await this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } },
          });
          if (!enrollment) throw new ForbiddenException('Please enroll in this course to use the AI Study Buddy here.');
        }
        lessonContext = `\nCurrent lesson: "${lesson.title}" in section "${lesson.section.title}"`;

        // RAG: retrieve the chunks (from the lesson's PDF/notes) most
        // relevant to the student's actual question, instead of blindly
        // truncating the notes field to the first 800 characters.
        const userQuery = messages[messages.length - 1]?.content ?? '';
        const chunks = await this.rag.retrieveContext(lessonId, courseId, userQuery);
        if (chunks.length > 0) {
          const contextBlock = chunks
            .map((c, i) => `[Excerpt ${i + 1} — from lesson ${c.source === 'pdf' ? 'PDF' : 'notes'}]\n${c.text}`)
            .join('\n\n');
          lessonContext += `\n\nRelevant material for this question:\n${contextBlock}`;
        } else if (lesson.textContent) {
          // Nothing ingested yet for this lesson (e.g. RAG hasn't caught up
          // after a fresh upload) — fall back to a short raw excerpt so the
          // assistant still has *something* rather than nothing.
          lessonContext += `\nLesson notes: ${lesson.textContent.slice(0, 800)}`;
        }
      }
    }

    const systemPrompt = `You are an AI Study Buddy for laximotech.ai, India's most affordable AI & tech learning platform.

You are helping a student with the course: "${course?.title ?? 'Unknown Course'}"
Category: ${course?.category ?? ''}${lessonContext}

Rules:
1. Answer ONLY questions related to this course or its topics. Politely redirect off-topic questions.
2. Respond in clear, simple English — many students are beginners, so keep language plain and approachable.
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

    const systemPrompt = `You are the AI assistant for laximotech.ai, an Indian ed-tech platform teaching AI, Data Science, Programming, Robotics/IoT, and Cybersecurity.

You're talking to a visitor who has NOT logged in yet, on the public homepage.

REAL, CURRENT COURSE CATALOG (use this — don't invent courses or prices):
${courseList}

Rules:
1. Help them figure out which course/career path fits their goals, using the real catalog above for names, prices, and durations.
2. If asked about a course or price, answer directly from the catalog above. If something isn't in the list, say you're not sure and suggest checking the /courses page rather than guessing.
3. Respond in clear, simple English.
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

  // Non-streaming, structured completion used to auto-generate section
  // quizzes. Separate from streamCompletion (SSE, chat-shaped) since this
  // needs a single parsed JSON object back, not a token stream.
  async generateQuizQuestions(
    quizTitle: string,
    courseTitle: string,
    material: string,
    count = 10,
  ): Promise<{ question: string; options: string[]; correctIndex: number; explanation: string }[]> {
    if (!this.client) {
      throw new Error('AI quiz generation is not configured on this server (OPENROUTER_API_KEY missing).');
    }

    const systemPrompt = `You are an expert instructional designer writing a multiple-choice quiz for an online course on laximotech.ai.

Generate exactly ${count} multiple-choice questions testing understanding of the course material provided below. The quiz is titled "${quizTitle}" and covers everything a student should know up to this point in the course "${courseTitle}".

Rules:
1. Each question must have exactly 4 options with only ONE correct answer.
2. Vary difficulty: mix recall, application, and conceptual questions.
3. Base every question strictly on the material provided — never invent facts it doesn't cover.
4. Include a short 1-2 sentence explanation for why the correct answer is right.
5. Respond with ONLY valid JSON, no markdown fences, no preamble, in exactly this shape:
{"questions":[{"question":"...","options":["...","...","...","..."],"correctIndex":0,"explanation":"..."}]}`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Course material covered so far:\n\n${material.slice(0, 20000)}` },
      ],
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    let parsed: any;
    try {
      parsed = JSON.parse(response.choices[0]?.message?.content ?? '{}');
    } catch {
      throw new Error('AI returned invalid JSON for quiz generation.');
    }

    const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
    return questions
      .filter((q: any) => q?.question && Array.isArray(q.options) && q.options.length === 4 && typeof q.correctIndex === 'number')
      .slice(0, count)
      .map((q: any) => ({
        question: String(q.question),
        options: q.options.map(String),
        correctIndex: q.correctIndex,
        explanation: q.explanation ? String(q.explanation) : '',
      }));
  }
}