/**
 * Tests unitarios para AuthService
 */

import { AuthService } from '../../../domain/services/AuthService';
import { AppError } from '../../../shared/errors';

// Mocks
const mockUserRepository = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const mockRevokedTokenRepository = {
  add: jest.fn(),
  isRevoked: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
};

const mockRefreshTokenService = {
  createToken: jest.fn(),
  validateAndRotate: jest.fn(),
  revokeUserTokens: jest.fn(),
};

const mockAuditService = {
  log: jest.fn(),
};

const mockPasswordHasher = {
  verify: jest.fn(),
  hash: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    authService = new AuthService(
      mockUserRepository as any,
      mockRevokedTokenRepository as any,
      mockJwtService as any,
      mockRefreshTokenService as any,
      mockAuditService as any,
      mockPasswordHasher as any
    );
  });

  describe('login', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashed-password',
      role: 'ADMIN',
      active: true,
    };

    it('debería autenticar usuario con credenciales válidas', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordHasher.verify.mockResolvedValue(true);
      mockJwtService.sign.mockResolvedValue('access-token-123');
      mockRefreshTokenService.createToken.mockResolvedValue({
        token: 'refresh-token-123',
        hash: 'hash-123',
      });

      const result = await authService.login('test@example.com', 'password123');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('debería lanzar error si usuario no existe', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login('nonexistent@example.com', 'password')
      ).rejects.toThrow(AppError);
      
      await expect(
        authService.login('nonexistent@example.com', 'password')
      ).rejects.toThrow('Credenciales inválidas');
    });

    it('debería lanzar error si contraseña es incorrecta', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordHasher.verify.mockResolvedValue(false);

      await expect(
        authService.login('test@example.com', 'wrong-password')
      ).rejects.toThrow('Credenciales inválidas');
    });

    it('debería registrar login en audit log', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordHasher.verify.mockResolvedValue(true);
      mockJwtService.sign.mockResolvedValue('token');
      mockRefreshTokenService.createToken.mockResolvedValue({
        token: 'refresh',
        hash: 'hash',
      });

      await authService.login('test@example.com', 'password', '127.0.0.1', 'Chrome');

      expect(mockAuditService.log).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('debería renovar tokens válidos', async () => {
      mockRefreshTokenService.validateAndRotate.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const result = await authService.refresh('valid-refresh-token');

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('debería lanzar error con token inválido', async () => {
      mockRefreshTokenService.validateAndRotate.mockResolvedValue(null);

      await expect(
        authService.refresh('invalid-token')
      ).rejects.toThrow('Refresh token inválido');
    });
  });

  describe('logout', () => {
    it('debería revocar token correctamente', async () => {
      mockJwtService.decode.mockReturnValue({ jti: 'token-id', exp: Date.now() / 1000 + 3600 });
      mockRevokedTokenRepository.add.mockResolvedValue(undefined);

      await authService.logout('valid-token', 'user-123');

      expect(mockRevokedTokenRepository.add).toHaveBeenCalled();
    });

    it('debería registrar logout en audit log', async () => {
      mockJwtService.decode.mockReturnValue({ jti: 'token-id', exp: Date.now() / 1000 + 3600 });
      mockRevokedTokenRepository.add.mockResolvedValue(undefined);

      await authService.logout('token', 'user-123', '127.0.0.1', 'Chrome');

      expect(mockAuditService.log).toHaveBeenCalled();
    });
  });
});
