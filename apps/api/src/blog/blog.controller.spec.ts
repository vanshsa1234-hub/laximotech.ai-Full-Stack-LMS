import { Test } from '@nestjs/testing';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';

describe('BlogController', () => {
  let controller: BlogController;
  let service: any;

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue({}),
      findAllAdmin: jest.fn().mockResolvedValue({}),
      findById: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({}),
      publish: jest.fn().mockResolvedValue({}),
      unpublish: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      remove: jest.fn().mockResolvedValue({}),
      findBySlug: jest.fn().mockResolvedValue({}),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [BlogController],
      providers: [{ provide: BlogService, useValue: service }],
    }).compile();
    controller = moduleRef.get(BlogController);
  });

  it('findAll forwards query', () => {
    controller.findAll({ page: '1' });
    expect(service.findAll).toHaveBeenCalledWith({ page: '1' });
  });

  it('findAllAdmin forwards query', () => {
    controller.findAllAdmin({ status: 'draft' });
    expect(service.findAllAdmin).toHaveBeenCalledWith({ status: 'draft' });
  });

  it('findByIdAdmin forwards id', () => {
    controller.findByIdAdmin('p1');
    expect(service.findById).toHaveBeenCalledWith('p1');
  });

  it('create forwards author id and body', () => {
    controller.create({ id: 'u1' }, { title: 'T' });
    expect(service.create).toHaveBeenCalledWith('u1', { title: 'T' });
  });

  it('publish/unpublish/update/remove forward id', () => {
    controller.publish('p1');
    controller.unpublish('p1');
    controller.update('p1', { title: 'New' });
    controller.remove('p1');
    expect(service.publish).toHaveBeenCalledWith('p1');
    expect(service.unpublish).toHaveBeenCalledWith('p1');
    expect(service.update).toHaveBeenCalledWith('p1', { title: 'New' });
    expect(service.remove).toHaveBeenCalledWith('p1');
  });

  it('findOne forwards slug', () => {
    controller.findOne('my-post');
    expect(service.findBySlug).toHaveBeenCalledWith('my-post');
  });
});
