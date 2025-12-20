/**
 * @controller PDFController
 * @description Controlador unificado de generación de PDFs
 */
import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Res,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { GeneratePDFUseCase, GenerateReportePDFUseCase } from '../../application/use-cases';
import { GeneratePDFSchema, GenerateReportePDFSchema } from '../../application/dto';
import { PdfGenerationService } from '../../pdf-generation.service';
import type { GeneratedPDF } from '../../pdf-generation.service';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('PDF Generation')
@Controller('pdf')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PDFController {
  constructor(
    private readonly generatePDF: GeneratePDFUseCase,
    private readonly generateReportePDF: GenerateReportePDFUseCase,
    private readonly pdfService: PdfGenerationService,
  ) {}

  // =====================================================
  // ENDPOINTS DDD (Use Cases)
  // =====================================================

  @Post('generar')
  @Roles('admin', 'supervisor', 'tecnico')
  @ApiOperation({ summary: 'Generar PDF genérico' })
  async generate(@Body() body: unknown, @Req() req: any, @Res() res: Response) {
    const result = GeneratePDFSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());

    const pdfResult = await this.generatePDF.execute(result.data, req.user.id);

    // Read and send file
    const fileBuffer = fs.readFileSync(pdfResult.path);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfResult.filename}"`);
    res.send(fileBuffer);
  }

  @Post('reporte')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Generar reporte PDF' })
  async generateReporte(@Body() body: unknown, @Req() req: any, @Res() res: Response) {
    const result = GenerateReportePDFSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());

    const pdfResult = await this.generateReportePDF.execute(result.data, req.user.id);

    // Read and send file
    const fileBuffer = fs.readFileSync(pdfResult.path);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfResult.filename}"`);
    res.send(fileBuffer);
  }

  // =====================================================
  // ENDPOINTS ADICIONALES (Servicio directo)
  // =====================================================

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

  @Post('nativo/:ordenId')
  @ApiOperation({
    summary: 'Generar PDF nativo (sin Chromium)',
    description: 'Genera un PDF real usando PDFKit. Más ligero y rápido que HTML.'
  })
  generarPDFNativo(
    @Param('ordenId') ordenId: string,
    @Query('tipo') tipo: 'informe-tecnico' | 'acta-entrega' = 'informe-tecnico',
  ): Promise<GeneratedPDF> {
    return this.pdfService.generarPDFNativo(ordenId, tipo);
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
