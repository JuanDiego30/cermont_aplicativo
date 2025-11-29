/**
 * Login Use Case
 * 
 * Autentica un usuario y genera tokens de acceso.
 * 
 * Características:
 * - Validación de credenciales
 * - Bloqueo de cuenta por intentos fallidos
 * - Generación de access token y refresh token
 * - Auditoría completa de logins
 * - Actualización de último login
 * - Verificación de cuenta activa
 * 
 * @file src/app/auth/use-cases/Login.ts
 */

import bcrypt from 'bcrypt';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import type { IRevokedTokenRepository } from '../../../domain/repositories/ITokenBlacklistRepository.js';
import type { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository.js';
import { TokenService } from '../../../domain/services/TokenService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { SYSTEM_USER_ID } from '../../../shared/constants/system.js';
import type { User } from '../../../domain/entities/User.js';

// Constantes de configuración
const ACCOUNT_LOCKOUT = {
  MAX_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000,
} as const;

const DEFAULT_VALUES = {
  IP: 'unknown',
  USER_AGENT: 'unknown',
  USER_ID: 'unknown',
} as const;

const ERROR_MESSAGES = {
  MISSING_CREDENTIALS: 'Email y contraseña son requeridos',
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  ACCOUNT_LOCKED: (minutes: number) =>
    `Cuenta bloqueada temporalmente. Intente nuevamente en ${minutes} minutos.`,
  ACCOUNT_INACTIVE: 'Usuario inactivo. Contacte al administrador.',
  MULTIPLE_FAILED_ATTEMPTS: `Cuenta bloqueada por múltiples intentos fallidos. Intente en ${ACCOUNT_LOCKOUT.LOCKOUT_DURATION_MINUTES} minutos.`,
  REMAINING_ATTEMPTS: (remaining: number) =>
    `Credenciales inválidas. ${remaining} intentos restantes.`,
} as const;

const AUDIT_REASONS = {
  USER_NOT_FOUND: 'Usuario no encontrado',
  ACCOUNT_LOCKED: (minutes: number) => `Cuenta bloqueada (${minutes} minutos restantes)`,
  ACCOUNT_INACTIVE: 'Usuario inactivo',
  AUTO_LOCKED: (attempts: number) =>
    `Cuenta bloqueada automáticamente (${attempts} intentos fallidos)`,
  INVALID_PASSWORD: (attempt: number, max: number) =>
    `Contraseña incorrecta (intento ${attempt}/${max})`,
} as const;

interface LoginInput {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

interface LoginOutput {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

interface AuditContext {
  ip: string;
  userAgent: string;
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly revokedTokenRepository: IRevokedTokenRepository,
    private readonly auditLogRepository: IAuditLogRepository,
    private readonly tokenService: TokenService
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    this.validateInput(input);

    const auditContext = this.extractAuditContext(input);
    const user = await this.authenticateUser(input.email, input.password, auditContext);

    await this.resetLoginAttempts(user.id);
    const tokens = await this.generateTokens(user, auditContext);
    await this.logSuccessfulLogin(user, auditContext);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  private validateInput(input: LoginInput): void {
    if (!input.email || !input.password) {
      throw new Error(ERROR_MESSAGES.MISSING_CREDENTIALS);
    }
  }

  private extractAuditContext(input: LoginInput): AuditContext {
    return {
      ip: input.ipAddress || DEFAULT_VALUES.IP,
      userAgent: input.userAgent || DEFAULT_VALUES.USER_AGENT,
    };
  }

  private async authenticateUser(
    email: string,
    password: string,
    auditContext: AuditContext
  ): Promise<User> {
    const user = await this.findAndValidateUser(email, auditContext);
    await this.verifyAccountStatus(user, email, auditContext);
    await this.verifyPassword(user, email, password, auditContext);

    return user;
  }

  private async findAndValidateUser(email: string, auditContext: AuditContext): Promise<User> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      await this.logFailedLogin(
        DEFAULT_VALUES.USER_ID,
        email,
        auditContext,
        AUDIT_REASONS.USER_NOT_FOUND
      );
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    return user;
  }

  private async verifyAccountStatus(
    user: User,
    email: string,
    auditContext: AuditContext
  ): Promise<void> {
    this.checkAccountLockout(user, email, auditContext);
    this.checkAccountActive(user, email, auditContext);
  }

  private checkAccountLockout(user: User, email: string, auditContext: AuditContext): void {
    if (!user.lockedUntil || user.lockedUntil <= new Date()) {
      return;
    }

    const remainingMinutes = this.calculateRemainingLockoutMinutes(user.lockedUntil);

    this.logFailedLogin(
      user.id,
      email,
      auditContext,
      AUDIT_REASONS.ACCOUNT_LOCKED(remainingMinutes)
    );

    throw new Error(ERROR_MESSAGES.ACCOUNT_LOCKED(remainingMinutes));
  }

  private checkAccountActive(user: User, email: string, auditContext: AuditContext): void {
    if (user.active) {
      return;
    }

    this.logFailedLogin(user.id, email, auditContext, AUDIT_REASONS.ACCOUNT_INACTIVE);
    throw new Error(ERROR_MESSAGES.ACCOUNT_INACTIVE);
  }

  private async verifyPassword(
    user: User,
    email: string,
    password: string,
    auditContext: AuditContext
  ): Promise<void> {
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (isValidPassword) {
      return;
    }

    await this.handleFailedPasswordAttempt(user, email, auditContext);
  }

  private async handleFailedPasswordAttempt(
    user: User,
    email: string,
    auditContext: AuditContext
  ): Promise<void> {
    const newAttempts = (user.loginAttempts || 0) + 1;

    if (newAttempts >= ACCOUNT_LOCKOUT.MAX_ATTEMPTS) {
      await this.lockAccount(user, email, newAttempts, auditContext);
    } else {
      await this.recordFailedAttempt(user, email, newAttempts, auditContext);
    }
  }

  private async lockAccount(
    user: User,
    email: string,
    attempts: number,
    auditContext: AuditContext
  ): Promise<void> {
    const lockUntil = new Date(Date.now() + ACCOUNT_LOCKOUT.LOCKOUT_DURATION_MS);

    await this.userRepository.update(user.id, {
      loginAttempts: attempts,
      lockedUntil: lockUntil,
      lastFailedLogin: new Date(),
    });

    await this.logFailedLogin(
      user.id,
      email,
      auditContext,
      AUDIT_REASONS.AUTO_LOCKED(attempts)
    );

    throw new Error(ERROR_MESSAGES.MULTIPLE_FAILED_ATTEMPTS);
  }

  private async recordFailedAttempt(
    user: User,
    email: string,
    attempts: number,
    auditContext: AuditContext
  ): Promise<void> {
    await this.userRepository.update(user.id, {
      loginAttempts: attempts,
      lastFailedLogin: new Date(),
    });

    await this.logFailedLogin(
      user.id,
      email,
      auditContext,
      AUDIT_REASONS.INVALID_PASSWORD(attempts, ACCOUNT_LOCKOUT.MAX_ATTEMPTS)
    );

    const remainingAttempts = ACCOUNT_LOCKOUT.MAX_ATTEMPTS - attempts;
    throw new Error(ERROR_MESSAGES.REMAINING_ATTEMPTS(remainingAttempts));
  }

  private calculateRemainingLockoutMinutes(lockedUntil: Date): number {
    const millisecondsPerMinute = 60 * 1000;
    return Math.ceil((lockedUntil.getTime() - Date.now()) / millisecondsPerMinute);
  }

  private async resetLoginAttempts(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      loginAttempts: 0,
      lockedUntil: null,
      lastLogin: new Date(),
    });
  }

  private async generateTokens(
    user: User,
    auditContext: AuditContext
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(tokenPayload),
      this.tokenService.generateRefreshToken(tokenPayload, auditContext.ip, auditContext.userAgent),
    ]);

    return { accessToken, refreshToken };
  }

  private async logSuccessfulLogin(user: User, auditContext: AuditContext): Promise<void> {
    await this.auditLogRepository.create({
      entityType: 'User',
      entityId: user.id,
      action: AuditAction.LOGIN,
      userId: user.id,
      before: null,
      after: {
        lastLogin: new Date(),
        ip: auditContext.ip,
      },
      ip: auditContext.ip,
      userAgent: auditContext.userAgent,
    });
  }

  private async logFailedLogin(
    userId: string,
    email: string,
    auditContext: AuditContext,
    reason: string
  ): Promise<void> {
    try {
      await this.auditLogRepository.create({
        entityType: 'User',
        entityId: userId,
        action: AuditAction.LOGIN_FAILED,
        userId: userId === DEFAULT_VALUES.USER_ID ? SYSTEM_USER_ID : userId,
        before: null,
        after: null,
        ip: auditContext.ip,
        userAgent: auditContext.userAgent,
        reason,
      });
    } catch (error) {
      console.error('[LoginUseCase] Error logging failed login:', error);
    }
  }
}


