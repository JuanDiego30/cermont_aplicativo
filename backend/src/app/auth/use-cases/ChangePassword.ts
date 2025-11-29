/**
 * Change Password Use Case
 * 
 * Permite a un usuario cambiar su contraseña con validaciones de seguridad:
 * - Verificación de contraseña actual
 * - Historial de contraseñas (no reutilizar últimas 5)
 * - Expiración de contraseña (90 días)
 * - Auditoría de cambios
 * 
 * @file src/app/auth/use-cases/ChangePassword.ts
 */

import bcrypt from 'bcrypt';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import type { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import type { User } from '../../../domain/entities/User.js';

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
  USER_NOT_FOUND: 'Usuario no encontrado',
  INVALID_CURRENT_PASSWORD: 'Contraseña actual incorrecta',
  MIN_LENGTH: `La nueva contraseña debe tener al menos ${PASSWORD_POLICY.MIN_LENGTH} caracteres`,
  REQUIRES_UPPERCASE: 'La contraseña debe contener al menos una letra mayúscula',
  REQUIRES_LOWERCASE: 'La contraseña debe contener al menos una letra minúscula',
  REQUIRES_DIGIT: 'La contraseña debe contener al menos un número',
  REQUIRES_SPECIAL: 'La contraseña debe contener al menos un carácter especial',
  NO_WHITESPACE: 'La contraseña no debe contener espacios',
  PASSWORD_REUSED: `No puedes reutilizar contraseñas anteriores (últimas ${PASSWORD_POLICY.HISTORY_SIZE})`,
  SAME_AS_CURRENT: 'La nueva contraseña no puede ser igual a la actual',
} as const;

const DEFAULT_AUDIT_VALUES = {
  IP: 'unknown',
  USER_AGENT: 'unknown',
} as const;

interface ChangePasswordInput {
  userId: string;
  oldPassword: string;
  newPassword: string;
  ip?: string;
  userAgent?: string;
}

interface PasswordValidationRule {
  test: (password: string) => boolean;
  errorMessage: string;
}

export class ChangePasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly auditLogRepository: IAuditLogRepository
  ) {}

  async execute(input: ChangePasswordInput): Promise<void> {
    const { userId, oldPassword, newPassword, ip, userAgent } = input;

    const user = await this.findUser(userId);
    await this.verifyCurrentPassword(user, oldPassword, userId, ip, userAgent);
    
    this.validateNewPassword(newPassword);
    await this.ensurePasswordNotReused(user, newPassword);

    const hashedPassword = await this.hashPassword(newPassword);
    const updatedHistory = this.buildPasswordHistory(user);
    const passwordExpiresAt = this.calculateExpirationDate();

    await this.updateUserPassword(userId, hashedPassword, updatedHistory, passwordExpiresAt);
    await this.logSuccessfulChange(user, userId, passwordExpiresAt, ip, userAgent);
  }

  private async findUser(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    return user;
  }

  private async verifyCurrentPassword(
    user: User,
    oldPassword: string,
    userId: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    
    if (!isValidPassword) {
      await this.logFailedAttempt(userId, ip, userAgent);
      throw new Error(ERROR_MESSAGES.INVALID_CURRENT_PASSWORD);
    }
  }

  private async logFailedAttempt(
    userId: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    await this.auditLogRepository.create({
      entityType: 'User',
      entityId: userId,
      action: AuditAction.PASSWORD_CHANGE_FAILED,
      userId,
      before: null,
      after: null,
      ip: ip || DEFAULT_AUDIT_VALUES.IP,
      userAgent: userAgent || DEFAULT_AUDIT_VALUES.USER_AGENT,
      reason: ERROR_MESSAGES.INVALID_CURRENT_PASSWORD,
    });
  }

  private validateNewPassword(password: string): void {
    const validationRules: PasswordValidationRule[] = [
      {
        test: (pwd) => pwd.length >= PASSWORD_POLICY.MIN_LENGTH,
        errorMessage: ERROR_MESSAGES.MIN_LENGTH,
      },
      {
        test: (pwd) => PASSWORD_REQUIREMENTS.UPPERCASE.test(pwd),
        errorMessage: ERROR_MESSAGES.REQUIRES_UPPERCASE,
      },
      {
        test: (pwd) => PASSWORD_REQUIREMENTS.LOWERCASE.test(pwd),
        errorMessage: ERROR_MESSAGES.REQUIRES_LOWERCASE,
      },
      {
        test: (pwd) => PASSWORD_REQUIREMENTS.DIGIT.test(pwd),
        errorMessage: ERROR_MESSAGES.REQUIRES_DIGIT,
      },
      {
        test: (pwd) => PASSWORD_REQUIREMENTS.SPECIAL_CHAR.test(pwd),
        errorMessage: ERROR_MESSAGES.REQUIRES_SPECIAL,
      },
      {
        test: (pwd) => !PASSWORD_REQUIREMENTS.WHITESPACE.test(pwd),
        errorMessage: ERROR_MESSAGES.NO_WHITESPACE,
      },
    ];

    for (const rule of validationRules) {
      if (!rule.test(password)) {
        throw new Error(rule.errorMessage);
      }
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

    const isCurrentPassword = await bcrypt.compare(newPassword, user.password);
    if (isCurrentPassword) {
      throw new Error(ERROR_MESSAGES.SAME_AS_CURRENT);
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, PASSWORD_POLICY.BCRYPT_SALT_ROUNDS);
  }

  private buildPasswordHistory(user: User): string[] {
    const passwordHistory = user.security?.passwordHistory || [];
    const historyLimit = PASSWORD_POLICY.HISTORY_SIZE - 1;
    return [...passwordHistory.slice(-historyLimit), user.password];
  }

  private calculateExpirationDate(): Date {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return new Date(Date.now() + PASSWORD_POLICY.EXPIRATION_DAYS * millisecondsPerDay);
  }

  private async updateUserPassword(
    userId: string,
    hashedPassword: string,
    updatedHistory: string[],
    passwordExpiresAt: Date
  ): Promise<void> {
    await this.userRepository.update(userId, {
      password: hashedPassword,
      security: {
        passwordHistory: updatedHistory,
      },
      lastPasswordChange: new Date(),
      passwordExpiresAt,
    });
  }

  private async logSuccessfulChange(
    user: User,
    userId: string,
    passwordExpiresAt: Date,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    await this.auditLogRepository.create({
      entityType: 'User',
      entityId: userId,
      action: AuditAction.PASSWORD_CHANGE,
      userId,
      before: {
        lastPasswordChange: user.lastPasswordChange,
        passwordExpiresAt: user.passwordExpiresAt,
      },
      after: {
        message: 'Contraseña actualizada exitosamente',
        lastPasswordChange: new Date(),
        passwordExpiresAt,
      },
      ip: ip || DEFAULT_AUDIT_VALUES.IP,
      userAgent: userAgent || DEFAULT_AUDIT_VALUES.USER_AGENT,
    });
  }
}


