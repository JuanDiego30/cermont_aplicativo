import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import {
  CompletarEjecucionUseCase,
  GetEjecucionUseCase,
  GetMisEjecucionesUseCase,
  IniciarEjecucionUseCase,
  UpdateAvanceUseCase,
} from './application/use-cases';
import { EJECUCION_REPOSITORY } from './domain/repositories';
import { ExecutionService } from './execution.service';
import { ExecutionController } from './infrastructure/controllers/execution.controller';
import { EjecucionRepository } from './infrastructure/persistence/ejecucion.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ExecutionController],
  providers: [
    {
      provide: EJECUCION_REPOSITORY,
      useClass: EjecucionRepository,
    },
    ExecutionService,
    GetEjecucionUseCase,
    IniciarEjecucionUseCase,
    UpdateAvanceUseCase,
    CompletarEjecucionUseCase,
    GetMisEjecucionesUseCase,
  ],
  exports: [
    ExecutionService,
    EJECUCION_REPOSITORY,
    GetEjecucionUseCase,
    IniciarEjecucionUseCase,
    GetMisEjecucionesUseCase,
  ],
})
export class ExecutionModule {}
