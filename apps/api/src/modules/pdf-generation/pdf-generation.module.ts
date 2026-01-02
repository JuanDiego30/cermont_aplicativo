import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@/prisma/prisma.module';
import { PdfController } from './infrastructure/controllers/pdf.controller';
import {
    GeneratePdfUseCase,
    GenerateReporteOrdenUseCase,
    GenerateReporteMantenimientoUseCase,
    GenerateCertificadoInspeccionUseCase,
    GetPdfCachedUseCase,
} from './application/use-cases';
import { PuppeteerPdfService, PdfStorageService, PdfGenerationQueueService } from './infrastructure/services';
import { PDF_GENERATOR } from './domain/interfaces/pdf-generator.interface';

@Module({
    imports: [PrismaModule, ConfigModule],
    controllers: [PdfController],
    providers: [
        PdfStorageService,
        PdfGenerationQueueService,
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
    ],
})
export class PdfGenerationModule { }
