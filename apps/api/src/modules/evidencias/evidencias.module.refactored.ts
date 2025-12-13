/**
 * @module EvidenciasModule (Refactored)
 */
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PrismaModule } from '../../prisma/prisma.module';
import { EVIDENCIA_REPOSITORY } from './domain/repositories';
import { EvidenciaRepository } from './infrastructure/persistence';
import { EvidenciasController } from './infrastructure/controllers';
import {
  ListEvidenciasUseCase,
  UploadEvidenciaUseCase,
  DeleteEvidenciaUseCase,
} from './application/use-cases';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/evidencias',
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  ],
  controllers: [EvidenciasController],
  providers: [
    { provide: EVIDENCIA_REPOSITORY, useClass: EvidenciaRepository },
    ListEvidenciasUseCase,
    UploadEvidenciaUseCase,
    DeleteEvidenciaUseCase,
  ],
  exports: [EVIDENCIA_REPOSITORY],
})
export class EvidenciasModuleRefactored {}
