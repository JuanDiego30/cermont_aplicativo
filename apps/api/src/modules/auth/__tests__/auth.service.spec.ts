import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

describe('AuthService (legacy)', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  const jwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const configService = {
    get: jest.fn(),
  };

  const passwordService = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('login válido retorna token + refreshToken', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'u1@example.com',
      password: 'hash',
      name: 'U1',
      role: 'tecnico',
      active: true,
      avatar: null,
      phone: null,
    });

    passwordService.compare.mockResolvedValue(true);
    jwtService.sign.mockReturnValue('access');
    prisma.refreshToken.create.mockResolvedValue({});
    prisma.auditLog.create.mockResolvedValue({});
    prisma.user.update.mockResolvedValue({});

    const service = new AuthService(prisma as any, jwtService as any, configService as any, passwordService as any);

    const result = await service.login({ email: 'u1@example.com', password: 'Password1!' } as any);

    expect(result.token).toBe('access');
    expect(result.refreshToken).toBeDefined();
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });

  it('login con password inválida retorna 401', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'u1@example.com',
      password: 'hash',
      name: 'U1',
      role: 'tecnico',
      active: true,
    });
    passwordService.compare.mockResolvedValue(false);

    const service = new AuthService(prisma as any, jwtService as any, configService as any, passwordService as any);

    await expect(service.login({ email: 'u1@example.com', password: 'bad' } as any)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('login con usuario inexistente retorna 401', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const service = new AuthService(prisma as any, jwtService as any, configService as any, passwordService as any);
    await expect(service.login({ email: 'missing@example.com', password: 'Password1!' } as any)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('register: si email existe retorna 409', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1' });

    const service = new AuthService(prisma as any, jwtService as any, configService as any, passwordService as any);
    await expect(
      service.register({ email: 'u1@example.com', password: 'Password1!', name: 'U1' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('register: crea usuario, audita y retorna tokens', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    passwordService.hash.mockResolvedValue('hash');
    prisma.user.create.mockResolvedValue({
      id: 'u2',
      email: 'u2@example.com',
      password: 'hash',
      name: 'U2',
      role: 'tecnico',
      active: true,
      avatar: null,
      phone: null,
    });

    jwtService.sign.mockReturnValue('access');
    prisma.refreshToken.create.mockResolvedValue({});
    prisma.auditLog.create.mockResolvedValue({});

    const service = new AuthService(prisma as any, jwtService as any, configService as any, passwordService as any);
    const result = await service.register({ email: 'u2@example.com', password: 'Password1!', name: 'U2' } as any);

    expect(result.token).toBe('access');
    expect(result.refreshToken).toBeDefined();
    expect(prisma.user.create).toHaveBeenCalled();
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });

  it('refresh token revocado revoca familia y retorna 401', async () => {
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: 'rt-1',
      token: 'rt',
      family: 'fam',
      isRevoked: true,
      expiresAt: new Date(Date.now() + 10000),
      user: { id: 'u1', email: 'u1@example.com', role: 'tecnico' },
    });

    const service = new AuthService(prisma as any, jwtService as any, configService as any, passwordService as any);

    await expect(service.refresh('rt')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { family: 'fam' },
      data: { isRevoked: true },
    });
  });

  it('refresh token expirado retorna 401', async () => {
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: 'rt-1',
      token: 'rt',
      family: 'fam',
      isRevoked: false,
      expiresAt: new Date(Date.now() - 1000),
      user: { id: 'u1', email: 'u1@example.com', role: 'tecnico' },
    });

    const service = new AuthService(prisma as any, jwtService as any, configService as any, passwordService as any);
    await expect(service.refresh('rt')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refresh token válido: revoca actual y retorna nuevos tokens', async () => {
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: 'rt-1',
      token: 'rt',
      family: 'fam',
      isRevoked: false,
      expiresAt: new Date(Date.now() + 100000),
      user: { id: 'u1', email: 'u1@example.com', role: 'tecnico' },
    });

    prisma.refreshToken.update.mockResolvedValue({});
    prisma.refreshToken.create.mockResolvedValue({});
    prisma.auditLog.create.mockResolvedValue({});
    jwtService.sign.mockReturnValue('access');

    const service = new AuthService(prisma as any, jwtService as any, configService as any, passwordService as any);
    const result = await service.refresh('rt');

    expect(result.accessToken).toBe('access');
    expect(result.refreshToken).toBeDefined();
    expect(prisma.refreshToken.update).toHaveBeenCalledWith({ where: { id: 'rt-1' }, data: { isRevoked: true } });
  });

  it('validateToken: retorna null si verify falla', () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error('bad');
    });

    const service = new AuthService(prisma as any, jwtService as any, configService as any, passwordService as any);
    expect(service.validateToken('x')).toBeNull();
  });

  it('validateToken: retorna payload si verify funciona', () => {
    jwtService.verify.mockReturnValue({ sub: 'u1' });
    const service = new AuthService(prisma as any, jwtService as any, configService as any, passwordService as any);
    expect(service.validateToken('ok')).toEqual({ sub: 'u1' });
  });

  it('logout: revoca refreshToken y audita si accessToken es válido', async () => {
    prisma.refreshToken.updateMany.mockResolvedValue({});
    prisma.auditLog.create.mockResolvedValue({});
    jwtService.verify.mockReturnValue({ sub: 'u1' });

    const service = new AuthService(prisma as any, jwtService as any, configService as any, passwordService as any);
    await expect(service.logout('access', 'rt')).resolves.toBeUndefined();

    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({ where: { token: 'rt' }, data: { isRevoked: true } });
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });

  it('logout: no falla si verify del accessToken lanza error', async () => {
    prisma.refreshToken.updateMany.mockResolvedValue({});
    jwtService.verify.mockImplementation(() => {
      throw new Error('bad token');
    });

    const service = new AuthService(prisma as any, jwtService as any, configService as any, passwordService as any);
    await expect(service.logout('access', 'rt')).resolves.toBeUndefined();
  });
});

