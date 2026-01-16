const mockCanActivate = jest.fn();

jest.mock('@nestjs/passport', () => ({
  AuthGuard: () => {
    return class {
      canActivate(context: unknown) {
        return mockCanActivate(context);
      }
    };
  },
}));

import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

describe('JwtAuthGuard (module auth)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ruta pública: canActivate retorna true y no delega', () => {
    mockCanActivate.mockReturnValue(true);

    const reflector = {
      getAllAndOverride: jest.fn(() => true),
    } as unknown as Reflector;

    const guard = new JwtAuthGuard(reflector);

    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;

    const result = guard.canActivate(context);

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    expect(result).toBe(true);
    expect(mockCanActivate).not.toHaveBeenCalled();
  });

  it('ruta privada: delega a AuthGuard', () => {
    mockCanActivate.mockReturnValue('delegated');

    const reflector = {
      getAllAndOverride: jest.fn(() => false),
    } as unknown as Reflector;

    const guard = new JwtAuthGuard(reflector);

    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;

    const result = guard.canActivate(context);

    expect(result).toBe('delegated');
    expect(mockCanActivate).toHaveBeenCalledTimes(1);
  });

  it('handleRequest: sin usuario lanza Unauthorized', () => {
    const reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector);

    expect(() => guard.handleRequest(null, null, null)).toThrow(UnauthorizedException);
  });

  it('handleRequest: con usuario retorna usuario', () => {
    const reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector);

    const user = { id: 'u1' };
    expect(guard.handleRequest(null, user, null)).toBe(user);
  });
});
