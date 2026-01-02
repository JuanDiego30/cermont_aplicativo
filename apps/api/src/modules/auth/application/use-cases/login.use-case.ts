import { Injectable, Inject, UnauthorizedException, Logger, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AUTH_REPOSITORY, IAuthRepository } from '../../domain/repositories';
import { Email } from '../../domain/value-objects';

import { LoginDto } from '../dto/login.dto';
import { AuthContext } from '../dto/auth-types.dto';
import { BaseAuthUseCase } from './base-auth.use-case';
import { Verify2FACodeUseCase } from './verify-2fa-code.use-case';
import { Send2FACodeUseCase } from './send-2fa-code.use-case';

export type LoginResult =
  | {
      requires2FA: true;
      message: string;
      expiresIn?: number;
    }
  | {
      requires2FA?: false;
      message: string;
      token: string;
      refreshToken: string;
      user: {
        id: string;
        email: string;
        name: string;
        role: string;
        avatar?: string;
        phone?: string;
      };
    };

@Injectable()
export class LoginUseCase extends BaseAuthUseCase {
  private readonly logger = new Logger(LoginUseCase.name);
  private readonly LOCK_MINUTES = 15;
  private readonly MAX_ATTEMPTS = 5;

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(JwtService)
    jwtService: JwtService,
    private readonly verify2FACodeUseCase: Verify2FACodeUseCase,
    private readonly send2FACodeUseCase: Send2FACodeUseCase,
  ) {
    super(jwtService);
    // Verificar que las dependencias estén disponibles
    if (!this.authRepository) {
      this.logger.error('AUTH_REPOSITORY no está inyectado');
      throw new Error('AUTH_REPOSITORY no está disponible');
    }
    if (!this.jwtService) {
      this.logger.error('JwtService no está inyectado');
      throw new Error('JwtService no está disponible');
    }
    this.logger.log('LoginUseCase instanciado correctamente');
  }

  async execute(dto: LoginDto, context: AuthContext): Promise<LoginResult> {
    try {
      // Validar que el DTO tenga los campos requeridos
      if (!dto.email || !dto.password) {
        this.logger.warn('Login attempt with missing credentials', { hasEmail: !!dto.email, hasPassword: !!dto.password });
        throw new UnauthorizedException('Email y contraseña son requeridos');
      }

      const rememberMe = dto.rememberMe ?? false;

      // 1. Validate inputs via VOs
      let email: Email;
      try {
        email = Email.create(dto.email);
      } catch (error) {
        this.logger.warn('Invalid email format');
        throw new UnauthorizedException('Email inválido');
      }
      // 2. Find user
      const user = await this.authRepository.findByEmail(email.getValue());
      if (!user) {
        this.logger.warn('Login attempt failed');
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // 2.1 Lockout
      if (user.isLocked()) {
        this.logger.warn(`Login attempt blocked: user locked (${user.id})`);
        throw new ForbiddenException('Usuario bloqueado temporalmente');
      }

      // 3. Check if can login
      if (!user.canLogin()) {
        this.logger.warn(`Login attempt blocked: userId=${user.id} inactive/disabled`);
        throw new ForbiddenException('Usuario bloqueado');
      }

      // 4. Verify password
      const passwordHash = user.getPasswordHash();
      if (!passwordHash) {
        this.logger.warn(`User ${user.id} has no password hash`);
        throw new UnauthorizedException('Credenciales inválidas');
      }

      const isValid = await bcrypt.compare(dto.password, passwordHash);

      if (!isValid) {
        // Regla 7: 5 intentos => 15 min
        const nextAttempts = (user.loginAttempts ?? 0) + 1;
        const shouldLock = nextAttempts >= this.MAX_ATTEMPTS;
        const lockUntil = shouldLock
          ? new Date(Date.now() + this.LOCK_MINUTES * 60 * 1000)
          : undefined;

        await this.authRepository.incrementLoginAttempts(user.id, lockUntil);

        // Audit (sin secretos)
        await this.authRepository.createAuditLog({
          userId: user.id,
          action: shouldLock ? 'LOGIN_LOCKED' : 'LOGIN_FAILED',
          ip: context.ip,
          userAgent: context.userAgent,
        });

        this.logger.warn(`Login attempt failed for userId=${user.id}`);
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // Regla 2: 2FA obligatorio para admin (usa el flujo OTP existente)
      if (user.role === 'admin') {
        if (!dto.twoFactorCode) {
          await this.authRepository.createAuditLog({
            userId: user.id,
            action: 'LOGIN_2FA_REQUIRED',
            ip: context.ip,
            userAgent: context.userAgent,
          });

          // Disparar envío de código (email) y responder 200 con requires2FA
          const sendResult = await this.send2FACodeUseCase.execute(user.email.getValue());
          return {
            requires2FA: true,
            message: '2FA requerido',
            expiresIn: sendResult.expiresIn,
          };
        }

        // Verifica y marca como usado el token 2FA
        await this.verify2FACodeUseCase.execute(user.email.getValue(), dto.twoFactorCode);
      }

      // Reset intentos si llega aquí
      await this.authRepository.resetLoginAttempts(user.id);

      // 5. Issue tokens
      const accessToken = this.signAccessToken({
        id: user.id,
        email: user.email.getValue(),
        role: user.role,
      });

      const tokenDays = this.getRefreshTokenDays(rememberMe);
      const { token: refreshToken, family, expiresAt } = this.createRefreshToken(tokenDays);

      await this.authRepository.createRefreshToken({
        token: refreshToken,
        userId: user.id,
        family,
        expiresAt,
        ipAddress: context.ip,
        userAgent: context.userAgent,
      });

      // 6. Update last login & audit (Non-blocking failure)
      // Usamos allSettled para que si falla el log, no falle el login
      Promise.allSettled([
        this.authRepository.updateLastLogin(user.id),
        this.authRepository.createAuditLog({
          userId: user.id,
          action: 'LOGIN',
          ip: context.ip,
          userAgent: context.userAgent,
        }),
      ]).then((results) => {
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            this.logger.error(`Failed to execute post-login action ${index}: ${result.reason}`);
          }
        });
      });

      this.logger.log(`✅ User ${user.id} logged in successfully`);

      return {
        message: 'Login exitoso',
        token: accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email.getValue(),
          name: user.name,
          role: user.role,
          avatar: user.avatar ?? undefined,
          phone: user.phone ?? undefined,
        },
      };
    } catch (error) {
      if (this.isHttpExceptionLike(error)) {
        throw error as any;
      }
      // Handle domain errors (InvalidEmailError, InvalidPasswordError, etc.)
      const err = error as Error;
      if (err.name === 'ValidationError') {
        this.logger.warn(`Validation error during login: ${err.message}`);
        throw new UnauthorizedException('Credenciales inválidas');
      }
      this.logger.error(`Unexpected error during login execution: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Error procesando la solicitud de login');
    }
  }
}
