/**
 * @module ChecklistsModule (Refactored)
 */
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CHECKLIST_REPOSITORY } from './domain/repositories';
import { ChecklistRepository } from './infrastructure/persistence';
import { ChecklistsController } from './infrastructure/controllers';
import {
  ListChecklistsUseCase,
  CreateChecklistUseCase,
  ToggleChecklistItemUseCase,
  GetChecklistsByOrdenUseCase,
  AssignChecklistToOrdenUseCase,
} from './application/use-cases';

@Module({
  imports: [PrismaModule],
  controllers: [ChecklistsController],
  providers: [
    { provide: CHECKLIST_REPOSITORY, useClass: ChecklistRepository },
    ListChecklistsUseCase,
    CreateChecklistUseCase,
    ToggleChecklistItemUseCase,
    GetChecklistsByOrdenUseCase,
    AssignChecklistToOrdenUseCase,
  ],
  exports: [CHECKLIST_REPOSITORY],
})
export class ChecklistsModuleRefactored {}
