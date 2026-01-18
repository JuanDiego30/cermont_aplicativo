import { UnauthorizedException } from '@nestjs/common';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import type { JwtService } from '@nestjs/jwt';
import { Email } from '../../../shared/domain/value-objects';
import type { AuthContext } from '../application/dto';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.use-case';
import type { IAuthRepository } from '../domain/repositories';

describe('RefreshTokenUseCase', () => {
  const mockAuthRepository: jest.Mocked<IAuthRepository> = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findUserById: jest.fn(),
    create: jest.fn(),
    updateLastLogin: jest.fn(),
    incrementLoginAttempts: jest.fn(),
    resetLoginAttempts: jest.fn(),
    createRefreshToken: jest.fn(),
    findRefreshToken: jest.fn(),
    revokeRefreshToken: jest.fn(),
    revokeTokenFamily: jest.fn(),
    createAuditLog: jest.fn(),
    findSessionByToken: jest.fn(),
    revokeSessionFamily: jest.fn(),
    revokeSession: jest.fn(),
    createSession: jest.fn(),
  };

  const mockJwtService: jest.Mocked<Pick<JwtService, 'sign'>> = {
    sign: jest.fn(),
  };

  const mockEventEmitter: jest.Mocked<Pick<EventEmitter2, 'emit'>> = {
    emit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('refresh válido retorna nuevo access token y refresh token', async () => {
    mockJwtService.sign.mockReturnValue('new-access');

    const session = {
      id: 'sess-1',
      userId: 'user-1',
      family: 'fam-1',
      isRevoked: false,
      isExpired: false,
      rotate: jest.fn(() => ({ refreshToken: 'new-refresh' })),
    };

    mockAuthRepository.findSessionByToken.mockResolvedValue(session);
    mockAuthRepository.findUserById.mockResolvedValue({
      id: 'user-1',
      email: Email.create('test@example.com'),
      role: 'tecnico',
      active: true,
    } as any);

    const useCase = new RefreshTokenUseCase(
      mockAuthRepository,
      mockJwtService as unknown as JwtService,
      mockEventEmitter as unknown as EventEmitter2
    );

    const context: AuthContext = {
      ip: '127.0.0.1',
      userAgent: 'jest',
    };

    const result = await useCase.execute('old-refresh', context);

    expect(result.token).toBe('new-access');
    expect(result.refreshToken).toBe('new-refresh');
    expect(mockAuthRepository.revokeSession).toHaveBeenCalledWith('old-refresh');
    expect(mockAuthRepository.createSession).toHaveBeenCalledWith({
      refreshToken: 'new-refresh',
    });
    expect(mockEventEmitter.emit).toHaveBeenCalled();
  });

  it('refresh token robado (revoked) retorna 401 y revoca familia', async () => {
    const session = {
      id: 'sess-2',
      userId: 'user-1',
      family: 'fam-2',
      isRevoked: true,
      isExpired: false,
      rotate: jest.fn(),
    };

    mockAuthRepository.findSessionByToken.mockResolvedValue(session);

    const useCase = new RefreshTokenUseCase(
      mockAuthRepository,
      mockJwtService as unknown as JwtService,
      mockEventEmitter as unknown as EventEmitter2
    );

    const context: AuthContext = {};

    await expect(useCase.execute('rt', context)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(mockAuthRepository.revokeSessionFamily).toHaveBeenCalledWith('fam-2');
  });

  it('refresh token expirado retorna 401', async () => {
    const session = {
      id: 'sess-3',
      userId: 'user-1',
      family: 'fam-3',
      isRevoked: false,
      isExpired: true,
      rotate: jest.fn(),
    };

    mockAuthRepository.findSessionByToken.mockResolvedValue(session);

    const useCase = new RefreshTokenUseCase(
      mockAuthRepository,
      mockJwtService as unknown as JwtService,
      mockEventEmitter as unknown as EventEmitter2
    );

    const context: AuthContext = {};

    await expect(useCase.execute('rt', context)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(mockAuthRepository.revokeSession).not.toHaveBeenCalled();
  });
});
