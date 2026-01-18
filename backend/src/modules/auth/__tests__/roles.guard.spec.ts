import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../guards/roles.guard';

describe('RolesGuard (module auth)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sin roles requeridos: permite acceso', () => {
    const reflector = {
      getAllAndOverride: jest.fn(() => undefined),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: 'tecnico' } }),
      }),
    } as any;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('rol correcto: permite acceso (case-insensitive)', () => {
    const reflector = {
      getAllAndOverride: jest.fn(() => ['admin', 'supervisor']),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({ user: { role: 'Admin' } }) }),
    } as any;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('sin rol en request: lanza Forbidden', () => {
    const reflector = {
      getAllAndOverride: jest.fn(() => ['admin']),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({}) }),
    } as any;

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('rol incorrecto: lanza Forbidden', () => {
    const reflector = {
      getAllAndOverride: jest.fn(() => ['admin']),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: 'tecnico' } }),
      }),
    } as any;

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
