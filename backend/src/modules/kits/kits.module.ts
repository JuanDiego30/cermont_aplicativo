/**
 * ═══════════════════════════════════════════════════════════════════════════
 * KITS MODULE - CERMONT APLICATIVO (DDD REFACTORED)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Módulo NestJS que encapsula la funcionalidad de Kits con arquitectura DDD.
 *
 * Estructura:
 * - Domain Layer: Entities, Value Objects, Events, Repositories Interfaces
 * - Application Layer: Use Cases, DTOs, Mappers
 * - Infrastructure Layer: Repository Implementations, Controllers
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';

// Controller
import { KitsController } from './infrastructure/controllers/kits.controller';

// Repository
import { KIT_REPOSITORY } from './domain/repositories';
import { KitRepositoryImpl } from './infrastructure/persistence/kit.repository.impl';

// Use Cases
import {
  GetKitUseCase,
  CreateKitUseCase,
  ListKitsUseCase,
  UpdateKitUseCase,
  AddItemToKitUseCase,
  RemoveItemFromKitUseCase,
  ActivateKitUseCase,
  DeactivateKitUseCase,
  DeleteKitUseCase,
} from './application/use-cases';

// Legacy Service (for backward compatibility)
import { KitsService } from './kits.service';

@Module({
  imports: [PrismaModule],
  controllers: [KitsController],
  providers: [
    // Repository
    {
      provide: KIT_REPOSITORY,
      useClass: KitRepositoryImpl,
    },

    // Use Cases
    GetKitUseCase,
    CreateKitUseCase,
    ListKitsUseCase,
    UpdateKitUseCase,
    AddItemToKitUseCase,
    RemoveItemFromKitUseCase,
    ActivateKitUseCase,
    DeactivateKitUseCase,
    DeleteKitUseCase,

    // Legacy Service
    KitsService,
  ],
  exports: [
    KitsService, // Export legacy for other modules
    GetKitUseCase,
    CreateKitUseCase,
    ListKitsUseCase,
  ],
})
export class KitsModule {}
