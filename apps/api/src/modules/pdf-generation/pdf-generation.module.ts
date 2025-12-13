import { Module } from '@nestjs/common';
import { PdfGenerationController } from './pdf-generation.controller';
import { PdfGenerationService } from './pdf-generation.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PdfGenerationController],
    providers: [PdfGenerationService],
    exports: [PdfGenerationService],
})
export class PdfGenerationModule { }
