/**
 * @module EjecucionModule (Refactored)
 */
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { EJECUCION_REPOSITORY } from './domain/repositories';
import { EjecucionRepository } from './infrastructure/persistence';
import { EjecucionController } from './infrastructure/controllers';
import {
  GetEjecucionUseCase,
  IniciarEjecucionUseCase,
  UpdateAvanceUseCase,
  CompletarEjecucionUseCase,
} from './application/use-cases';

@Module({
  imports: [PrismaModule],
  controllers: [EjecucionController],
  providers: [
    { provide: EJECUCION_REPOSITORY, useClass: EjecucionRepository },
    GetEjecucionUseCase,
    IniciarEjecucionUseCase,
    UpdateAvanceUseCase,
    CompletarEjecucionUseCase,
  ],
  exports: [EJECUCION_REPOSITORY],
})
export class EjecucionModuleRefactored {}
