import { Injectable, Inject, UnauthorizedException, Logger, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AUTH_REPOSITORY, IAuthRepository } from '../../domain/repositories';
import { Email } from '../../domain/value-objects';

import { LoginDto } from '../dto/login.dto';
import { AuthContext } from '../dto/auth-types.dto';
import { BaseAuthUseCase } from './base-auth.use-case';

export interface LoginResult {
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
}

@Injectable()
export class LoginUseCase extends BaseAuthUseCase {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(JwtService)
    jwtService: JwtService,
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

      // ✅ Log del intento con rememberMe
      const rememberMe = dto.rememberMe ?? false;
      this.logger.log(`Login attempt | rememberMe: ${rememberMe}`);

      // 1. Validate inputs via VOs
      let email: Email;
      try {
        email = Email.create(dto.email);
      } catch (error) {
        this.logger.warn('Invalid email format', error as Error);
        throw new UnauthorizedException('Email inválido');
      }
      // 2. Find user
      const user = await this.authRepository.findByEmail(email.getValue());
      if (!user) {
        this.logger.warn('Login attempt failed: user not found');
        throw new UnauthorizedException('Credenciales inválidas');
      }

      this.logger.log(`User found: ${user.id}, active: ${user.active}, canLogin: ${user.canLogin()}`);

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

      this.logger.debug(`Comparing password for user ${user.id}, hash length: ${passwordHash.length}`);
      const isValid = await bcrypt.compare(dto.password, passwordHash);

      if (!isValid) {
        this.logger.warn(`Login attempt failed: invalid password for userId=${user.id}`);
        throw new UnauthorizedException('Credenciales inválidas');
      }

      this.logger.log(`Password verified successfully for user ${user.id}`);

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

      this.logger.log(`✅ User ${user.id} logged in successfully | Token expires: ${rememberMe ? '30 days' : '7 days'}`);

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
