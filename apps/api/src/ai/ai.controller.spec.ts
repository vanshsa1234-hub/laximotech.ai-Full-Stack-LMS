import { Test } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

describe('AiController', () => {
  let controller: AiController;
  let service: any;
  const res: any = {};

  beforeEach(async () => {
    service = {
      streamPublicChat: jest.fn(),
      streamChat: jest.fn(),
      getChatHistory: jest.fn().mockResolvedValue([]),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [AiController],
      providers: [{ provide: AiService, useValue: service }],
    }).compile();
    controller = moduleRef.get(AiController);
  });

  it('streamPublicChat forwards messages and response', () => {
    const body = { messages: [{ role: 'user' as const, content: 'hi' }] };
    controller.streamPublicChat(body, res);
    expect(service.streamPublicChat).toHaveBeenCalledWith(body.messages, res);
  });

  it('streamChat forwards user id, course/lesson ids, messages, and response', () => {
    const user = { id: 'u1' };
    const body = { courseId: 'c1', lessonId: 'l1', messages: [] };
    controller.streamChat(user, body, res);
    expect(service.streamChat).toHaveBeenCalledWith('u1', 'c1', 'l1', [], res);
  });

  it('streamChat defaults lessonId to null when absent', () => {
    const user = { id: 'u1' };
    const body = { courseId: 'c1', messages: [] };
    controller.streamChat(user, body as any, res);
    expect(service.streamChat).toHaveBeenCalledWith('u1', 'c1', null, [], res);
  });

  it('getHistory forwards user id, courseId, and lessonId', () => {
    controller.getHistory({ id: 'u1' }, 'c1', 'l1');
    expect(service.getChatHistory).toHaveBeenCalledWith('u1', 'c1', 'l1');
  });
});
