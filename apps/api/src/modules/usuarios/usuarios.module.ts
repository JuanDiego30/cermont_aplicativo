/**
 * ARCHIVO: usuarios.module.ts
 * FUNCION: Módulo principal de gestión de usuarios con arquitectura limpia
 * IMPLEMENTACION: Inyección de dependencias con providers para use cases y repositorios
 * DEPENDENCIAS: NestJS Module, Use Cases, Repository Interface, Prisma Repository
 * EXPORTS: ListUsuariosUseCase, GetUsuarioByIdUseCase
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
