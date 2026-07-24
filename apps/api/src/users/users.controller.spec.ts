import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: any;

  beforeEach(async () => {
    service = {
      getProfile: jest.fn().mockResolvedValue({}),
      getDashboardStats: jest.fn().mockResolvedValue({}),
      getActivityHeatmap: jest.fn().mockResolvedValue({}),
      updateProfile: jest.fn().mockResolvedValue({}),
      getLeaderboard: jest.fn().mockResolvedValue([]),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: service }],
    }).compile();
    controller = moduleRef.get(UsersController);
  });

  it('getProfile/getStats/getActivity forward user id', () => {
    controller.getProfile({ id: 'u1' });
    controller.getStats({ id: 'u1' });
    controller.getActivity({ id: 'u1' });
    expect(service.getProfile).toHaveBeenCalledWith('u1');
    expect(service.getDashboardStats).toHaveBeenCalledWith('u1');
    expect(service.getActivityHeatmap).toHaveBeenCalledWith('u1');
  });

  it('updateProfile forwards user id and body', () => {
    controller.updateProfile({ id: 'u1' }, { name: 'New' });
    expect(service.updateProfile).toHaveBeenCalledWith('u1', { name: 'New' });
  });

  it('getLeaderboard defaults limit to 20 when not provided', () => {
    controller.getLeaderboard();
    expect(service.getLeaderboard).toHaveBeenCalledWith(20);
  });

  it('getLeaderboard parses a provided limit', () => {
    controller.getLeaderboard('5');
    expect(service.getLeaderboard).toHaveBeenCalledWith(5);
  });
});
