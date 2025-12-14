/**
 * @module UsuariosModule
 * @description Módulo de usuarios con Clean Architecture
 *
 * Estructura:
 * - Domain: Entities y Repository interfaces
 * - Application: Use Cases y DTOs
 * - Infrastructure: Controllers y Persistence
 */
import { Module } from '@nestjs/common';

// Infrastructure Layer
import { UsuariosControllerRefactored } from './infrastructure/controllers/usuarios.controller';

// Application Layer - Use Cases
import {
    ListUsuariosUseCase,
    GetUsuarioByIdUseCase,
    CreateUsuarioUseCase,
    UpdateUsuarioUseCase,
    DeactivateUsuarioUseCase,
} from './application/use-cases';

// Domain Layer - Repositories
import { USUARIO_REPOSITORY } from './domain/repositories';
import { PrismaUsuarioRepository } from './infrastructure/persistence';

@Module({
    controllers: [UsuariosControllerRefactored],
    providers: [
        // Repositories
        {
            provide: USUARIO_REPOSITORY,
            useClass: PrismaUsuarioRepository,
        },
        // Use Cases
        ListUsuariosUseCase,
        GetUsuarioByIdUseCase,
        CreateUsuarioUseCase,
        UpdateUsuarioUseCase,
        DeactivateUsuarioUseCase,
    ],
    exports: [
        // Export use cases for other modules that might need them
        ListUsuariosUseCase,
        GetUsuarioByIdUseCase,
    ],
})
export class UsuariosModule { }
