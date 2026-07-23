import { Test } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: any;

  function contextFor(user: any) {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    } as any;
  }

  beforeEach(async () => {
    reflector = { getAllAndOverride: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [RolesGuard, { provide: Reflector, useValue: reflector }],
    }).compile();
    guard = moduleRef.get(RolesGuard);
  });

  it('allows access when the route has no @Roles requirement', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(contextFor({ role: 'STUDENT' }))).toBe(true);
  });

  it('allows access when the user has one of the required roles', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN', 'INSTRUCTOR']);
    expect(guard.canActivate(contextFor({ role: 'INSTRUCTOR' }))).toBe(true);
  });

  it('denies access and throws ForbiddenException when the role does not match', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    expect(() => guard.canActivate(contextFor({ role: 'STUDENT' }))).toThrow(ForbiddenException);
  });
});
