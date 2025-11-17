/**
 * Login Use Case
 * 
 * Autentica un usuario y genera tokens de acceso.
 * 
 * Características:
 * - Validación de credenciales
 * - Bloqueo de cuenta por intentos fallidos (5 intentos)
 * - Generación de access token y refresh token
 * - Auditoría completa de logins (exitosos y fallidos)
 * - Actualización de último login
 * - Verificación de cuenta activa
 * 
 * @file src/app/auth/use-cases/Login.ts
 */

import bcrypt from 'bcrypt';
import type { IUserRepository } from '@/domain/repositories/IUserRepository.js';
import type { ITokenBlacklistRepository } from '@/domain/repositories/ITokenBlacklistRepository.js';
import type { IAuditLogRepository } from '@/domain/repositories/IAuditLogRepository.js';
import { TokenService } from '@/domain/services/TokenService.js';
import { AuditAction } from '@/domain/entities/AuditLog.js';
import { SYSTEM_USER_ID } from '@/shared/constants/system.js';

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

export class LoginUseCase {
  constructor(
    private userRepository: IUserRepository,
    private tokenBlacklistRepository: ITokenBlacklistRepository,
    private auditLogRepository: IAuditLogRepository, // ← AGREGADO para auditoría
    private tokenService: TokenService
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const { email, password, ipAddress, userAgent } = input;

    // 1. Validar entrada
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    // 2. Buscar usuario
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // ✅ MEJORADO: Registrar intento fallido con email desconocido
      await this.logFailedLogin(
        'unknown',
        email,
        ipAddress || 'unknown',
        userAgent,
        'Usuario no encontrado'
      );

      throw new Error('Credenciales inválidas');
    }

    // 3. Verificar si la cuenta está bloqueada
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000
      );

        await this.logFailedLogin(
          user.id,
          email,
          ipAddress || 'unknown',
          userAgent,
          `Cuenta bloqueada (${remainingMinutes} minutos restantes)`
        );

      throw new Error(
        `Cuenta bloqueada temporalmente. Intente nuevamente en ${remainingMinutes} minutos.`
      );
    }

    // 4. Verificar si está activo
    if (!user.active) {
      await this.logFailedLogin(
        user.id,
        email,
        ipAddress || 'unknown',
        userAgent,
        'Usuario inactivo'
      );

      throw new Error('Usuario inactivo. Contacte al administrador.');
    }

    // 5. Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      // Incrementar intentos fallidos
      const newAttempts = (user.loginAttempts || 0) + 1;

      // Bloquear cuenta después de 5 intentos (15 minutos)
      if (newAttempts >= 5) {
        const lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

        await this.userRepository.update(user.id, {
          loginAttempts: newAttempts,
          lockedUntil: lockUntil,
          lastFailedLogin: new Date(),
        });

        await this.logFailedLogin(
          user.id,
          email,
          ipAddress || 'unknown',
          userAgent,
          `Cuenta bloqueada automáticamente (${newAttempts} intentos fallidos)`
        );

        throw new Error('Cuenta bloqueada por múltiples intentos fallidos. Intente en 15 minutos.');
      }

      // Actualizar intentos fallidos
      await this.userRepository.update(user.id, {
        loginAttempts: newAttempts,
        lastFailedLogin: new Date(),
      });

      await this.logFailedLogin(
        user.id,
        email,
        ipAddress || 'unknown',
        userAgent,
        `Contraseña incorrecta (intento ${newAttempts}/5)`
      );

      throw new Error(`Credenciales inválidas. ${5 - newAttempts} intentos restantes.`);
    }

    // 6. ✅ Login exitoso - Reset intentos fallidos
    await this.userRepository.update(user.id, {
      loginAttempts: 0,
      lockedUntil: null,
      lastLogin: new Date(),
    });

    // 7. Generar tokens
    const accessToken = await this.tokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = await this.tokenService.generateRefreshToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      ipAddress || 'unknown',
      userAgent || 'unknown'
    );

    // 8. ✅ Registrar login exitoso en auditoría
    await this.auditLogRepository.create({
      entityType: 'User',
      entityId: user.id,
      action: AuditAction.LOGIN,  // ← Usar enum
      userId: user.id,
      before: null,
      after: {
        lastLogin: new Date(),
        ip: ipAddress || 'unknown',
      },
      ip: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown',
    });

    // 9. Retornar datos del usuario y tokens
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Registrar intento de login fallido en auditoría
   */
  private async logFailedLogin(
    userId: string,
    email: string,
    ip: string,
    userAgent: string | undefined,
    reason: string
  ): Promise<void> {
    try {
      // Registrar intento fallido
      await this.auditLogRepository.create({
        entityType: 'User',
        entityId: userId,
        action: AuditAction.LOGIN_FAILED,  // ← Usar enum
        userId: userId === 'unknown' ? SYSTEM_USER_ID : userId,
        before: null,
        after: null,
        ip: ip || 'unknown',
        userAgent: userAgent || 'unknown',
        reason,
      });
    } catch (error) {
      // No lanzar error para no bloquear el flujo de login
      console.error('[LoginUseCase] Error logging failed login:', error);
    }
  }
}

