import { Test } from '@nestjs/testing';
import { CareerPathsController } from './career-paths.controller';
import { CareerPathsService } from './career-paths.service';

describe('CareerPathsController', () => {
  let controller: CareerPathsController;
  let service: any;

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue({}),
      findById: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      remove: jest.fn().mockResolvedValue({}),
      addCourse: jest.fn().mockResolvedValue({}),
      removeCourse: jest.fn().mockResolvedValue({}),
      findBySlug: jest.fn().mockResolvedValue({}),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [CareerPathsController],
      providers: [{ provide: CareerPathsService, useValue: service }],
    }).compile();
    controller = moduleRef.get(CareerPathsController);
  });

  it('findAll delegates to service', () => {
    controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
  });

  it('findByIdAdmin forwards id', () => {
    controller.findByIdAdmin('p1');
    expect(service.findById).toHaveBeenCalledWith('p1');
  });

  it('create forwards body', () => {
    controller.create({ title: 'T' });
    expect(service.create).toHaveBeenCalledWith({ title: 'T' });
  });

  it('update forwards id and body', () => {
    controller.update('p1', { title: 'New' });
    expect(service.update).toHaveBeenCalledWith('p1', { title: 'New' });
  });

  it('remove forwards id', () => {
    controller.remove('p1');
    expect(service.remove).toHaveBeenCalledWith('p1');
  });

  it('addCourse forwards id and body', () => {
    controller.addCourse('p1', { courseId: 'c1', step: 1, label: 'Step 1' });
    expect(service.addCourse).toHaveBeenCalledWith('p1', { courseId: 'c1', step: 1, label: 'Step 1' });
  });

  it('removeCourse forwards entryId', () => {
    controller.removeCourse('e1');
    expect(service.removeCourse).toHaveBeenCalledWith('e1');
  });

  it('findOne forwards slug', () => {
    controller.findOne('dev-path');
    expect(service.findBySlug).toHaveBeenCalledWith('dev-path');
  });
});
