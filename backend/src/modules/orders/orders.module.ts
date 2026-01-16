/**
 * @module OrdersModule
 * @description Módulo de órdenes con Clean Architecture
 *
 * Principios aplicados:
 * - DIP: Inyección de dependencias con interfaces
 * - SRP: Separación en capas (domain, application, infrastructure)
 * - OCP: Extensible mediante use cases
 */
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { NotificationsModule } from "../notifications/notifications.module";

// Domain
import { Order_REPOSITORY } from "./domain/repositories";

// Application - Use Cases & Services
import { OrderStateService } from "./application/services/order-state.service";
import {
    AsignarTecnicoOrderUseCase,
    ChangeOrderstadoUseCase,
    CreateOrderUseCase,
    DeleteOrderUseCase,
    FindOrderUseCase,
    GetHistorialEstadosUseCase,
    GetOrderByIdUseCase,
    ListOrdersUseCase,
    UpdateOrderUseCase,
} from "./application/use-cases";

// Infrastructure
import { OrdersController } from "./infrastructure/controllers";
import { OrdersNotificationsHandler } from "./infrastructure/event-handlers/orders-notifications.handler";
import { OrdersWebhookHandler } from "./infrastructure/event-handlers/orders-webhook.handler";
import { PrismaOrderRepository } from "./infrastructure/persistence";
import { OrdersWebhookService } from "./infrastructure/services/orders-webhook.service";

/**
 * Providers de Use Cases
 */
const useCaseProviders = [
  ListOrdersUseCase,
  GetOrderByIdUseCase,
  FindOrderUseCase,
  CreateOrderUseCase,
  UpdateOrderUseCase,
  ChangeOrderstadoUseCase,
  AsignarTecnicoOrderUseCase,
  GetHistorialEstadosUseCase,
  DeleteOrderUseCase,
];

@Module({
  imports: [PrismaModule, NotificationsModule, HttpModule],
  controllers: [
    OrdersController, // Clean Architecture Controller
  ],
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
