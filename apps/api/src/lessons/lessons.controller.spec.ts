import { Test } from '@nestjs/testing';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';

describe('LessonsController', () => {
  let controller: LessonsController;
  let service: any;

  beforeEach(async () => {
    service = {
      getLesson: jest.fn().mockResolvedValue({}),
      getCourseLessons: jest.fn().mockResolvedValue({}),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [LessonsController],
      providers: [{ provide: LessonsService, useValue: service }],
    }).compile();
    controller = moduleRef.get(LessonsController);
  });

  it('getLesson forwards lessonId and user id', () => {
    controller.getLesson('l1', { id: 'u1' });
    expect(service.getLesson).toHaveBeenCalledWith('l1', 'u1');
  });

  it('getCourseLessons forwards courseSlug and user id', () => {
    controller.getCourseLessons('slug', { id: 'u1' });
    expect(service.getCourseLessons).toHaveBeenCalledWith('slug', 'u1');
  });
});
