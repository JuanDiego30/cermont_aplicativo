import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '../../prisma/prisma.module';
import { PDFController } from './infrastructure/controllers/pdf.controller';
import { PdfGenerationService } from './pdf-generation.service';
import { GeneratePDFUseCase, GenerateReportePDFUseCase } from './application/use-cases';
import { PDF_SERVICE, PDF_REPOSITORY } from './application/dto';
import { HTMLPDFService } from './infrastructure/services';
import { PrismaPDFRepository } from './infrastructure/persistence';

@Module({
    imports: [PrismaModule, EventEmitterModule.forRoot()],
    controllers: [PDFController],
    providers: [
        PdfGenerationService,
        {
            provide: PDF_SERVICE,
            useClass: HTMLPDFService,
        },
        {
            provide: PDF_REPOSITORY,
            useClass: PrismaPDFRepository,
        },
        GeneratePDFUseCase,
        GenerateReportePDFUseCase,
    ],
    exports: [PdfGenerationService],
})
export class PdfGenerationModule { }
