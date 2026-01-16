/**
 * @module HesModule
 *
 * Módulo de HES (Hoja de Entrada de Servicio) con DDD completo.
 */

import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";

// Controllers
import { HESController } from "./infrastructure/controllers/hes.controller";

// Use Cases
import {
    CompleteHESUseCase,
    CreateHESUseCase,
    ExportHESPDFUseCase,
    GetHESByOrdenUseCase,
    GetHESUseCase,
    ListHESUseCase,
    SignHESClienteUseCase,
    SignHESTecnicoUseCase,
} from "./application/use-cases";

// Application Services
import { HesSignService } from "./application/services/hes-sign.service";

// Repositories
import { HES_REPOSITORY } from "./domain/repositories";
import { HESRepository } from "./infrastructure/persistence/hes.repository";

// Domain Services
import {
    HESValidatorService,
    RiesgoEvaluatorService,
} from "./domain/services";

// Application Services - Relocated for DI support
import { HESNumeroGeneratorService } from "./application/services/hes-numero-generator.service";

// Infrastructure Services
import { HESPDFGeneratorService } from "./infrastructure/pdf/hes-pdf-generator.service";

// Legacy (deprecar)
import { PrismaModule } from "../../prisma/prisma.module";
import { HesService } from "./hes.service";

@Module({
  imports: [PrismaModule, EventEmitterModule],
  controllers: [HESController],
  providers: [
    // Repositories
    {
      provide: HES_REPOSITORY,
      useClass: HESRepository,
    },

    // Application Services
    HesSignService,

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
