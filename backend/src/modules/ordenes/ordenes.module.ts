/**
 * @module OrdenesModule
 * @description Módulo de órdenes con Clean Architecture
 *
 * Principios aplicados:
 * - DIP: Inyección de dependencias con interfaces
 * - SRP: Separación en capas (domain, application, infrastructure)
 * - OCP: Extensible mediante use cases
 */
import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { PrismaModule } from "../../prisma/prisma.module";
import { NotificationsModule } from "../notifications/notifications.module";

// Domain
import { ORDEN_REPOSITORY } from "./domain/repositories";

// Application - Use Cases & Services
import {
  ListOrdenesUseCase,
  GetOrdenByIdUseCase,
  FindOrdenUseCase,
  CreateOrdenUseCase,
  UpdateOrdenUseCase,
  ChangeOrdenEstadoUseCase,
  AsignarTecnicoOrdenUseCase,
  GetHistorialEstadosUseCase,
  DeleteOrdenUseCase,
} from "./application/use-cases";
import { OrderStateService } from "./application/services/order-state.service";

// Infrastructure
import { PrismaOrdenRepository } from "./infrastructure/persistence";
import { OrdenesController } from "./infrastructure/controllers";
import { OrdenesNotificationsHandler } from "./infrastructure/event-handlers/ordenes-notifications.handler";
import { OrdenesWebhookHandler } from "./infrastructure/event-handlers/ordenes-webhook.handler";
import { OrdenesWebhookService } from "./infrastructure/services/ordenes-webhook.service";

/**
 * Providers de Use Cases
 */
const useCaseProviders = [
  ListOrdenesUseCase,
  GetOrdenByIdUseCase,
  FindOrdenUseCase,
  CreateOrdenUseCase,
  UpdateOrdenUseCase,
  ChangeOrdenEstadoUseCase,
  AsignarTecnicoOrdenUseCase,
  GetHistorialEstadosUseCase,
  DeleteOrdenUseCase,
];

@Module({
  imports: [PrismaModule, NotificationsModule, HttpModule],
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

    // Event handlers & outbound integrations
    OrdenesNotificationsHandler,
    OrdenesWebhookHandler,
    OrdenesWebhookService,
  ],
  exports: [
    ORDEN_REPOSITORY,
    ...useCaseProviders,
    OrderStateService,
    FindOrdenUseCase,
    AsignarTecnicoOrdenUseCase,
    GetHistorialEstadosUseCase,
  ],
})
export class OrdenesModule {}
