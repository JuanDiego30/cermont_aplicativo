/**
 * @module EvidenciasModule
 * @description Módulo de evidencias con Clean Architecture
 */
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaModule } from '../../prisma/prisma.module';

// Domain
import { EVIDENCIA_REPOSITORY } from './domain/repositories/evidencia.repository.interface';

// Application
import {
    UploadEvidenciaUseCase,
    ListEvidenciasByOrdenUseCase,
    DeleteEvidenciaUseCase,
    ListAllEvidenciasUseCase,
} from './application/use-cases';

// Infrastructure
import { EvidenciasController } from './infrastructure/controllers';
import { PrismaEvidenciaRepository } from './infrastructure/persistence';
import { EvidenciasService } from './evidencias.service';

const useCaseProviders = [
    UploadEvidenciaUseCase,
    ListEvidenciasByOrdenUseCase,
    DeleteEvidenciaUseCase,
    ListAllEvidenciasUseCase,
];

@Module({
    imports: [
        PrismaModule,
        MulterModule.register({
            dest: './uploads',
            limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
        }),
    ],
    controllers: [EvidenciasController],
    providers: [
        // Repositorio
        {
            provide: EVIDENCIA_REPOSITORY,
            useClass: PrismaEvidenciaRepository,
        },
        PrismaEvidenciaRepository,

        // Use Cases
        ...useCaseProviders,

        // Service (Legacy/Simpler implementation support)
        EvidenciasService,
    ],
    exports: [EVIDENCIA_REPOSITORY, EvidenciasService],
})
export class EvidenciasModule { }
