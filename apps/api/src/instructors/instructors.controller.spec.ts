import { Test } from '@nestjs/testing';
import { InstructorsController } from './instructors.controller';
import { InstructorsService } from './instructors.service';

describe('InstructorsController', () => {
  let controller: InstructorsController;
  let service: any;

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      remove: jest.fn().mockResolvedValue({}),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [InstructorsController],
      providers: [{ provide: InstructorsService, useValue: service }],
    }).compile();
    controller = moduleRef.get(InstructorsController);
  });

  it('findAll delegates to service', () => {
    controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
  });

  it('findOne forwards id', () => {
    controller.findOne('i1');
    expect(service.findOne).toHaveBeenCalledWith('i1');
  });

  it('create forwards body', () => {
    controller.create({ name: 'A' });
    expect(service.create).toHaveBeenCalledWith({ name: 'A' });
  });

  it('update forwards id and body', () => {
    controller.update('i1', { bio: 'New' });
    expect(service.update).toHaveBeenCalledWith('i1', { bio: 'New' });
  });

  it('remove forwards id', () => {
    controller.remove('i1');
    expect(service.remove).toHaveBeenCalledWith('i1');
  });
});
