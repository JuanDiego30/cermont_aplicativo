/**
 * @module EvidenciasModule
 * @description Evidencias module with Clean Architecture + DDD
 */

import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { memoryStorage } from "multer";
import { PrismaModule } from "../../prisma/prisma.module";
import { OrdenesModule } from "../ordenes/ordenes.module";

// Domain
import { EVIDENCIA_REPOSITORY } from "./domain/repositories";
import { FileValidatorService } from "./domain/services";

// Application - Use Cases
import {
  UploadEvidenciaUseCase,
  ListEvidenciasUseCase,
  GetEvidenciaUseCase,
  DeleteEvidenciaUseCase,
  DownloadEvidenciaUseCase,
  ProcessEvidenciaUseCase,
  GenerateEvidenciaDownloadTokenUseCase,
  DownloadEvidenciaByTokenUseCase,
  CleanupDeletedEvidenciaUseCase,
} from "./application/use-cases";

// Infrastructure
import {
  EvidenciasController,
  OrdenesEvidenciasController,
} from "./infrastructure/controllers";
import { PrismaEvidenciaRepository } from "./infrastructure/persistence";
import {
  STORAGE_PROVIDER,
  LocalStorageProvider,
} from "./infrastructure/storage";
import {
  IMAGE_PROCESSOR,
  SharpImageProcessor,
} from "./infrastructure/processing";

// Legacy service (for backward compatibility)
import { EvidenciasService } from "./evidencias.service";

const useCaseProviders = [
  UploadEvidenciaUseCase,
  ListEvidenciasUseCase,
  GetEvidenciaUseCase,
  DeleteEvidenciaUseCase,
  DownloadEvidenciaUseCase,
  ProcessEvidenciaUseCase,
  GenerateEvidenciaDownloadTokenUseCase,
  DownloadEvidenciaByTokenUseCase,
  CleanupDeletedEvidenciaUseCase,
];

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    OrdenesModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        storage: memoryStorage(), // Use memory for processing before save
        limits: {
          fileSize:
            // Prefer prompt-aligned env var (MB), fallback to legacy bytes env var.
            (config.get<number>("MAX_FILE_SIZE_MB") ?? 50) * 1024 * 1024 ||
            config.get<number>("MAX_UPLOAD_SIZE", 100 * 1024 * 1024),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [EvidenciasController, OrdenesEvidenciasController],
  providers: [
    // Domain Services
    FileValidatorService,

    // Repository
    {
      provide: EVIDENCIA_REPOSITORY,
      useClass: PrismaEvidenciaRepository,
    },
    PrismaEvidenciaRepository,

    // Storage Provider
    {
      provide: STORAGE_PROVIDER,
      useClass: LocalStorageProvider,
    },
    LocalStorageProvider,

    // Image Processor
    {
      provide: IMAGE_PROCESSOR,
      useClass: SharpImageProcessor,
    },
    SharpImageProcessor,

    // Use Cases
    ...useCaseProviders,

    // Legacy Service (keep for backward compat)
    EvidenciasService,
  ],
  exports: [EVIDENCIA_REPOSITORY, STORAGE_PROVIDER, EvidenciasService],
})
export class EvidenciasModule {}
