import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: any;

  const mockContext: any = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({}), getResponse: () => ({}) }),
  };

  beforeEach(async () => {
    reflector = { getAllAndOverride: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [JwtAuthGuard, { provide: Reflector, useValue: reflector }],
    }).compile();
    guard = moduleRef.get(JwtAuthGuard);
  });

  it('allows the request through immediately when the route is @Public', () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('delegates to the passport JWT strategy when the route is not public', () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const superSpy = jest
      .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
      .mockReturnValue(true as any);

    const result = guard.canActivate(mockContext);
    expect(superSpy).toHaveBeenCalledWith(mockContext);
    expect(result).toBe(true);
    superSpy.mockRestore();
  });

  describe('handleRequest', () => {
    it('throws UnauthorizedException when there is no user and no error', () => {
      expect(() => guard.handleRequest(null, null)).toThrow(UnauthorizedException);
    });

    it('rethrows the original error when one is present', () => {
      const err = new Error('strategy failed');
      expect(() => guard.handleRequest(err, null)).toThrow(err);
    });

    it('returns the user when authentication succeeds', () => {
      const user = { id: 'u1' };
      expect(guard.handleRequest(null, user)).toBe(user);
    });
  });
});
