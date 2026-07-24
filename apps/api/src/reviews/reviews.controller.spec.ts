import { Test } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let service: any;

  beforeEach(async () => {
    service = {
      featured: jest.fn().mockResolvedValue([]),
      platformStats: jest.fn().mockResolvedValue({}),
      upsert: jest.fn().mockResolvedValue({}),
      myReview: jest.fn().mockResolvedValue({}),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [{ provide: ReviewsService, useValue: service }],
    }).compile();
    controller = moduleRef.get(ReviewsController);
  });

  it('featured/platformStats delegate to service', () => {
    controller.featured();
    controller.platformStats();
    expect(service.featured).toHaveBeenCalled();
    expect(service.platformStats).toHaveBeenCalled();
  });

  it('upsert forwards user id, courseId, and body', () => {
    controller.upsert({ id: 'u1' }, 'c1', { rating: 5, comment: 'Great' });
    expect(service.upsert).toHaveBeenCalledWith('u1', 'c1', { rating: 5, comment: 'Great' });
  });

  it('myReview forwards user id and courseId', () => {
    controller.myReview({ id: 'u1' }, 'c1');
    expect(service.myReview).toHaveBeenCalledWith('u1', 'c1');
  });
});
