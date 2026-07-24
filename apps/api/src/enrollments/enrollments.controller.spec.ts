import { Test } from '@nestjs/testing';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';

describe('EnrollmentsController', () => {
  let controller: EnrollmentsController;
  let service: any;

  beforeEach(async () => {
    service = {
      getMyEnrollments: jest.fn().mockResolvedValue([]),
      checkEnrollment: jest.fn().mockResolvedValue({}),
      getEnrollmentWithProgress: jest.fn().mockResolvedValue({}),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [EnrollmentsController],
      providers: [{ provide: EnrollmentsService, useValue: service }],
    }).compile();
    controller = moduleRef.get(EnrollmentsController);
  });

  it('getMyEnrollments forwards user id', () => {
    controller.getMyEnrollments({ id: 'u1' });
    expect(service.getMyEnrollments).toHaveBeenCalledWith('u1');
  });

  it('checkEnrollment forwards user id and courseId', () => {
    controller.checkEnrollment({ id: 'u1' }, 'c1');
    expect(service.checkEnrollment).toHaveBeenCalledWith('u1', 'c1');
  });

  it('getProgress forwards user id and courseSlug', () => {
    controller.getProgress({ id: 'u1' }, 'slug');
    expect(service.getEnrollmentWithProgress).toHaveBeenCalledWith('u1', 'slug');
  });
});
