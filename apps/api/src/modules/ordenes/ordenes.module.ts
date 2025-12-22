/**
 * @module OrdenesModule
 * @description Módulo de órdenes con Clean Architecture
 * 
 * Principios aplicados:
 * - DIP: Inyección de dependencias con interfaces
 * - SRP: Separación en capas (domain, application, infrastructure)
 * - OCP: Extensible mediante use cases
 */
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '../../prisma/prisma.module';

// Domain
import { ORDEN_REPOSITORY } from './domain/repositories';

// Application - Use Cases & Services
import {
  ListOrdenesUseCase,
  GetOrdenByIdUseCase,
  CreateOrdenUseCase,
  UpdateOrdenUseCase,
  ChangeOrdenEstadoUseCase,
  DeleteOrdenUseCase,
} from './application/use-cases';
import { OrderStateService } from './application/services/order-state.service';

// Infrastructure
import { PrismaOrdenRepository } from './infrastructure/persistence';
import { OrdenesController } from './infrastructure/controllers';

/**
 * Providers de Use Cases
 */
const useCaseProviders = [
  ListOrdenesUseCase,
  GetOrdenByIdUseCase,
  CreateOrdenUseCase,
  UpdateOrdenUseCase,
  ChangeOrdenEstadoUseCase,
  DeleteOrdenUseCase,
];

@Module({
  imports: [PrismaModule, EventEmitterModule.forRoot()],
  controllers: [
    OrdenesController, // Clean Architecture Controller
  ],
  providers: [
    // Repository Implementation
    {
      provide: ORDEN_REPOSITORY,
      useClass: PrismaOrdenRepository,
    },
    PrismaOrdenRepository,

    // Use Cases & Application Services
    ...useCaseProviders,
    OrderStateService,
  ],
  exports: [
    ORDEN_REPOSITORY,
    ...useCaseProviders,
    OrderStateService,
  ],
})
export class OrdenesModule { }
