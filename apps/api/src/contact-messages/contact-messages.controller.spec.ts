import { Test } from '@nestjs/testing';
import { ContactMessagesController } from './contact-messages.controller';
import { ContactMessagesService } from './contact-messages.service';

describe('ContactMessagesController', () => {
  let controller: ContactMessagesController;
  let service: any;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue({}),
      findAll: jest.fn().mockResolvedValue({}),
      updateStatus: jest.fn().mockResolvedValue({}),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [ContactMessagesController],
      providers: [{ provide: ContactMessagesService, useValue: service }],
    }).compile();
    controller = moduleRef.get(ContactMessagesController);
  });

  it('create forwards body', () => {
    const body = { name: 'A', email: 'a@a.com', subject: 's', message: 'm' };
    controller.create(body);
    expect(service.create).toHaveBeenCalledWith(body);
  });

  it('findAll forwards query', () => {
    controller.findAll({ status: 'PENDING' });
    expect(service.findAll).toHaveBeenCalledWith({ status: 'PENDING' });
  });

  it('updateStatus forwards id and status', () => {
    controller.updateStatus('m1', { status: 'RESOLVED' as any });
    expect(service.updateStatus).toHaveBeenCalledWith('m1', 'RESOLVED');
  });
});
