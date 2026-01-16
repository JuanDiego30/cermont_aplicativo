import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import {
  GenerateCertificadoDto,
  GeneratePdfDto,
  GenerateReporteMantenimientoDto,
  GenerateReporteOrdenDto,
  PdfResponseDto,
} from '../../application/dto';
import {
  GenerateCertificadoInspeccionUseCase,
  GeneratePdfUseCase,
  GenerateReporteMantenimientoUseCase,
  GenerateReporteOrdenUseCase,
  GetPdfCachedUseCase,
} from '../../application/use-cases';

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
    private readonly getPdfCachedUseCase: GetPdfCachedUseCase
  ) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generar PDF desde HTML personalizado' })
  @ApiResponse({ status: 201, type: PdfResponseDto })
  async generatePdf(@Body() dto: GeneratePdfDto, @Res() res: Response) {
    const result = await this.generatePdfUseCase.execute(dto);
    this.sendPdfResponse(res, result);
  }

  @Post('order-report')
  @ApiOperation({ summary: 'Generate work order report' })
  @ApiResponse({ status: 201, type: PdfResponseDto })
  async generateReporteOrden(@Body() dto: GenerateReporteOrdenDto, @Res() res: Response) {
    const result = await this.generateReporteOrdenUseCase.execute(dto);
    this.sendPdfResponse(res, result);
  }

  @Post('maintenance-report')
  @ApiOperation({ summary: 'Generate maintenance report' })
  @ApiResponse({ status: 201, type: PdfResponseDto })
  async generateReporteMantenimiento(
    @Body() dto: GenerateReporteMantenimientoDto,
    @Res() res: Response
  ) {
    const result = await this.generateReporteMantenimientoUseCase.execute(dto);
    this.sendPdfResponse(res, result);
  }

  @Post('inspection-certificate')
  @ApiOperation({ summary: 'Generate inspection certificate' })
  @ApiResponse({ status: 201, type: PdfResponseDto })
  async generateCertificado(@Body() dto: GenerateCertificadoDto, @Res() res: Response) {
    const result = await this.generateCertificadoUseCase.execute(dto);
    this.sendPdfResponse(res, result);
  }

  @Get(':filename')
  @ApiOperation({ summary: 'Obtener PDF cacheado' })
  @ApiResponse({ status: 200, type: PdfResponseDto })
  async getPdf(@Param('filename') filename: string, @Res() res: Response) {
    const result = await this.getPdfCachedUseCase.execute(filename);
    this.sendPdfResponse(res, result, HttpStatus.OK);
  }

  private sendPdfResponse(
    res: Response,
    result: PdfResponseDto,
    status: HttpStatus = HttpStatus.CREATED
  ) {
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename=${result.filename}`);
    res.setHeader('Content-Length', result.size);
    res.status(status).send(Buffer.from(result.buffer, 'base64'));
  }
}
