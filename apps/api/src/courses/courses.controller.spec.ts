import { Test } from '@nestjs/testing';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

describe('CoursesController', () => {
  let controller: CoursesController;
  let service: any;

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue({}),
      getBuilder: jest.fn().mockResolvedValue({}),
      createSection: jest.fn().mockResolvedValue({}),
      updateSection: jest.fn().mockResolvedValue({}),
      createLesson: jest.fn().mockResolvedValue({}),
      updateLesson: jest.fn().mockResolvedValue({}),
      upsertLessonQuiz: jest.fn().mockResolvedValue({}),
      findAllForAdmin: jest.fn().mockResolvedValue({}),
      findBySlug: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [{ provide: CoursesService, useValue: service }],
    }).compile();
    controller = moduleRef.get(CoursesController);
  });

  it('findAll forwards query', () => {
    controller.findAll({ category: 'AI' });
    expect(service.findAll).toHaveBeenCalledWith({ category: 'AI' });
  });

  it('getBuilder/createSection/updateSection/createLesson/updateLesson/upsertLessonQuiz forward args', () => {
    controller.getBuilder('c1');
    controller.createSection('c1', { title: 'S' });
    controller.updateSection('s1', { title: 'S2' });
    controller.createLesson('s1', { title: 'L' });
    controller.updateLesson('l1', { title: 'L2' });
    controller.upsertLessonQuiz('l1', { title: 'Q' });
    expect(service.getBuilder).toHaveBeenCalledWith('c1');
    expect(service.createSection).toHaveBeenCalledWith('c1', { title: 'S' });
    expect(service.updateSection).toHaveBeenCalledWith('s1', { title: 'S2' });
    expect(service.createLesson).toHaveBeenCalledWith('s1', { title: 'L' });
    expect(service.updateLesson).toHaveBeenCalledWith('l1', { title: 'L2' });
    expect(service.upsertLessonQuiz).toHaveBeenCalledWith('l1', { title: 'Q' });
  });

  it('findAllAdmin forwards query', () => {
    controller.findAllAdmin({ q: 'x' });
    expect(service.findAllForAdmin).toHaveBeenCalledWith({ q: 'x' });
  });

  it('findOne forwards slug', () => {
    controller.findOne('my-course');
    expect(service.findBySlug).toHaveBeenCalledWith('my-course');
  });

  describe('create — instructor impersonation prevention', () => {
    it('forces instructorId to the caller\'s own id for INSTRUCTOR users, ignoring any instructorId in the body', () => {
      controller.create({ id: 'instructor-1', role: 'INSTRUCTOR' }, { title: 'T', instructorId: 'someone-else' });
      expect(service.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'T', instructorId: 'instructor-1' }),
      );
    });

    it('allows ADMIN users to assign any instructor explicitly', () => {
      controller.create({ id: 'admin-1', role: 'ADMIN' }, { title: 'T', instructorId: 'real-instructor' });
      expect(service.create).toHaveBeenCalledWith(
        expect.objectContaining({ instructorId: 'real-instructor' }),
      );
    });

    it('defaults instructorId to the admin\'s own id if none is given in the body', () => {
      controller.create({ id: 'admin-1', role: 'ADMIN' }, { title: 'T' });
      expect(service.create).toHaveBeenCalledWith(
        expect.objectContaining({ instructorId: 'admin-1' }),
      );
    });
  });

  describe('update — instructor reassignment restriction', () => {
    it('strips instructorId from the payload for non-admin users', () => {
      controller.update({ id: 'instructor-1', role: 'INSTRUCTOR' }, 'course1', { title: 'New', instructorId: 'hijack-attempt' });
      const arg = service.update.mock.calls[0][1];
      expect(arg.instructorId).toBeUndefined();
      expect(arg.title).toBe('New');
    });

    it('allows admins to reassign the instructor', () => {
      controller.update({ id: 'admin-1', role: 'ADMIN' }, 'course1', { title: 'New', instructorId: 'new-instructor' });
      expect(service.update).toHaveBeenCalledWith('course1', { title: 'New', instructorId: 'new-instructor' });
    });
  });
});
