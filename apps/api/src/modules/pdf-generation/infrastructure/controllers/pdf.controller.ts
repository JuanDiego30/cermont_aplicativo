import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  UseGuards,
  Get,
  Param,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import {
  GeneratePdfUseCase,
  GenerateReporteOrdenUseCase,
  GenerateReporteMantenimientoUseCase,
  GenerateCertificadoInspeccionUseCase,
  GetPdfCachedUseCase,
} from '../../application/use-cases';
import {
  GeneratePdfDto,
  GenerateReporteOrdenDto,
  GenerateReporteMantenimientoDto,
  GenerateCertificadoDto,
  PdfResponseDto,
} from '../../application/dto';

@ApiTags('PDF Generation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pdf')
export class PdfController {
  private readonly logger = new Logger(PdfController.name);

  constructor(
    private readonly generatePdfUseCase: GeneratePdfUseCase,
    private readonly generateReporteOrdenUseCase: GenerateReporteOrdenUseCase,
    private readonly generateReporteMantenimientoUseCase: GenerateReporteMantenimientoUseCase,
    private readonly generateCertificadoUseCase: GenerateCertificadoInspeccionUseCase,
    private readonly getPdfCachedUseCase: GetPdfCachedUseCase,
  ) { }

  @Post('generate')
  @ApiOperation({ summary: 'Generar PDF desde HTML personalizado' })
  @ApiResponse({ status: 201, type: PdfResponseDto })
  async generatePdf(@Body() dto: GeneratePdfDto, @Res() res: Response) {
    const result = await this.generatePdfUseCase.execute(dto);
    this.sendPdfResponse(res, result);
  }

  @Post('reporte-orden')
  @ApiOperation({ summary: 'Generar reporte de orden de trabajo' })
  @ApiResponse({ status: 201, type: PdfResponseDto })
  async generateReporteOrden(
    @Body() dto: GenerateReporteOrdenDto,
    @Res() res: Response,
  ) {
    const result = await this.generateReporteOrdenUseCase.execute(dto);
    this.sendPdfResponse(res, result);
  }

  @Post('reporte-mantenimiento')
  @ApiOperation({ summary: 'Generar reporte de mantenimiento' })
  @ApiResponse({ status: 201, type: PdfResponseDto })
  async generateReporteMantenimiento(
    @Body() dto: GenerateReporteMantenimientoDto,
    @Res() res: Response,
  ) {
    const result = await this.generateReporteMantenimientoUseCase.execute(dto);
    this.sendPdfResponse(res, result);
  }

  @Post('certificado-inspeccion')
  @ApiOperation({ summary: 'Generar certificado de inspección' })
  @ApiResponse({ status: 201, type: PdfResponseDto })
  async generateCertificado(
    @Body() dto: GenerateCertificadoDto,
    @Res() res: Response,
  ) {
    const result = await this.generateCertificadoUseCase.execute(dto);
    this.sendPdfResponse(res, result);
  }

  @Get(':filename')
  @ApiOperation({ summary: 'Obtener PDF cacheado' })
  @ApiResponse({ status: 200, type: PdfResponseDto })
  async getPdf(@Param('filename') filename: string, @Res() res: Response) {
    const result = await this.getPdfCachedUseCase.execute(filename);
    this.sendPdfResponse(res, result);
  }

  private sendPdfResponse(res: Response, result: PdfResponseDto) {
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${result.filename}`,
    );
    res.setHeader('Content-Length', result.size);
    res.status(HttpStatus.CREATED).send(Buffer.from(result.buffer, 'base64'));
  }
}
