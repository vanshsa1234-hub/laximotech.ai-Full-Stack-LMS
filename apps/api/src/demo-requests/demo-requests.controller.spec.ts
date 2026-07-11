import { Test } from '@nestjs/testing';
import { DemoRequestsController } from './demo-requests.controller';
import { DemoRequestsService } from './demo-requests.service';

describe('DemoRequestsController', () => {
  let controller: DemoRequestsController;
  let service: any;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue({}),
      findAll: jest.fn().mockResolvedValue({}),
      updateStatus: jest.fn().mockResolvedValue({}),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [DemoRequestsController],
      providers: [{ provide: DemoRequestsService, useValue: service }],
    }).compile();
    controller = moduleRef.get(DemoRequestsController);
  });

  it('create forwards body', () => {
    const body = { name: 'A', phone: '999', email: 'a@a.com', topic: 't', slot: 's', mode: 'online' };
    controller.create(body);
    expect(service.create).toHaveBeenCalledWith(body);
  });

  it('findAll forwards query', () => {
    controller.findAll({ status: 'PENDING' });
    expect(service.findAll).toHaveBeenCalledWith({ status: 'PENDING' });
  });

  it('updateStatus forwards id and status', () => {
    controller.updateStatus('d1', { status: 'CONTACTED' as any });
    expect(service.updateStatus).toHaveBeenCalledWith('d1', 'CONTACTED');
  });
});
