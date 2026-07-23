// C:\Users\LENOVO\Downloads\laximotech(project)\laximotech7\apps\api\src\quizzes\quizzes.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CertificatesService } from '../certificates/certificates.service';
import { ProgressService } from '../progress/progress.service';

@Injectable()
export class QuizzesService {
  constructor(
    private prisma: PrismaService,
    private certificates: CertificatesService,
    private progress: ProgressService,
  ) {}

  // Get quiz questions — correct answer NOT sent to client
  async getQuiz(quizId: string, userId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        lesson: {
          select: {
            id: true, title: true,
            section: { select: { course: { select: { id: true } } } },
          },
        },
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true, question: true, options: true,
            explanation: true, order: true,
            // correctIndex intentionally excluded from client response
          },
        },
      },
    });

    if (!quiz) throw new NotFoundException('Quiz not found.');

    // Check enrollment for non-preview lessons
    const courseId = quiz.lesson.section.course.id;
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!enrollment) throw new ForbiddenException('Please enroll to take this quiz.');

    // Get previous attempts
    const attempts = await this.prisma.quizAttempt.findMany({
      where: { userId, quizId },
      orderBy: { attemptedAt: 'desc' },
      take: 5,
      select: { id: true, score: true, passed: true, attemptedAt: true, timeTakenSec: true },
    });

    // Spaced repetition: find questions the user got wrong last attempt
    let weakQuestionIds: string[] = [];
    if (attempts.length > 0) {
      const lastAttemptAnswers = await this.prisma.quizAnswerRecord.findMany({
        where: { attemptId: attempts[0].id, isCorrect: false },
        select: { questionId: true },
      });
      weakQuestionIds = lastAttemptAnswers.map(a => a.questionId);
    }

    return {
      ...quiz,
      attempts,
      bestScore:       attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : null,
      weakQuestionIds, // frontend highlights these first
    };
  }

  // Submit quiz answers — returns score + correct answers + explanations
  async submitQuiz(
    quizId: string,
    userId: string,
    answers: number[],
    timeTakenSec?: number,
  ) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: { orderBy: { order: 'asc' } },
        lesson: {
          select: { section: { select: { course: { select: { id: true } } } } },
        },
      },
    });

    if (!quiz) throw new NotFoundException('Quiz not found.');
    if (answers.length !== quiz.questions.length) {
      throw new BadRequestException(`Expected ${quiz.questions.length} answers, got ${answers.length}.`);
    }

    // Grade answers
    const results = quiz.questions.map((q, i) => ({
      questionId:    q.id,
      selectedIndex: answers[i],
      correctIndex:  q.correctIndex,
      isCorrect:     answers[i] === q.correctIndex,
      explanation:   q.explanation,
      question:      q.question,
      options:       q.options as string[],
    }));

    const correctCount = results.filter(r => r.isCorrect).length;
    const score        = Math.round((correctCount / quiz.questions.length) * 100);
    const passed       = score >= quiz.passingScore;

    // Save attempt
    const attempt = await this.prisma.quizAttempt.create({
      data: {
        userId, quizId, score, passed, timeTakenSec,
        answers: {
          create: results.map(r => ({
            questionId:    r.questionId,
            selectedIndex: r.selectedIndex,
            isCorrect:     r.isCorrect,
          })),
        },
      },
    });

    // Award XP for passing
    if (passed) {
      const xpReward = quiz.isFinalExam ? 200 : 50;
      await this.prisma.user.update({
        where: { id: userId },
        data:  { xpPoints: { increment: xpReward } },
      });
    }

    const courseId = quiz.lesson.section.course.id;

    // A quiz lives on its own lesson (contentType QUIZ) — passing it needs to
    // mark THAT lesson complete too, exactly like watching a video does.
    // Without this, quiz-lessons could never show a checkmark and overall
    // course completion could never reach 100% even after finishing every
    // other lesson (previously stalled around 75% on a typical 4-quiz course).
    if (passed) {
      await this.prisma.lessonProgress.upsert({
        where:  { userId_lessonId: { userId, lessonId: quiz.lessonId } },
        create: { userId, lessonId: quiz.lessonId, isCompleted: true, watchedSeconds: 0, completedAt: new Date() },
        update: { isCompleted: true, completedAt: new Date() },
      });
      await this.progress.recalcEnrollmentProgress(userId, courseId);
    }

    // If final exam passed → auto-issue certificate (this also kicks off real PDF generation,
    // instead of just creating a bare DB row with no downloadable file).
    let certificate = null;
    if (quiz.isFinalExam && passed) {
      certificate = await this.certificates.issueCertificate(userId, courseId, score);
    }

    return {
      attemptId: attempt.id,
      score,
      passed,
      passingScore:  quiz.passingScore,
      correctCount,
      totalQuestions: quiz.questions.length,
      results,          // includes correct answers + explanations
      xpEarned:  passed ? (quiz.isFinalExam ? 200 : 50) : 0,
      certificate,
    };
  }

  // Admin: create a quiz for a lesson
  async createQuiz(lessonId: string, data: {
    title: string; passingScore?: number; isFinalExam?: boolean;
    questions: { question: string; options: string[]; correctIndex: number; explanation?: string; order: number }[];
  }) {
    return this.prisma.quiz.create({
      data: {
        lessonId,
        title:        data.title,
        passingScore: data.passingScore ?? 70,
        isFinalExam:  data.isFinalExam ?? false,
        questions: {
          create: data.questions.map(q => ({
            question:     q.question,
            options:      q.options,
            correctIndex: q.correctIndex,
            explanation:  q.explanation,
            order:        q.order,
          })),
        },
      },
      include: { questions: true },
    });
  }

  // Get all attempts by a user for a course (for progress page)
  async getUserQuizHistory(userId: string, courseId: string) {
    return this.prisma.quizAttempt.findMany({
      where: {
        userId,
        quiz: { lesson: { section: { courseId } } },
      },
      orderBy: { attemptedAt: 'desc' },
      include: {
        quiz: { select: { id: true, title: true, passingScore: true, isFinalExam: true } },
      },
    });
  }
}
