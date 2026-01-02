import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from '../strategies/jwt.strategy';

describe('JwtStrategy', () => {
  const makeStrategy = (overrides?: { user?: any; secret?: string; cachedUser?: any }) => {
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_SECRET') return overrides?.secret ?? 'test-secret';
        return undefined;
      }),
    } as any;

    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(overrides?.user ?? null),
      },
    } as any;

    const cache = {
      get: jest.fn().mockResolvedValue(overrides?.cachedUser ?? null),
      set: jest.fn().mockResolvedValue(undefined),
    } as any;

    const strategy = new JwtStrategy(configService, prisma, cache);
    return { strategy, prisma, configService, cache };
  };

  it('falla si no hay sub/userId', async () => {
    const { strategy } = makeStrategy();

    await expect(strategy.validate({ email: 'x', role: 'tecnico' } as any)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('falla si el usuario no existe', async () => {
    const { strategy, prisma } = makeStrategy({ user: null });

    await expect(strategy.validate({ sub: 'user-1', email: 'x', role: 'tecnico' } as any)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.user.findUnique).toHaveBeenCalled();
  });

  it('usa caché si existe (evita query a DB)', async () => {
    const cachedUser = { id: 'user-1', email: 'e', name: 'n', role: 'tecnico', active: true };
    const { strategy, prisma, cache } = makeStrategy({ cachedUser });

    const result = await strategy.validate({ sub: 'user-1', email: 'x', role: 'tecnico' } as any);

    expect(cache.get).toHaveBeenCalled();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(result).toEqual({
      userId: 'user-1',
      email: 'e',
      name: 'n',
      role: 'tecnico',
    });
  });

  it('falla si el usuario está inactivo', async () => {
    const { strategy } = makeStrategy({ user: { id: 'user-1', email: 'e', name: 'n', role: 'tecnico', active: false } });

    await expect(strategy.validate({ userId: 'user-1', email: 'x', role: 'tecnico' } as any)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('retorna payload normalizado si es válido', async () => {
    const { strategy } = makeStrategy({ user: { id: 'user-1', email: 'e', name: 'n', role: 'tecnico', active: true } });

    const result = await strategy.validate({ sub: 'user-1', email: 'x', role: 'tecnico' } as any);

    expect(result).toEqual({
      userId: 'user-1',
      email: 'e',
      name: 'n',
      role: 'tecnico',
    });
  });
});
