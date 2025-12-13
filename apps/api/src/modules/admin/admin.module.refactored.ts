/**
 * @module AdminModule (Refactorizado)
 * 
 * Módulo de administración con Clean Architecture.
 * Gestión de usuarios, roles y permisos.
 */

import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '../../prisma/prisma.module';

// Domain - Repository Token
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';

// Infrastructure
import { UserRepository } from './infrastructure/persistence/user.repository';
import { AdminController } from './infrastructure/controllers/admin.controller';

// Application - Use Cases
import {
  CreateUserUseCase,
  UpdateUserUseCase,
  ChangeUserRoleUseCase,
  ToggleUserActiveUseCase,
  ResetPasswordUseCase,
  ListUsersUseCase,
  GetUserByIdUseCase,
  GetUserStatsUseCase,
} from './application/use-cases';

// Application - Event Handlers
import {
  UserCreatedHandler,
  RoleChangedHandler,
  UserDeactivatedHandler,
  PasswordResetHandler,
} from './application/event-handlers';

// Use Cases array
const useCases = [
  CreateUserUseCase,
  UpdateUserUseCase,
  ChangeUserRoleUseCase,
  ToggleUserActiveUseCase,
  ResetPasswordUseCase,
  ListUsersUseCase,
  GetUserByIdUseCase,
  GetUserStatsUseCase,
];

// Event Handlers array
const eventHandlers = [
  UserCreatedHandler,
  RoleChangedHandler,
  UserDeactivatedHandler,
  PasswordResetHandler,
];

@Module({
  imports: [
    PrismaModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [AdminController],
  providers: [
    // Repository con Dependency Injection
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },

    // Use Cases
    ...useCases,

    // Event Handlers
    ...eventHandlers,
  ],
  exports: [
    // Exportar Use Cases para uso en otros módulos
    ...useCases,
    
    // Exportar token de repositorio por si otro módulo lo necesita
    USER_REPOSITORY,
  ],
})
export class AdminModule {}
