/**
 * @module AuthModule
 *
 * Módulo de autenticación con JWT (Passport) y configuración del JwtModule.
 * Implementa DDD con use cases, repositorio, y controlador de infrastructure.
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Infrastructure
import { AuthControllerRefactored } from './infrastructure/controllers/auth.controller';
import { PrismaAuthRepository } from './infrastructure/persistence/prisma-auth.repository';

// Application - Use Cases
import {
    LoginUseCase,
    RegisterUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    GetCurrentUserUseCase,
} from './application/use-cases';

// Domain
import { AUTH_REPOSITORY } from './domain/repositories';

// Legacy (for gradual migration)
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

// Prisma
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [
        PrismaModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        EventEmitterModule.forRoot(),
        JwtModule.registerAsync({
            global: true,
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const secret = configService.get<string>('JWT_SECRET');
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
    controllers: [AuthControllerRefactored],
    providers: [
        // Repository implementation
        {
            provide: AUTH_REPOSITORY,
            useClass: PrismaAuthRepository,
        },
        // Use Cases
        LoginUseCase,
        RegisterUseCase,
        RefreshTokenUseCase,
        LogoutUseCase,
        GetCurrentUserUseCase,
        // Legacy service (can be removed after full migration)
        AuthService,
        JwtStrategy,
    ],
    exports: [AuthService, JwtModule, AUTH_REPOSITORY],
})
export class AuthModule { }
