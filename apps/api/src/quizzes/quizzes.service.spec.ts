import { Test } from '@nestjs/testing';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { PrismaService } from '../prisma/prisma.service';
import { CertificatesService } from '../certificates/certificates.service';
import { ProgressService } from '../progress/progress.service';

describe('QuizzesService', () => {
  let service: QuizzesService;
  let prisma: any;
  let certificates: any;
  let progress: any;

  const baseQuiz = {
    id: 'quiz1',
    lessonId: 'lesson1',
    passingScore: 70,
    isFinalExam: false,
    lesson: { id: 'lesson1', title: 'L1', section: { course: { id: 'course1' } } },
  };

  beforeEach(async () => {
    prisma = {
      quiz: { findUnique: jest.fn() },
      enrollment: { findUnique: jest.fn() },
      quizAttempt: { findMany: jest.fn(), create: jest.fn() },
      quizAnswerRecord: { findMany: jest.fn() },
      user: { update: jest.fn() },
      lessonProgress: { upsert: jest.fn() },
    };
    certificates = { issueCertificate: jest.fn() };
    progress = { recalcEnrollmentProgress: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        QuizzesService,
        { provide: PrismaService, useValue: prisma },
        { provide: CertificatesService, useValue: certificates },
        { provide: ProgressService, useValue: progress },
      ],
    }).compile();

    service = moduleRef.get(QuizzesService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getQuiz — enrollment gating (paywall)', () => {
    it('throws NotFoundException when the quiz does not exist', async () => {
      prisma.quiz.findUnique.mockResolvedValue(null);
      await expect(service.getQuiz('missing', 'u1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ForbiddenException when the user is not enrolled in the quiz\'s course', async () => {
      prisma.quiz.findUnique.mockResolvedValue({ ...baseQuiz, questions: [] });
      prisma.enrollment.findUnique.mockResolvedValue(null);

      await expect(service.getQuiz('quiz1', 'u1')).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.enrollment.findUnique).toHaveBeenCalledWith({
        where: { userId_courseId: { userId: 'u1', courseId: 'course1' } },
      });
    });

    it('returns quiz data with attempts and weak questions when enrolled', async () => {
      prisma.quiz.findUnique.mockResolvedValue({ ...baseQuiz, questions: [] });
      prisma.enrollment.findUnique.mockResolvedValue({ id: 'enr1' });
      prisma.quizAttempt.findMany.mockResolvedValue([
        { id: 'attempt1', score: 80, passed: true, attemptedAt: new Date(), timeTakenSec: 60 },
      ]);
      prisma.quizAnswerRecord.findMany.mockResolvedValue([{ questionId: 'q1' }]);

      const result = await service.getQuiz('quiz1', 'u1');
      expect(result.bestScore).toBe(80);
      expect(result.weakQuestionIds).toEqual(['q1']);
    });
  });

  describe('submitQuiz — scoring', () => {
    const questions = [
      { id: 'q1', order: 1, correctIndex: 0, explanation: 'e1', question: 'Q1', options: ['a', 'b'] },
      { id: 'q2', order: 2, correctIndex: 1, explanation: 'e2', question: 'Q2', options: ['a', 'b'] },
    ];

    it('rejects when the number of answers does not match the number of questions', async () => {
      prisma.quiz.findUnique.mockResolvedValue({ ...baseQuiz, questions });
      await expect(service.submitQuiz('quiz1', 'u1', [0])).rejects.toBeInstanceOf(BadRequestException);
    });

    it('computes score correctly and does not award XP or certificate on failure', async () => {
      prisma.quiz.findUnique.mockResolvedValue({ ...baseQuiz, questions });
      prisma.quizAttempt.create.mockResolvedValue({ id: 'attempt1' });

      // 1/2 correct = 50%, below passingScore 70 → fail
      const result = await service.submitQuiz('quiz1', 'u1', [0, 0]);

      expect(result.score).toBe(50);
      expect(result.passed).toBe(false);
      expect(result.xpEarned).toBe(0);
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(certificates.issueCertificate).not.toHaveBeenCalled();
    });

    it('awards XP, marks lesson complete, and recalculates progress on passing', async () => {
      prisma.quiz.findUnique.mockResolvedValue({ ...baseQuiz, questions });
      prisma.quizAttempt.create.mockResolvedValue({ id: 'attempt1' });
      prisma.user.update.mockResolvedValue({});
      prisma.lessonProgress.upsert.mockResolvedValue({});

      // Both correct = 100% → pass
      const result = await service.submitQuiz('quiz1', 'u1', [0, 1]);

      expect(result.score).toBe(100);
      expect(result.passed).toBe(true);
      expect(result.xpEarned).toBe(50);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { xpPoints: { increment: 50 } },
      });
      expect(progress.recalcEnrollmentProgress).toHaveBeenCalledWith('u1', 'course1');
      expect(certificates.issueCertificate).not.toHaveBeenCalled();
    });

    it('issues a certificate when a final exam is passed', async () => {
      prisma.quiz.findUnique.mockResolvedValue({ ...baseQuiz, isFinalExam: true, questions });
      prisma.quizAttempt.create.mockResolvedValue({ id: 'attempt1' });
      prisma.user.update.mockResolvedValue({});
      prisma.lessonProgress.upsert.mockResolvedValue({});
      certificates.issueCertificate.mockResolvedValue({ id: 'cert1' });

      const result = await service.submitQuiz('quiz1', 'u1', [0, 1]);

      expect(result.xpEarned).toBe(200);
      expect(certificates.issueCertificate).toHaveBeenCalledWith('u1', 'course1', 100);
      expect(result.certificate).toEqual({ id: 'cert1' });
    });

    it('never leaks correct answers in a way that bypasses grading (answers graded server-side)', async () => {
      prisma.quiz.findUnique.mockResolvedValue({ ...baseQuiz, questions });
      prisma.quizAttempt.create.mockResolvedValue({ id: 'attempt1' });

      const result = await service.submitQuiz('quiz1', 'u1', [0, 0]);
      // isCorrect must reflect server-known correctIndex, not client input
      expect(result.results[1].isCorrect).toBe(false);
      expect(result.results[1].correctIndex).toBe(1);
    });
  });
});
