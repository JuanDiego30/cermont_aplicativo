/**
 * @module EvidenceModule
 * @description Evidencias module with Clean Architecture + DDD
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrdersModule } from '../orders/orders.module';

// Domain
import { EVIDENCIA_REPOSITORY } from './domain/repositories';
import { FileValidatorService } from './domain/services';

// Application - Use Cases
import {
  CleanupDeletedEvidenciaUseCase,
  DeleteEvidenciaUseCase,
  DownloadEvidenciaByTokenUseCase,
  DownloadEvidenciaUseCase,
  GenerateEvidenciaDownloadTokenUseCase,
  GetEvidenciaUseCase,
  ListEvidenciasUseCase,
  ProcessEvidenciaUseCase,
  UploadEvidenciaUseCase,
} from './application/use-cases';

// Infrastructure
import { EvidenciasController, OrdenesEvidenciasController } from './infrastructure/controllers';
import { PrismaEvidenciaRepository } from './infrastructure/persistence';
import { IMAGE_PROCESSOR, SharpImageProcessor } from './infrastructure/processing';
import { LocalStorageProvider, STORAGE_PROVIDER } from './infrastructure/storage';

// Legacy service (for backward compatibility)
import { EvidenciasService } from './evidencias.service';

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
    OrdersModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        storage: memoryStorage(), // Use memory for processing before save
        limits: {
          fileSize:
            // Prefer prompt-aligned env var (MB), fallback to legacy bytes env var.
            (config.get<number>('MAX_FILE_SIZE_MB') ?? 50) * 1024 * 1024 ||
            config.get<number>('MAX_UPLOAD_SIZE', 100 * 1024 * 1024),
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
export class EvidenceModule {}
