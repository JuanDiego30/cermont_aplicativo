/**
 * @module UsuariosModule (Refactorizado)
 * @description Módulo de usuarios con Clean Architecture
 * @layer Infrastructure
 */
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Domain
import { USUARIO_REPOSITORY } from './domain/repositories';

// Application - Use Cases
import {
  ListUsuariosUseCase,
  GetUsuarioByIdUseCase,
  CreateUsuarioUseCase,
  UpdateUsuarioUseCase,
  DeactivateUsuarioUseCase,
} from './application/use-cases';

// Infrastructure
import { UsuarioRepository } from './infrastructure/persistence';
import { UsuariosControllerRefactored } from './infrastructure/controllers';

const useCases = [
  ListUsuariosUseCase,
  GetUsuarioByIdUseCase,
  CreateUsuarioUseCase,
  UpdateUsuarioUseCase,
  DeactivateUsuarioUseCase,
];

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [UsuariosControllerRefactored],
  providers: [
    // Repository
    {
      provide: USUARIO_REPOSITORY,
      useClass: UsuarioRepository,
    },
    // Use Cases
    ...useCases,
  ],
  exports: [USUARIO_REPOSITORY, ...useCases],
})
export class UsuariosModuleRefactored {}
