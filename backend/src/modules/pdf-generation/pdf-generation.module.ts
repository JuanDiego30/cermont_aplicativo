import { PrismaModule } from '@/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FormInspectionPdfService } from './application/services/form-inspection-pdf.service';
import { PdfBuildService } from './application/services/pdf-build.service';
import {
  GenerateCertificadoInspeccionUseCase,
  GeneratePdfUseCase,
  GenerateReporteMantenimientoUseCase,
  GenerateReporteOrdenUseCase,
  GetPdfCachedUseCase,
} from './application/use-cases';
import { PDF_GENERATOR } from './domain/interfaces/pdf-generator.interface';
import { PdfController } from './infrastructure/controllers/pdf.controller';
import {
  PdfGenerationQueueService,
  PdfStorageService,
  PuppeteerPdfService,
} from './infrastructure/services';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [PdfController],
  providers: [
    PdfStorageService,
    PdfGenerationQueueService,
    PdfBuildService,
    FormInspectionPdfService,
    {
      provide: PDF_GENERATOR,
      useClass: PuppeteerPdfService,
    },
    // Use Cases
    GeneratePdfUseCase,
    GenerateReporteOrdenUseCase,
    GenerateReporteMantenimientoUseCase,
    GenerateCertificadoInspeccionUseCase,
    GetPdfCachedUseCase,
  ],
  exports: [
    GeneratePdfUseCase,
    GenerateReporteOrdenUseCase,
    GenerateReporteMantenimientoUseCase,
    GenerateCertificadoInspeccionUseCase,
    FormInspectionPdfService,
  ],
})
export class PdfGenerationModule {}
