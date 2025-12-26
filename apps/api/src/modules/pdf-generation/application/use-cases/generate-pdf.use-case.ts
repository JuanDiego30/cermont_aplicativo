import { Injectable, Logger, Inject } from '@nestjs/common';
import { GeneratePdfDto } from '../dto/generate-pdf.dto';
import { PdfResponseDto } from '../dto/pdf-response.dto';
import { IPdfGenerator, PDF_GENERATOR } from '../../domain/interfaces/pdf-generator.interface';
import { PdfStorageService } from '../../infrastructure/services/pdf-storage.service';

@Injectable()
export class GeneratePdfUseCase {
  private readonly logger = new Logger(GeneratePdfUseCase.name);

  constructor(
    @Inject(PDF_GENERATOR)
    private readonly pdfGenerator: IPdfGenerator,
    private readonly storage: PdfStorageService,
  ) { }

  async execute(dto: GeneratePdfDto): Promise<PdfResponseDto> {
    try {
      this.logger.log('Generando PDF desde HTML personalizado');

      const buffer = await this.pdfGenerator.generateFromHtml(dto.html, {
        format: dto.pageSize,
        landscape: dto.orientation === 'landscape',
        displayHeaderFooter: dto.displayHeaderFooter,
        headerTemplate: dto.headerTemplate,
        footerTemplate: dto.footerTemplate,
        margin: dto.margin,
      });

      const filename = dto.filename
        ? `${dto.filename}.pdf`
        : `custom-pdf-${Date.now()}.pdf`;

      let url: string | undefined;
      if (dto.saveToStorage) {
        await this.storage.save(buffer, filename);
        url = this.storage.getPublicUrl(filename);
      }

      return {
        buffer: buffer.toString('base64'),
        filename,
        mimeType: 'application/pdf',
        size: buffer.length,
        url,
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Error generando PDF personalizado', error);
      throw error;
    }
  }
}
