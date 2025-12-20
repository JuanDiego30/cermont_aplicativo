/**
 * @module SyncModule
 * @description Módulo de sincronización offline con arquitectura DDD
 * 
 * Capas:
 * - Application: Use Cases, DTOs
 * - Infrastructure: Controllers, Persistence (Repository)
 */

import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Core
import { PrismaModule } from '../../prisma/prisma.module';

// Application Layer
import { ProcessSyncBatchUseCase } from './application/use-cases/process-sync-batch.use-case';
import { GetPendingSyncUseCase } from './application/use-cases/get-pending-sync.use-case';
import { SYNC_REPOSITORY } from './application/dto';

// Infrastructure Layer
import { SyncController } from './infrastructure/controllers/sync.controller';
import { SyncRepository } from './infrastructure/persistence/sync.repository';

@Module({
    imports: [
        PrismaModule,
        // EventEmitterModule ya está configurado globalmente en AppModule
    ],
    controllers: [SyncController],
    providers: [
        // ✅ Use Cases
        ProcessSyncBatchUseCase,
        GetPendingSyncUseCase,

        // ✅ Repository (con inyección de interfaz)
        {
            provide: SYNC_REPOSITORY,
            useClass: SyncRepository,
        },
    ],
    exports: [ProcessSyncBatchUseCase, GetPendingSyncUseCase, SYNC_REPOSITORY],
})
export class SyncModule { }
