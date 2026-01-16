/**
 * @module OrdersModule
 * @description Módulo de órdenes con Clean Architecture + CQRS
 *
 * Principios aplicados:
 * - DIP: Inyección de dependencias con interfaces
 * - SRP: Separación en capas (domain, application, infrastructure)
 * - OCP: Extensible mediante use cases
 * - CQRS: Command/Query Separation
 */

import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

// Domain
import { Order_REPOSITORY } from './domain/repositories';

// Application - Use Cases & Services & Handlers
import { OrderStateService } from './application/services/order-state.service';
import {
  AsignarTecnicoOrderUseCase,
  ChangeOrderEstadoUseCase,
  CreateOrderUseCase,
  DeleteOrderUseCase,
  FindOrderUseCase,
  GetHistorialEstadosUseCase,
  GetOrderByIdUseCase,
  ListOrdersUseCase,
  UpdateOrderUseCase,
} from './application/use-cases';

import { CreateOrderHandler, GetOrdersHandler, UpdateOrderHandler } from './application/handlers';

// Infrastructure
import { OrdersController } from './infrastructure/controllers';
import { OrdersNotificationsHandler } from './infrastructure/event-handlers/orders-notifications.handler';
import { OrdersWebhookHandler } from './infrastructure/event-handlers/orders-webhook.handler';
import { PrismaOrderRepository } from './infrastructure/persistence';
import { OrdersWebhookService } from './infrastructure/services/orders-webhook.service';

/**
 * Providers de Use Cases
 */
const useCaseProviders = [
  ListOrdersUseCase,
  GetOrderByIdUseCase,
  FindOrderUseCase,
  CreateOrderUseCase,
  UpdateOrderUseCase,
  ChangeOrderEstadoUseCase,
  AsignarTecnicoOrderUseCase,
  GetHistorialEstadosUseCase,
  DeleteOrderUseCase,
];

/**
 * CQRS Command Handlers
 */
const commandHandlers = [CreateOrderHandler];

/**
 * CQRS Query Handlers
 */
const queryHandlers = [GetOrdersHandler];

@Module({
  imports: [PrismaModule, NotificationsModule, HttpModule, CqrsModule],
  controllers: [OrdersController],
  providers: [
    // Repository Implementation
    {
      provide: Order_REPOSITORY,
      useClass: PrismaOrderRepository,
    },
    PrismaOrderRepository,

    // Use Cases & Application Services
    ...useCaseProviders,
    OrderStateService,

    // CQRS Handlers
    ...commandHandlers,
    ...queryHandlers,

    // Event handlers & outbound integrations
    OrdersNotificationsHandler,
    OrdersWebhookHandler,
    OrdersWebhookService,
  ],
  exports: [
    Order_REPOSITORY,
    ...useCaseProviders,
    OrderStateService,
    FindOrderUseCase,
    AsignarTecnicoOrderUseCase,
    GetHistorialEstadosUseCase,
  ],
})
export class OrdersModule {}
