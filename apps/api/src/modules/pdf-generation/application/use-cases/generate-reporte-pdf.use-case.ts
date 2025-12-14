/**
 * @useCase GenerateReportePDFUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fs from 'fs';
import * as path from 'path';
import {
  PDF_SERVICE,
  IPDFService,
  PDF_REPOSITORY,
  IPDFRepository,
  GenerateReportePDFDto,
  PDFResult,
} from '../dto';

const UPLOAD_DIR = './uploads/pdfs';

@Injectable()
export class GenerateReportePDFUseCase {
  constructor(
    @Inject(PDF_SERVICE)
    private readonly pdfService: IPDFService,
    @Inject(PDF_REPOSITORY)
    private readonly repo: IPDFRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: GenerateReportePDFDto, userId: string): Promise<PDFResult> {
    const data = await this.repo.getReporteData(
      dto.tipoReporte,
      dto.fechaInicio,
      dto.fechaFin,
      dto.filtros,
    );

    // Generate PDF
    const templateName = `reporte_${dto.tipoReporte}`;
    const pdfBuffer = await this.pdfService.generateFromTemplate(templateName, {
      ...data,
      fechaInicio: dto.fechaInicio,
      fechaFin: dto.fechaFin,
      generadoPor: userId,
      fechaGeneracion: new Date().toISOString(),
    });

    // Ensure directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    // Save file
    const filename = `reporte_${dto.tipoReporte}_${Date.now()}.pdf`;
    const filepath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(filepath, pdfBuffer);

    // Record in database
    await this.repo.savePDFRecord(filename, filepath, 'reporte', dto.tipoReporte, userId);

    this.eventEmitter.emit('pdf.reporte-generado', {
      filename,
      tipoReporte: dto.tipoReporte,
      userId,
    });

    return {
      filename,
      path: filepath,
      size: pdfBuffer.length,
      mimeType: 'application/pdf',
      generatedAt: new Date().toISOString(),
    };
  }
}
