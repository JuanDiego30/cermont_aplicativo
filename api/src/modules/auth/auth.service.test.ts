/**
 * Suite de pruebas unitarias para AuthService usando Vitest. Mockea bcryptjs,
 * AuthRepository y JWT para validar lógica de autenticación en aislamiento:
 * login con credenciales válidas/inválidas, registro de usuarios nuevos, detección
 * de emails duplicados, validación de tokens, y manejo de errores. Utiliza
 * beforeEach para limpiar mocks entre tests y verifica llamadas a métodos,
 * valores de retorno y lanzamiento de excepciones específicas.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service';
import { AppError } from '../../shared/errors/index';
import { AuthRepository } from './auth.repository';
import bcrypt from 'bcryptjs';

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('./auth.repository', () => {
  const mockRepo = {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    createUser: vi.fn(),
    updateLastLogin: vi.fn(),
    createAuditLog: vi.fn(),
    createRefreshToken: vi.fn(),
    findRefreshToken: vi.fn(),
    revokeRefreshToken: vi.fn(),
    revokeTokenFamily: vi.fn(),
    generateRefreshToken: vi.fn(),
    createPasswordResetToken: vi.fn(),
    findPasswordResetToken: vi.fn(),
    resetPasswordTransaction: vi.fn(),
  };
  return {
    AuthRepository: class {
      findByEmail = mockRepo.findByEmail;
      findById = mockRepo.findById;
      createUser = mockRepo.createUser;
      updateLastLogin = mockRepo.updateLastLogin;
      createAuditLog = mockRepo.createAuditLog;
      createRefreshToken = mockRepo.createRefreshToken;
      findRefreshToken = mockRepo.findRefreshToken;
      revokeRefreshToken = mockRepo.revokeRefreshToken;
      revokeTokenFamily = mockRepo.revokeTokenFamily;
      generateRefreshToken = mockRepo.generateRefreshToken;
      createPasswordResetToken = mockRepo.createPasswordResetToken;
      findPasswordResetToken = mockRepo.findPasswordResetToken;
      resetPasswordTransaction = mockRepo.resetPasswordTransaction;
    },
    authRepository: mockRepo,
  };
});

describe('AuthService', () => {
  let service: AuthService;
  let mockRepository: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepository = new AuthRepository();
    service = new AuthService(mockRepository);
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        password: 'hashed_password',
        name: 'Test User',
        role: 'tecnico',
        active: true,
      };

      mockRepository.findByEmail.mockResolvedValue(mockUser);
      mockRepository.createAuditLog.mockResolvedValue(undefined);
      mockRepository.updateLastLogin.mockResolvedValue(undefined);
      mockRepository.createRefreshToken.mockResolvedValue({ token: 'refresh-token', id: 'rt-1' });

      const result = await service.login(
        { email: 'test@test.com', password: 'password123' },
        '192.168.1.1',
        'Mozilla/5.0'
      );

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.id).toBe('1');
      expect(mockRepository.findByEmail).toHaveBeenCalledWith('test@test.com');
    });

    it('should throw error with invalid email', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.login(
          { email: 'invalid@test.com', password: 'password123' },
          '192.168.1.1'
        )
      ).rejects.toThrow(AppError);
    });

    it('should throw error with wrong password', async () => {
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        password: 'hashed_password',
        active: true,
      };

      (bcrypt.compare as any).mockResolvedValueOnce(false);

      mockRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.login(
          { email: 'test@test.com', password: 'wrongpassword' },
          '192.168.1.1'
        )
      ).rejects.toThrow(AppError);
    });
  });

  describe('register', () => {
    it('should register new user successfully', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.createUser.mockResolvedValue({
        id: '1',
        email: 'newuser@test.com',
        name: 'New User',
        role: 'tecnico',
        active: true,
      });
      mockRepository.createRefreshToken.mockResolvedValue({ token: 'refresh-token', id: 'rt-1' });
      mockRepository.createAuditLog.mockResolvedValue(undefined);

      const result = await service.register(
        {
          email: 'newuser@test.com',
          password: 'password123',
          name: 'New User',
          role: 'tecnico',
        },
        '192.168.1.1'
      );

      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('newuser@test.com');
    });

    it('should throw error if email already exists', async () => {
      mockRepository.findByEmail.mockResolvedValue({
        id: '1',
        email: 'existing@test.com',
      });

      await expect(
        service.register(
          {
            email: 'existing@test.com',
            password: 'password123',
            name: 'User',
            role: 'tecnico',
          },
          '192.168.1.1'
        )
      ).rejects.toThrow(AppError);
    });
  });

  describe('validateToken', () => {
    it('should validate valid token', () => {
      const validToken = service.generateAccessToken('user-id', 'test@test.com', 'tecnico');
      const payload = service.validateToken(validToken);

      expect(payload).toBeDefined();
      expect(payload?.userId).toBe('user-id');
      expect(payload?.email).toBe('test@test.com');
    });

    it('should return null for invalid token', () => {
      const payload = service.validateToken('invalid-token');
      expect(payload).toBeNull();
    });
  });
});

