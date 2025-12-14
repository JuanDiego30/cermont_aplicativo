/**
 * @useCase GeneratePDFUseCase
 */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fs from 'fs';
import * as path from 'path';
import {
  PDF_SERVICE,
  IPDFService,
  PDF_REPOSITORY,
  IPDFRepository,
  GeneratePDFDto,
  PDFResult,
} from '../dto';

const UPLOAD_DIR = './uploads/pdfs';

@Injectable()
export class GeneratePDFUseCase {
  constructor(
    @Inject(PDF_SERVICE)
    private readonly pdfService: IPDFService,
    @Inject(PDF_REPOSITORY)
    private readonly repo: IPDFRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: GeneratePDFDto, userId: string): Promise<PDFResult> {
    // Get data based on template type
    let data: Record<string, unknown>;
    switch (dto.templateType) {
      case 'orden_trabajo':
      case 'reporte_ejecucion':
      case 'acta_entrega':
        data = await this.repo.getOrdenData(dto.entityId);
        break;
      case 'inspeccion_hes':
        data = await this.repo.getHESData(dto.entityId);
        break;
      case 'inspeccion_linea_vida':
        data = await this.repo.getLineaVidaData(dto.entityId);
        break;
      case 'checklist':
        data = await this.repo.getChecklistData(dto.entityId);
        break;
      default:
        throw new NotFoundException(`Template ${dto.templateType} no encontrado`);
    }

    if (!data) {
      throw new NotFoundException('Entidad no encontrada para generar PDF');
    }

    // Add options to data
    data.options = dto.options || {};

    // Generate PDF
    const pdfBuffer = await this.pdfService.generateFromTemplate(dto.templateType, data);

    // Ensure directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    // Save file
    const filename = `${dto.templateType}_${dto.entityId}_${Date.now()}.pdf`;
    const filepath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(filepath, pdfBuffer);

    // Record in database
    await this.repo.savePDFRecord(filename, filepath, dto.templateType, dto.entityId, userId);

    this.eventEmitter.emit('pdf.generated', {
      filename,
      templateType: dto.templateType,
      entityId: dto.entityId,
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
