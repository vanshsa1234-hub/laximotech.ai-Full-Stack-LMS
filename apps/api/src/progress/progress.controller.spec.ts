import { Test } from '@nestjs/testing';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

describe('ProgressController', () => {
  let controller: ProgressController;
  let service: any;

  beforeEach(async () => {
    service = {
      updateProgress: jest.fn().mockResolvedValue({}),
      getCourseProgress: jest.fn().mockResolvedValue([]),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [ProgressController],
      providers: [{ provide: ProgressService, useValue: service }],
    }).compile();
    controller = moduleRef.get(ProgressController);
  });

  it('update forwards user id, lessonId, watchedSeconds, and bookmarkSeconds', () => {
    controller.update({ id: 'u1' }, { lessonId: 'l1', watchedSeconds: 60, bookmarkSeconds: 30 });
    expect(service.updateProgress).toHaveBeenCalledWith('u1', 'l1', 60, 30);
  });

  it('getCourseProgress forwards user id and courseId', () => {
    controller.getCourseProgress({ id: 'u1' }, 'c1');
    expect(service.getCourseProgress).toHaveBeenCalledWith('u1', 'c1');
  });
});
