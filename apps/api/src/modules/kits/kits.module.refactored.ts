/**
 * @module KitsModule (Refactored)
 */
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { KIT_REPOSITORY } from './application/dto';
import { KitRepository } from './infrastructure/persistence';
import { KitsController } from './infrastructure/controllers';
import { ListKitsUseCase, CreateKitUseCase } from './application/use-cases';

@Module({
  imports: [PrismaModule],
  controllers: [KitsController],
  providers: [
    { provide: KIT_REPOSITORY, useClass: KitRepository },
    ListKitsUseCase,
    CreateKitUseCase,
  ],
  exports: [KIT_REPOSITORY],
})
export class KitsModuleRefactored {}
