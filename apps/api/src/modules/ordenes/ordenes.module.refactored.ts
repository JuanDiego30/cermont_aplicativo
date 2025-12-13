/**
 * @module OrdenesModule (Refactorizado)
 * @description Módulo de órdenes con Clean Architecture
 * @layer Infrastructure
 */
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Domain
import { ORDEN_REPOSITORY } from './domain/repositories';

// Application - Use Cases
import {
  ListOrdenesUseCase,
  GetOrdenByIdUseCase,
  CreateOrdenUseCase,
  UpdateOrdenUseCase,
  ChangeOrdenEstadoUseCase,
  DeleteOrdenUseCase,
} from './application/use-cases';

// Infrastructure
import { OrdenRepository } from './infrastructure/persistence';
import { OrdenesControllerRefactored } from './infrastructure/controllers';

const useCases = [
  ListOrdenesUseCase,
  GetOrdenByIdUseCase,
  CreateOrdenUseCase,
  UpdateOrdenUseCase,
  ChangeOrdenEstadoUseCase,
  DeleteOrdenUseCase,
];

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [OrdenesControllerRefactored],
  providers: [
    // Repository
    {
      provide: ORDEN_REPOSITORY,
      useClass: OrdenRepository,
    },
    // Use Cases
    ...useCases,
  ],
  exports: [ORDEN_REPOSITORY, ...useCases],
})
export class OrdenesModuleRefactored {}
