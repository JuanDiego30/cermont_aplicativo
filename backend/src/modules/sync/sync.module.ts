/**
 * @module SyncModule
 * @description Módulo de sincronización offline con arquitectura DDD mejorada
 *
 * Características:
 * - Cola de sincronización con prioridades
 * - Detección automática de conectividad
 * - Resolución de conflictos (Last Write Wins, Merge, Manual)
 * - Procesamiento en background con reintentos exponenciales
 * - Notificaciones via eventos
 *
 * Capas:
 * - Domain: Entities (SyncQueueItem), Value Objects (SyncStatus, SyncPriority, DeviceId)
 * - Application: Use Cases, DTOs
 * - Infrastructure: Controllers, Services, Persistence
 */

import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ScheduleModule } from "@nestjs/schedule";

// Core
import { PrismaModule } from "../../prisma/prisma.module";

// Legacy Service (to be migrated to use cases)
import { SyncService } from "./sync.service";

// Application Layer
import { ProcessSyncBatchUseCase } from "./application/use-cases/process-sync-batch.use-case";
import { GetPendingSyncUseCase } from "./application/use-cases/get-pending-sync.use-case";
import { SYNC_REPOSITORY } from "./application/dto";

// Infrastructure Layer
import { SyncController } from "./infrastructure/controllers/sync.controller";
import { SyncRepository } from "./infrastructure/persistence/sync.repository";

// New DDD Services
import {
  ConnectivityDetectorService,
  SyncQueueService,
  ConflictResolverService,
  SyncProcessorService,
  SyncBatchEventHandlersService,
} from "./infrastructure/services";

@Module({
  imports: [
    PrismaModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 3,
    }),
    // ScheduleModule ya está configurado globalmente en AppModule
  ],
  controllers: [SyncController],
  providers: [
    // ✅ Legacy Service (mantenido para compatibilidad)
    SyncService,

    // ✅ Use Cases
    ProcessSyncBatchUseCase,
    GetPendingSyncUseCase,

    // ✅ Repository (con inyección de interfaz)
    {
      provide: SYNC_REPOSITORY,
      useClass: SyncRepository,
    },

    // ✅ New DDD Services
    ConnectivityDetectorService,
    SyncQueueService,
    ConflictResolverService,
    SyncProcessorService,
    SyncBatchEventHandlersService,
  ],
  exports: [
    ProcessSyncBatchUseCase,
    GetPendingSyncUseCase,
    SYNC_REPOSITORY,
    SyncService,
    SyncQueueService,
    ConnectivityDetectorService,
    ConflictResolverService,
    SyncBatchEventHandlersService,
  ],
})
export class SyncModule {}
