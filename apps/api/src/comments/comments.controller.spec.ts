import { Test } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: any;

  beforeEach(async () => {
    service = {
      getLessonComments: jest.fn().mockResolvedValue([]),
      getReplies: jest.fn().mockResolvedValue([]),
      createComment: jest.fn().mockResolvedValue({}),
      voteComment: jest.fn().mockResolvedValue({}),
      deleteComment: jest.fn().mockResolvedValue({}),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [{ provide: CommentsService, useValue: service }],
    }).compile();
    controller = moduleRef.get(CommentsController);
  });

  it('getLessonComments forwards lessonId', () => {
    controller.getLessonComments('l1');
    expect(service.getLessonComments).toHaveBeenCalledWith('l1');
  });

  it('getReplies forwards parentId', () => {
    controller.getReplies('p1');
    expect(service.getReplies).toHaveBeenCalledWith('p1');
  });

  it('create forwards user id and body', () => {
    controller.create({ id: 'u1' }, { body: 'hi' });
    expect(service.createComment).toHaveBeenCalledWith('u1', { body: 'hi' });
  });

  it('vote forwards user id, comment id, and isUpvote', () => {
    controller.vote({ id: 'u1' }, 'c1', { isUpvote: true });
    expect(service.voteComment).toHaveBeenCalledWith('u1', 'c1', true);
  });

  it('delete forwards user id, comment id, and role', () => {
    controller.delete({ id: 'u1', role: 'ADMIN' }, 'c1');
    expect(service.deleteComment).toHaveBeenCalledWith('u1', 'c1', 'ADMIN');
  });
});
