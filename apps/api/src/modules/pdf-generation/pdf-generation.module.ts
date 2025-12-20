import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PDFController } from './infrastructure/controllers/pdf.controller';
import { PdfGenerationService } from './pdf-generation.service';
import { GeneratePDFUseCase, GenerateReportePDFUseCase } from './application/use-cases';

@Module({
    imports: [PrismaModule],
    controllers: [PDFController],
    providers: [
        PdfGenerationService,
        GeneratePDFUseCase,
        GenerateReportePDFUseCase,
    ],
    exports: [PdfGenerationService],
})
export class PdfGenerationModule { }
