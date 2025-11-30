/**
 * Auth Facade
 * Encapsulates authentication-related dependencies to simplify AuthController
 */

import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import type { IPasswordResetRepository } from '../../../domain/repositories/IPasswordResetRepository.js';
import type { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository.js';
import type { IRefreshTokenRepository } from '../../../domain/repositories/IRefreshTokenRepository.js';
import type { RefreshTokenServiceInterface, AuthService } from '../../../domain/services/AuthService.js';
import { EmailService } from '../../services/EmailService.js';
import { ForgotPasswordUseCase } from '../../../app/auth/use-cases/ForgotPassword.js';
import { ResetPasswordUseCase } from '../../../app/auth/use-cases/ResetPassword.js';

// ============================================================================
// Types
// ============================================================================

export interface AuthFacadeDependencies {
  authService: AuthService;
  userRepository: IUserRepository;
  refreshTokenService: RefreshTokenServiceInterface;
  passwordResetRepository: IPasswordResetRepository;
  auditLogRepository: IAuditLogRepository;
  emailService: EmailService;
  refreshTokenRepository: IRefreshTokenRepository;
}

export interface ForgotPasswordParams {
  email: string;
  frontendUrl?: string;
  ip?: string;
  userAgent?: string;
}

export interface ResetPasswordParams {
  token: string;
  newPassword: string;
  revokeAllSessions?: boolean;
  ip?: string;
  userAgent?: string;
}

export interface TokenValidationResult {
  valid: boolean;
  message?: string;
}

// ============================================================================
// Facade Implementation
// ============================================================================

export class AuthFacade {
  private readonly authService: AuthService;
  private readonly userRepository: IUserRepository;
  private readonly refreshTokenService: RefreshTokenServiceInterface;
  private readonly passwordResetRepository: IPasswordResetRepository;
  private readonly auditLogRepository: IAuditLogRepository;
  private readonly emailService: EmailService;
  private readonly refreshTokenRepository: IRefreshTokenRepository;

  constructor(deps: AuthFacadeDependencies) {
    this.authService = deps.authService;
    this.userRepository = deps.userRepository;
    this.refreshTokenService = deps.refreshTokenService;
    this.passwordResetRepository = deps.passwordResetRepository;
    this.auditLogRepository = deps.auditLogRepository;
    this.emailService = deps.emailService;
    this.refreshTokenRepository = deps.refreshTokenRepository;
  }

  // ============================================================================
  // Auth Operations (delegated to AuthService)
  // ============================================================================

  async login(email: string, password: string, ip?: string, userAgent?: string) {
    return this.authService.login(email, password, ip, userAgent);
  }

  async refresh(refreshToken: string, userId?: string) {
    return this.authService.refresh(refreshToken, userId);
  }

  async logout(token: string, userId: string, ip?: string, userAgent?: string) {
    return this.authService.logout(token, userId, ip, userAgent);
  }

  async register(data: { email: string; password: string; name: string; ip?: string; userAgent?: string }) {
    return this.authService.register(data);
  }

  // ============================================================================
  // User Operations
  // ============================================================================

  async getUserById(userId: string) {
    return this.userRepository.findById(userId);
  }

  // ============================================================================
  // Session Management
  // ============================================================================

  async revokeAllUserSessions(userId: string) {
    return this.refreshTokenService.revokeUserTokens(userId);
  }

  // ============================================================================
  // Password Reset Operations
  // ============================================================================

  async forgotPassword(params: ForgotPasswordParams) {
    const useCase = new ForgotPasswordUseCase(
      this.userRepository,
      this.passwordResetRepository,
      this.auditLogRepository,
      this.emailService
    );

    return useCase.execute({
      email: params.email,
      frontendUrl: params.frontendUrl,
      ip: params.ip,
      userAgent: params.userAgent,
    });
  }

  async resetPassword(params: ResetPasswordParams) {
    const useCase = new ResetPasswordUseCase(
      this.userRepository,
      this.passwordResetRepository,
      this.refreshTokenRepository,
      this.auditLogRepository
    );

    return useCase.execute({
      token: params.token,
      newPassword: params.newPassword,
      revokeAllSessions: params.revokeAllSessions ?? true,
      ip: params.ip,
      userAgent: params.userAgent,
    });
  }

  async verifyResetToken(token: string): Promise<TokenValidationResult> {
    const resetToken = await this.passwordResetRepository.findByToken(token);

    if (!resetToken) {
      return { valid: false, message: 'Token inválido' };
    }

    if (resetToken.usedAt) {
      return { valid: false, message: 'Este enlace ya fue utilizado' };
    }

    if (new Date() > resetToken.expiresAt) {
      return { valid: false, message: 'Este enlace ha expirado' };
    }

    return { valid: true };
  }
}
