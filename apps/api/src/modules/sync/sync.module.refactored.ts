/**
 * @module SyncModule (Refactored)
 */
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SYNC_REPOSITORY } from './application/dto';
import { SyncRepository } from './infrastructure/persistence';
import { SyncController } from './infrastructure/controllers';
import { ProcessSyncBatchUseCase, GetPendingSyncUseCase } from './application/use-cases';

@Module({
  imports: [PrismaModule],
  controllers: [SyncController],
  providers: [
    { provide: SYNC_REPOSITORY, useClass: SyncRepository },
    ProcessSyncBatchUseCase,
    GetPendingSyncUseCase,
  ],
  exports: [SYNC_REPOSITORY],
})
export class SyncModuleRefactored {}
