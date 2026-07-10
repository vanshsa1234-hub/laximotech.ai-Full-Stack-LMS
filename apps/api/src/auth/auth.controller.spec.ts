import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            forgotPassword: jest.fn(),
            resetPassword: jest.fn(),
            changePassword: jest.fn(),
            getProfile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(AuthController);
  });

  it('does not expose a sync route/handler (account-takeover regression)', () => {
    expect((controller as any).sync).toBeUndefined();
  });

  it('exposes exactly the expected set of handlers', () => {
    const handlers = Object.getOwnPropertyNames(Object.getPrototypeOf(controller)).filter(
      (name) => name !== 'constructor',
    );
    expect(handlers.sort()).toEqual(
      ['register', 'login', 'forgotPassword', 'resetPassword', 'changePassword', 'getMe'].sort(),
    );
  });
});
