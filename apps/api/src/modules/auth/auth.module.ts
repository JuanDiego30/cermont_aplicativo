/**
 * @module AuthModule
 *
 * Módulo de autenticación con JWT (Passport) y configuración del JwtModule.
 * Implementa DDD con use cases, repositorio, y controlador de infrastructure.
 * Incluye 2FA y recuperación de contraseña.
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Infrastructure - Controllers
import { AuthControllerRefactored } from './infrastructure/controllers/auth.controller';
import { Auth2FAController } from './infrastructure/controllers/auth-2fa.controller';
import { PasswordResetController } from './infrastructure/controllers/password-reset.controller';
import { PrismaAuthRepository } from './infrastructure/persistence/prisma-auth.repository';

// Application - Use Cases (Auth)
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { GetCurrentUserUseCase } from './application/use-cases/get-current-user.use-case';

// Application - Use Cases (2FA)
import { Send2FACodeUseCase } from './application/use-cases/send-2fa-code.use-case';
import { Verify2FACodeUseCase } from './application/use-cases/verify-2fa-code.use-case';
import { Toggle2FAUseCase } from './application/use-cases/toggle-2fa.use-case';

// Application - Use Cases (Password Reset)
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { ValidateResetTokenUseCase } from './application/use-cases/validate-reset-token.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';

// Domain
import { AUTH_REPOSITORY } from './domain/repositories';

// Legacy (for gradual migration)
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

// Lib Services
import { PasswordService } from '../../lib/services/password.service';

// Prisma
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [
        ConfigModule,
        PrismaModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            global: true,
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const secret = configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET;
                if (!secret) {
                    throw new Error('JWT_SECRET is required');
                }
                return {
                    secret,
                    signOptions: {
                        expiresIn: 900, // 15 minutos en segundos
                    },
                };
            },
        }),
    ],
    controllers: [
        AuthControllerRefactored,
        Auth2FAController,
        PasswordResetController,
    ],
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
        // Use Cases - Password Reset
        ForgotPasswordUseCase,
        ValidateResetTokenUseCase,
        ResetPasswordUseCase,
        // Legacy service
        AuthService,
        JwtStrategy,
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
    ],
})
export class AuthModule { }
