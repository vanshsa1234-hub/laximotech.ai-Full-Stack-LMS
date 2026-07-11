import { Test } from '@nestjs/testing';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';

describe('QuizzesController', () => {
  let controller: QuizzesController;
  let service: any;

  beforeEach(async () => {
    service = {
      getUserQuizHistory: jest.fn().mockResolvedValue([]),
      getQuiz: jest.fn().mockResolvedValue({}),
      submitQuiz: jest.fn().mockResolvedValue({}),
      createQuiz: jest.fn().mockResolvedValue({}),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [QuizzesController],
      providers: [{ provide: QuizzesService, useValue: service }],
    }).compile();
    controller = moduleRef.get(QuizzesController);
  });

  it('history forwards user id and courseId', () => {
    controller.history({ id: 'u1' }, 'c1');
    expect(service.getUserQuizHistory).toHaveBeenCalledWith('u1', 'c1');
  });

  it('getQuiz forwards quizId and user id', () => {
    controller.getQuiz('q1', { id: 'u1' });
    expect(service.getQuiz).toHaveBeenCalledWith('q1', 'u1');
  });

  it('submit forwards quizId, user id, answers, and timeTakenSec', () => {
    controller.submit('q1', { id: 'u1' }, { answers: [0, 1], timeTakenSec: 60 });
    expect(service.submitQuiz).toHaveBeenCalledWith('q1', 'u1', [0, 1], 60);
  });

  it('createQuiz forwards lessonId and body', () => {
    controller.createQuiz('l1', { title: 'Q' });
    expect(service.createQuiz).toHaveBeenCalledWith('l1', { title: 'Q' });
  });
});
