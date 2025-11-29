/**
 * Reset Password Use Case
 * 
 * Permite a un usuario restablecer su contraseña usando un token de recuperación.
 * 
 * Características:
 * - Valida que el token sea válido y no expirado
 * - Aplica políticas de contraseña
 * - Invalida todos los tokens de reset del usuario
 * - Revoca todas las sesiones activas (opcional)
 * - Auditoría completa
 * 
 * @file src/app/auth/use-cases/ResetPassword.ts
 */

import bcrypt from 'bcrypt';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import type { IPasswordResetRepository } from '../../../domain/repositories/IPasswordResetRepository.js';
import type { IRefreshTokenRepository } from '../../../domain/repositories/IRefreshTokenRepository.js';
import type { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository.js';
import type { User } from '../../../domain/entities/User.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { isValidResetToken } from '../../../domain/entities/PasswordResetToken.js';
import { logger } from '../../../shared/utils/logger.js';

// Constantes de configuración
const PASSWORD_POLICY = {
  MIN_LENGTH: 8,
  HISTORY_SIZE: 5,
  EXPIRATION_DAYS: 90,
  BCRYPT_SALT_ROUNDS: 10,
} as const;

const PASSWORD_REQUIREMENTS = {
  UPPERCASE: /[A-Z]/,
  LOWERCASE: /[a-z]/,
  DIGIT: /[0-9]/,
  SPECIAL_CHAR: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
  WHITESPACE: /\s/,
} as const;

const ERROR_MESSAGES = {
  MISSING_TOKEN: 'El token de recuperación es requerido',
  MISSING_PASSWORD: 'La nueva contraseña es requerida',
  INVALID_TOKEN: 'El enlace de recuperación es inválido o ha expirado',
  USER_NOT_FOUND: 'Usuario no encontrado',
  USER_INACTIVE: 'La cuenta está inactiva. Contacte al administrador.',
  MIN_LENGTH: `La contraseña debe tener al menos ${PASSWORD_POLICY.MIN_LENGTH} caracteres`,
  REQUIRES_UPPERCASE: 'La contraseña debe contener al menos una letra mayúscula',
  REQUIRES_LOWERCASE: 'La contraseña debe contener al menos una letra minúscula',
  REQUIRES_DIGIT: 'La contraseña debe contener al menos un número',
  REQUIRES_SPECIAL: 'La contraseña debe contener al menos un carácter especial',
  NO_WHITESPACE: 'La contraseña no debe contener espacios',
  PASSWORD_REUSED: `No puedes reutilizar contraseñas anteriores (últimas ${PASSWORD_POLICY.HISTORY_SIZE})`,
} as const;

interface ResetPasswordInput {
  token: string;
  newPassword: string;
  revokeAllSessions?: boolean;
  ip?: string;
  userAgent?: string;
}

interface ResetPasswordResult {
  success: boolean;
  message: string;
}

export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordResetRepository: IPasswordResetRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  async execute(input: ResetPasswordInput): Promise<ResetPasswordResult> {
    const { 
      token, 
      newPassword, 
      revokeAllSessions = true, 
      ip = 'unknown', 
      userAgent = 'unknown' 
    } = input;

    // Validaciones básicas
    if (!token || typeof token !== 'string') {
      throw new Error(ERROR_MESSAGES.MISSING_TOKEN);
    }

    if (!newPassword || typeof newPassword !== 'string') {
      throw new Error(ERROR_MESSAGES.MISSING_PASSWORD);
    }

    // Buscar el token
    const resetToken = await this.passwordResetRepository.findByToken(token);
    
    if (!resetToken) {
      await this.logFailedAttempt(token, 'Token no encontrado', ip, userAgent);
      throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
    }

    // Verificar validez del token
    if (!isValidResetToken(resetToken)) {
      await this.logFailedAttempt(
        token, 
        resetToken.usedAt ? 'Token ya usado' : 'Token expirado', 
        ip, 
        userAgent,
        resetToken.userId
      );
      throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
    }

    // Buscar el usuario
    const user = await this.userRepository.findById(resetToken.userId);
    
    if (!user) {
      await this.logFailedAttempt(token, 'Usuario no encontrado', ip, userAgent, resetToken.userId);
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    if (!user.active) {
      await this.logFailedAttempt(token, 'Usuario inactivo', ip, userAgent, user.id);
      throw new Error(ERROR_MESSAGES.USER_INACTIVE);
    }

    // Validar la nueva contraseña
    this.validatePassword(newPassword);

    // Verificar historial de contraseñas
    await this.ensurePasswordNotReused(user, newPassword);

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, PASSWORD_POLICY.BCRYPT_SALT_ROUNDS);

    // Actualizar historial de contraseñas
    const updatedHistory = this.buildPasswordHistory(user);

    // Calcular nueva fecha de expiración
    const passwordExpiresAt = new Date();
    passwordExpiresAt.setDate(passwordExpiresAt.getDate() + PASSWORD_POLICY.EXPIRATION_DAYS);

    // Actualizar usuario
    await this.userRepository.update(user.id, {
      password: hashedPassword,
      security: {
        passwordHistory: updatedHistory,
      },
      lastPasswordChange: new Date(),
      passwordExpiresAt: passwordExpiresAt,
      loginAttempts: 0, // Resetear intentos fallidos
      lockedUntil: null, // Desbloquear cuenta si estaba bloqueada
    });

    // Marcar el token como usado
    await this.passwordResetRepository.markAsUsed(resetToken.id);

    // Invalidar todos los tokens de reset del usuario
    await this.passwordResetRepository.invalidateAllByUser(user.id);

    // Revocar todas las sesiones si se solicita
    if (revokeAllSessions) {
      await this.refreshTokenRepository.revokeAllByUser(user.id, 'Password reset');
    }

    // Registrar auditoría
    await this.logSuccess(user.id, revokeAllSessions, ip, userAgent);

    logger.info(`Password reset completed for user: ${user.email}`);

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente. Por seguridad, todas las sesiones han sido cerradas.',
    };
  }

  private validatePassword(password: string): void {
    const errors: string[] = [];

    if (password.length < PASSWORD_POLICY.MIN_LENGTH) {
      errors.push(ERROR_MESSAGES.MIN_LENGTH);
    }

    if (!PASSWORD_REQUIREMENTS.UPPERCASE.test(password)) {
      errors.push(ERROR_MESSAGES.REQUIRES_UPPERCASE);
    }

    if (!PASSWORD_REQUIREMENTS.LOWERCASE.test(password)) {
      errors.push(ERROR_MESSAGES.REQUIRES_LOWERCASE);
    }

    if (!PASSWORD_REQUIREMENTS.DIGIT.test(password)) {
      errors.push(ERROR_MESSAGES.REQUIRES_DIGIT);
    }

    if (!PASSWORD_REQUIREMENTS.SPECIAL_CHAR.test(password)) {
      errors.push(ERROR_MESSAGES.REQUIRES_SPECIAL);
    }

    if (PASSWORD_REQUIREMENTS.WHITESPACE.test(password)) {
      errors.push(ERROR_MESSAGES.NO_WHITESPACE);
    }

    if (errors.length > 0) {
      throw new Error(errors.join('. '));
    }
  }

  private async ensurePasswordNotReused(user: User, newPassword: string): Promise<void> {
    const passwordHistory = user.security?.passwordHistory || [];

    for (const oldHash of passwordHistory) {
      const isRepeated = await bcrypt.compare(newPassword, oldHash);
      if (isRepeated) {
        throw new Error(ERROR_MESSAGES.PASSWORD_REUSED);
      }
    }

    // También verificar que no sea la misma que la actual
    const isCurrentPassword = await bcrypt.compare(newPassword, user.password);
    if (isCurrentPassword) {
      throw new Error(ERROR_MESSAGES.PASSWORD_REUSED);
    }
  }

  private buildPasswordHistory(user: User): string[] {
    const passwordHistory = user.security?.passwordHistory || [];
    const historyLimit = PASSWORD_POLICY.HISTORY_SIZE - 1;
    return [...passwordHistory.slice(-historyLimit), user.password];
  }

  private async logFailedAttempt(
    token: string,
    reasonMsg: string,
    ip: string,
    userAgent: string,
    userId?: string
  ): Promise<void> {
    try {
      await this.auditLogRepository.create({
        userId: userId || 'anonymous',
        action: AuditAction.PASSWORD_RESET_FAILED,
        entityType: 'User',
        entityId: userId || 'N/A',
        before: null,
        after: {
          tokenPrefix: token.substring(0, 8) + '...',
        },
        ip,
        userAgent,
        reason: reasonMsg,
      });
    } catch (e) {
      logger.error('Error logging failed reset attempt:', { error: e });
    }
  }

  private async logSuccess(
    userId: string,
    sessionsRevoked: boolean,
    ip: string,
    userAgent: string
  ): Promise<void> {
    try {
      await this.auditLogRepository.create({
        userId,
        action: AuditAction.PASSWORD_RESET_SUCCESS,
        entityType: 'User',
        entityId: userId,
        before: null,
        after: {
          sessionsRevoked,
          passwordExpiresAt: new Date(Date.now() + PASSWORD_POLICY.EXPIRATION_DAYS * 24 * 60 * 60 * 1000),
        },
        ip,
        userAgent,
        reason: 'Contraseña restablecida mediante enlace de recuperación',
      });
    } catch (e) {
      logger.error('Error logging password reset success:', { error: e });
    }
  }
}
