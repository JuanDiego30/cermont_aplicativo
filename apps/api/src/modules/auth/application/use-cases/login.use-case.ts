import { Injectable, Inject, UnauthorizedException, Logger, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { AUTH_REPOSITORY, IAuthRepository } from '../../domain/repositories';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';

interface LoginDto {
  email: string;
  password: string;
}

interface AuthContext {
  ip?: string;
  userAgent?: string;
}

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
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);
  private readonly REFRESH_TOKEN_DAYS = 7;

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(JwtService)
    private readonly jwtService: JwtService,
  ) {
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
      // 1. Validate inputs via VOs
      const email = Email.create(dto.email);
      Password.create(dto.password); // Validate length

      // 2. Find user
      const user = await this.authRepository.findByEmail(email.getValue());
      if (!user) {
        this.logger.warn(`Login attempt failed: User not found for email ${dto.email}`);
        throw new UnauthorizedException('Credenciales inválidas o usuario inactivo');
      }

      this.logger.log(`User found: ${user.id}, active: ${user.active}, canLogin: ${user.canLogin()}`);

      // 3. Check if can login
      if (!user.canLogin()) {
        this.logger.warn(`Login attempt blocked: User ${user.email.getValue()} is inactive or disabled`);
        throw new UnauthorizedException('Credenciales inválidas o usuario inactivo');
      }

      // 4. Verify password
      const passwordHash = user.getPasswordHash();
      this.logger.debug(`Comparing password for user ${user.id}, hash length: ${passwordHash.length}`);
      const isValid = await bcrypt.compare(dto.password, passwordHash);
      
      if (!isValid) {
        this.logger.warn(`Login attempt failed: Invalid password for user ${user.id} (email: ${dto.email})`);
        throw new UnauthorizedException('Credenciales inválidas');
      }

      this.logger.log(`Password verified successfully for user ${user.id}`);

      // 5. Issue tokens
      const accessToken = this.jwtService.sign({
        userId: user.id,
        email: user.email.getValue(),
        role: user.role,
      });

      const refreshToken = uuidv4();
      const family = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_DAYS);

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

      this.logger.log(`User ${user.id} logged in successfully`);

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
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Handle domain errors (InvalidEmailError, InvalidPasswordError, etc.)
      const err = error as Error;
      if (err.name === 'InvalidEmailError' || err.name === 'InvalidPasswordError') {
        this.logger.warn(`Validation error during login: ${err.message}`);
        throw new UnauthorizedException('Credenciales inválidas');
      }
      this.logger.error(`Unexpected error during login execution: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Error procesando la solicitud de login');
    }
  }
}
