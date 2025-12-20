import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { EjecucionController } from './infrastructure/controllers/ejecucion.controller';
import { EjecucionService } from './ejecucion.service';
import {
  GetEjecucionUseCase,
  IniciarEjecucionUseCase,
  UpdateAvanceUseCase,
  CompletarEjecucionUseCase,
} from './application/use-cases';
import { EJECUCION_REPOSITORY } from './domain/repositories';
import { EjecucionRepository } from './infrastructure/persistence/ejecucion.repository';

@Module({
  imports: [PrismaModule],
  controllers: [EjecucionController],
  providers: [
    // Repository binding (Dependency Inversion)
    {
      provide: EJECUCION_REPOSITORY,
      useClass: EjecucionRepository,
    },
    // Services
    EjecucionService,
    // Use Cases
    GetEjecucionUseCase,
    IniciarEjecucionUseCase,
    UpdateAvanceUseCase,
    CompletarEjecucionUseCase,
  ],
  exports: [
    EjecucionService,
    EJECUCION_REPOSITORY,
    GetEjecucionUseCase,
    IniciarEjecucionUseCase,
  ],
})
export class EjecucionModule { }
