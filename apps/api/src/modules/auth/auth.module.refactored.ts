/**
 * @module AuthModule (Refactorizado)
 * @description Módulo de autenticación con Clean Architecture
 * @layer Infrastructure
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Domain
import { AUTH_REPOSITORY } from './domain/repositories';

// Application - Use Cases
import {
  LoginUseCase,
  RegisterUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
  GetCurrentUserUseCase,
} from './application/use-cases';

// Infrastructure
import { AuthRepository } from './infrastructure/persistence';
import { AuthControllerRefactored } from './infrastructure/controllers';
import { JwtStrategy } from './strategies/jwt.strategy';

const useCases = [
  LoginUseCase,
  RegisterUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
  GetCurrentUserUseCase,
];

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
            expiresIn: 900, // 15 minutos
          },
        };
      },
    }),
  ],
  controllers: [AuthControllerRefactored],
  providers: [
    // Repository
    {
      provide: AUTH_REPOSITORY,
      useClass: AuthRepository,
    },
    // Use Cases
    ...useCases,
    // Strategy
    JwtStrategy,
  ],
  exports: [
    AUTH_REPOSITORY,
    JwtModule,
    ...useCases,
  ],
})
export class AuthModuleRefactored {}
