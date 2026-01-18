/**
 * @module AuthModule
 *
 * Módulo de autenticación con JWT (Passport) y configuración del JwtModule.
 * Implementa DDD con use cases, repositorio, y controlador de infrastructure.
 * Incluye 2FA y recuperación de contraseña.
 */
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Infrastructure - Controllers
import { Auth2FAController } from './infrastructure/controllers/auth-2fa.controller';
import { AuthControllerRefactored } from './infrastructure/controllers/auth.controller';
import { PasswordResetController } from './infrastructure/controllers/password-reset.controller';
import { PrismaAuthRepository } from './infrastructure/persistence/prisma-auth.repository';

// Application - Use Cases (Auth)
import { GetCurrentUserUseCase } from './application/use-cases/get-current-user.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';

// Application - Use Cases (Password Reset)
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { ValidateResetTokenUseCase } from './application/use-cases/validate-reset-token.use-case';

// Application - Use Cases (2FA)
import { ActivateTotpUseCase } from './application/use-cases/activate-totp.use-case';
import { Send2FACodeUseCase } from './application/use-cases/send-2fa-code.use-case';
import { SetupTotpUseCase } from './application/use-cases/setup-totp.use-case';
import { Toggle2FAUseCase } from './application/use-cases/toggle-2fa.use-case';
import { Verify2FACodeUseCase } from './application/use-cases/verify-2fa-code.use-case';

// Domain
import { AUTH_REPOSITORY } from './domain/repositories';

// Legacy (for gradual migration)
import { AuthService } from './auth.service';
import { Auth2FAEmailHandler } from './infrastructure/event-handlers/auth-2fa-email.handler';
import { TotpService } from './infrastructure/services/totp.service';
import { JwtStrategy } from './strategies/jwt.strategy';

// Lib Services
import { PasswordService } from '../../shared/services/password.service';

// Prisma
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AUTH_CONSTANTS } from './auth.constants';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    NotificationsModule,
    CacheModule.register({
      ttl: 300000, // 5 minutos (ms) - TTL por defecto; Auth puede sobreescribir por key
      max: 1000,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresIn =
          configService.get<string>(AUTH_CONSTANTS.JWT_EXPIRES_IN_ENV) ??
          AUTH_CONSTANTS.JWT_DEFAULT_EXPIRES_IN;

        const privateKey =
          configService.get<string>(AUTH_CONSTANTS.JWT_PRIVATE_KEY_ENV) ??
          process.env[AUTH_CONSTANTS.JWT_PRIVATE_KEY_ENV];
        const publicKey =
          configService.get<string>(AUTH_CONSTANTS.JWT_PUBLIC_KEY_ENV) ??
          process.env[AUTH_CONSTANTS.JWT_PUBLIC_KEY_ENV];

        // Regla 1: RS256 (asymmetric). Fallback a HS* solo en no-producción.
        if (privateKey && publicKey) {
          return {
            privateKey,
            publicKey,
            signOptions: {
              algorithm: 'RS256' as any,
              expiresIn: expiresIn as any,
            },
          };
        }

        const nodeEnv =
          configService.get<string>('NODE_ENV') ?? process.env.NODE_ENV ?? 'development';
        if (nodeEnv === 'production') {
          throw new Error('JWT_PRIVATE_KEY y JWT_PUBLIC_KEY son requeridos en producción');
        }

        const secret =
          configService.get<string>(AUTH_CONSTANTS.JWT_SECRET_ENV) ??
          process.env[AUTH_CONSTANTS.JWT_SECRET_ENV];
        if (!secret) {
          throw new Error('JWT_SECRET (fallback) is required');
        }

        return {
          secret,
          signOptions: { expiresIn: expiresIn as any },
        };
      },
    }),
  ],
  controllers: [AuthControllerRefactored, Auth2FAController, PasswordResetController],
  providers: [
    // Shared Services
    PasswordService,
    // Repository implementation
    {
      provide: AUTH_REPOSITORY,
      useClass: PrismaAuthRepository,
    },
    // Use Cases - Auth
    LoginUseCase,
    RegisterUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    GetCurrentUserUseCase,
    // Use Cases - 2FA
    Send2FACodeUseCase,
    Verify2FACodeUseCase,
    Toggle2FAUseCase,
    SetupTotpUseCase,
    ActivateTotpUseCase,
    // Use Cases - Password Reset
    ForgotPasswordUseCase,
    ValidateResetTokenUseCase,
    ResetPasswordUseCase,
    // Legacy service
    AuthService,
    JwtStrategy,
    Auth2FAEmailHandler,
    TotpService,
  ],
  exports: [
    PasswordService,
    AuthService,
    JwtModule,
    AUTH_REPOSITORY,
    LoginUseCase,
    RegisterUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    GetCurrentUserUseCase,
    Send2FACodeUseCase,
    Verify2FACodeUseCase,
    Toggle2FAUseCase,
    ForgotPasswordUseCase,
    ValidateResetTokenUseCase,
    ResetPasswordUseCase,
    SetupTotpUseCase,
    ActivateTotpUseCase,
  ],
})
export class AuthModule {}
