/**
 * @module ChecklistsModule
 * 
 * Módulo NestJS para gestión de checklists
 */

import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '../../prisma/prisma.module';
import { ChecklistsController } from './infrastructure/controllers';
import { ChecklistRepository } from './infrastructure/persistence';
import {
  CHECKLIST_REPOSITORY,
} from './domain/repositories';
import {
  CreateChecklistUseCase,
  ListChecklistsUseCase,
  AssignChecklistToOrdenUseCase,
  AssignChecklistToEjecucionUseCase,
  GetChecklistsByOrdenUseCase,
  GetChecklistsByEjecucionUseCase,
  ToggleChecklistItemUseCase,
  UpdateChecklistItemUseCase,
  CompleteChecklistUseCase,
  ArchiveChecklistUseCase,
} from './application/use-cases';

@Module({
  imports: [PrismaModule, EventEmitterModule],
  controllers: [ChecklistsController],
  providers: [
    // Repository
    {
      provide: CHECKLIST_REPOSITORY,
      useClass: ChecklistRepository,
    },
    // Use Cases
    CreateChecklistUseCase,
    ListChecklistsUseCase,
    AssignChecklistToOrdenUseCase,
    AssignChecklistToEjecucionUseCase,
    GetChecklistsByOrdenUseCase,
    GetChecklistsByEjecucionUseCase,
    ToggleChecklistItemUseCase,
    UpdateChecklistItemUseCase,
    CompleteChecklistUseCase,
    ArchiveChecklistUseCase,
  ],
  exports: [
    CHECKLIST_REPOSITORY,
    CreateChecklistUseCase,
    ListChecklistsUseCase,
    GetChecklistsByOrdenUseCase,
    GetChecklistsByEjecucionUseCase,
  ],
})
export class ChecklistsModule {}
