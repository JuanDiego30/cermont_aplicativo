/**
 * @module AdminModule
 *
 * Módulo de administración para gestión de usuarios, roles y permisos.
 * Arquitectura limpia con separación de capas:
 * - Domain: Entidades, Value Objects, Eventos, Interfaces de repositorio
 * - Application: Casos de uso, DTOs, Mappers, Event Handlers
 * - Infrastructure: Controllers, Persistencia (Prisma)
 */
import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";

// Infrastructure
import { AdminController } from "./infrastructure/controllers";
import { UserRepository } from "./infrastructure/persistence/user.repository";

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
} from "./application/use-cases";

// Application - Event Handlers
import {
  UserCreatedHandler,
  RoleChangedHandler,
  UserDeactivatedHandler,
  PasswordResetHandler,
} from "./application/event-handlers";

// Domain - Repository Interface Token
import { USER_REPOSITORY } from "./domain/repositories/user.repository.interface";

// Legacy Service (mantenido por compatibilidad)
import { AdminService } from "./admin.service";

// Shared Services
import { PasswordService } from "../../lib/services/password.service";

// Import AuthModule for PasswordService dependency
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule, // Para acceder a PasswordService
    // EventEmitterModule is already registered globally in AppModule
  ],
  controllers: [AdminController],
  providers: [
    // ✅ Shared Services
    PasswordService,

    // ✅ Repository (inyección por interfaz)
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },

    // ✅ Use Cases
    CreateUserUseCase,
    UpdateUserUseCase,
    ChangeUserRoleUseCase,
    ToggleUserActiveUseCase,
    ResetPasswordUseCase,
    ListUsersUseCase,
    GetUserByIdUseCase,
    GetUserStatsUseCase,

    // ✅ Event Handlers
    UserCreatedHandler,
    RoleChangedHandler,
    UserDeactivatedHandler,
    PasswordResetHandler,

    // Legacy Service (mantenido por compatibilidad)
    AdminService,
  ],
  exports: [
    // Exportar PasswordService para uso en otros módulos
    PasswordService,

    // Exportar casos de uso para uso en otros módulos si es necesario
    CreateUserUseCase,
    UpdateUserUseCase,
    ChangeUserRoleUseCase,
    ToggleUserActiveUseCase,
    ResetPasswordUseCase,
    ListUsersUseCase,
    GetUserByIdUseCase,
    GetUserStatsUseCase,

    // Exportar repositorio para uso en otros módulos
    USER_REPOSITORY,

    // Legacy Service (mantenido por compatibilidad)
    AdminService,
  ],
})
export class AdminModule {}
