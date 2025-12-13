import {
    Controller,
    Get,
    Post,
    Param,
    Query,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { PdfGenerationService } from './pdf-generation.service';
import type { GeneratedPDF } from './pdf-generation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import * as path from 'path';

@ApiTags('PDF Generation')
@Controller('pdf')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PdfGenerationController {
    constructor(private readonly pdfService: PdfGenerationService) { }

    @Post('informe-tecnico/:ordenId')
    @ApiOperation({ summary: 'Generar informe técnico para una orden' })
    generarInformeTecnico(@Param('ordenId') ordenId: string): Promise<GeneratedPDF> {
        return this.pdfService.generarInformeTecnico(ordenId);
    }

    @Post('acta-entrega/:ordenId')
    @ApiOperation({ summary: 'Generar acta de entrega para una orden' })
    generarActaEntrega(@Param('ordenId') ordenId: string): Promise<GeneratedPDF> {
        return this.pdfService.generarActaEntrega(ordenId);
    }

    @Get('listar')
    @ApiOperation({ summary: 'Listar PDFs generados' })
    listarPDFs(@Query('ordenId') ordenId?: string): Promise<unknown> {
        return this.pdfService.listarPDFs(ordenId);
    }

    @Get('ver/:nombreArchivo')
    @ApiOperation({ summary: 'Visualizar un PDF generado' })
    async verPDF(
        @Param('nombreArchivo') nombreArchivo: string,
        @Res() res: Response,
    ) {
        const filePath = path.join(process.cwd(), 'uploads', 'pdfs', nombreArchivo);
        res.sendFile(filePath);
    }
}
