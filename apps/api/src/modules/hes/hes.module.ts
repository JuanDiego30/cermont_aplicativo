/**
 * @module HesModule
 *
 * Módulo de HES (Hoja de Entrada de Servicio) con DDD completo.
 */

import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Controllers
import { HESController } from './infrastructure/controllers/hes.controller';

// Use Cases
import {
  CreateHESUseCase,
  GetHESUseCase,
  ListHESUseCase,
  SignHESClienteUseCase,
  SignHESTecnicoUseCase,
  CompleteHESUseCase,
  GetHESByOrdenUseCase,
  ExportHESPDFUseCase,
} from './application/use-cases';

// Repositories
import { HESRepository } from './infrastructure/persistence/hes.repository';
import { HES_REPOSITORY } from './domain/repositories';

// Domain Services
import {
  HESValidatorService,
  HESNumeroGeneratorService,
  RiesgoEvaluatorService,
} from './domain/services';

// Infrastructure Services
import { HESPDFGeneratorService } from './infrastructure/pdf/hes-pdf-generator.service';

// Legacy (deprecar)
import { HesService } from './hes.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, EventEmitterModule],
  controllers: [HESController],
  providers: [
    // Repositories
    {
      provide: HES_REPOSITORY,
      useClass: HESRepository,
    },

    // Use Cases
    CreateHESUseCase,
    GetHESUseCase,
    ListHESUseCase,
    SignHESClienteUseCase,
    SignHESTecnicoUseCase,
    CompleteHESUseCase,
    GetHESByOrdenUseCase,
    ExportHESPDFUseCase,

    // Domain Services
    HESValidatorService,
    HESNumeroGeneratorService,
    RiesgoEvaluatorService,

    // Infrastructure Services
    HESPDFGeneratorService,

    // Legacy (deprecar)
    HesService,
  ],
  exports: [
    // Repositories
    HES_REPOSITORY,

    // Use Cases
    CreateHESUseCase,
    GetHESUseCase,
    ListHESUseCase,
    GetHESByOrdenUseCase,

    // Services
    HESValidatorService,
    HESNumeroGeneratorService,
    RiesgoEvaluatorService,

    // Legacy
    HesService,
  ],
})
export class HesModule {}
