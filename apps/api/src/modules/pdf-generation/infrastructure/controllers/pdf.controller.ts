/**
 * @controller PDFController
 */
import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { GeneratePDFUseCase, GenerateReportePDFUseCase } from '../../application/use-cases';
import { GeneratePDFSchema, GenerateReportePDFSchema } from '../../application/dto';
import * as fs from 'fs';

@Controller('pdf')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PDFController {
  constructor(
    private readonly generatePDF: GeneratePDFUseCase,
    private readonly generateReportePDF: GenerateReportePDFUseCase,
  ) {}

  @Post('generar')
  @Roles('admin', 'supervisor', 'tecnico')
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
}
