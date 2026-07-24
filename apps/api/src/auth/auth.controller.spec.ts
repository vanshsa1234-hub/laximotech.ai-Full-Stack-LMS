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

  describe('handler delegation', () => {
    let auth: any;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        controllers: [AuthController],
        providers: [
          {
            provide: AuthService,
            useValue: {
              register: jest.fn().mockResolvedValue({ token: 'reg-token' }),
              login: jest.fn().mockResolvedValue({ token: 'login-token' }),
              forgotPassword: jest.fn().mockResolvedValue({ message: 'sent' }),
              resetPassword: jest.fn().mockResolvedValue({ message: 'reset' }),
              changePassword: jest.fn().mockResolvedValue({ message: 'changed' }),
              getProfile: jest.fn().mockResolvedValue({ id: 'u1' }),
            },
          },
        ],
      }).compile();

      controller = moduleRef.get(AuthController);
      auth = moduleRef.get(AuthService);
    });

    it('register forwards the body to AuthService.register', async () => {
      const body = { name: 'A', email: 'a@a.com', password: 'password123' };
      const result = await controller.register(body);
      expect(auth.register).toHaveBeenCalledWith(body);
      expect(result).toEqual({ token: 'reg-token' });
    });

    it('login forwards the body to AuthService.login', async () => {
      const body = { email: 'a@a.com', password: 'password123' };
      const result = await controller.login(body);
      expect(auth.login).toHaveBeenCalledWith(body);
      expect(result).toEqual({ token: 'login-token' });
    });

    it('forgotPassword forwards the email to AuthService.forgotPassword', async () => {
      const result = await controller.forgotPassword({ email: 'a@a.com' });
      expect(auth.forgotPassword).toHaveBeenCalledWith('a@a.com');
      expect(result).toEqual({ message: 'sent' });
    });

    it('resetPassword forwards the body to AuthService.resetPassword', async () => {
      const body = { token: 'tok', email: 'a@a.com', newPassword: 'newpassword123' };
      const result = await controller.resetPassword(body);
      expect(auth.resetPassword).toHaveBeenCalledWith(body);
      expect(result).toEqual({ message: 'reset' });
    });

    it('changePassword forwards the current user id + body to AuthService.changePassword', async () => {
      const body = { currentPassword: 'old', newPassword: 'newpassword123' };
      const result = await controller.changePassword({ id: 'u1' }, body);
      expect(auth.changePassword).toHaveBeenCalledWith('u1', body);
      expect(result).toEqual({ message: 'changed' });
    });

    it('getMe forwards the current user id to AuthService.getProfile', async () => {
      const result = await controller.getMe({ id: 'u1' });
      expect(auth.getProfile).toHaveBeenCalledWith('u1');
      expect(result).toEqual({ id: 'u1' });
    });
  });
});