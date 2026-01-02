import { Injectable, Logger, Inject } from '@nestjs/common';
import { createHash } from 'crypto';
import { GeneratePdfDto } from '../dto/generate-pdf.dto';
import { PdfResponseDto } from '../dto/pdf-response.dto';
import { IPdfGenerator, PDF_GENERATOR } from '../../domain/interfaces/pdf-generator.interface';
import { PdfStorageService } from '../../infrastructure/services/pdf-storage.service';
import { PdfGenerationQueueService } from '../../infrastructure/services/pdf-generation-queue.service';

@Injectable()
export class GeneratePdfUseCase {
  private readonly logger = new Logger(GeneratePdfUseCase.name);

  constructor(
    @Inject(PDF_GENERATOR)
    private readonly pdfGenerator: IPdfGenerator,
    private readonly storage: PdfStorageService,
    private readonly queue: PdfGenerationQueueService,
  ) { }

  async execute(dto: GeneratePdfDto): Promise<PdfResponseDto> {
    try {
      this.logger.log('Generando PDF desde HTML personalizado');

      const generatorOptions = {
        format: dto.pageSize,
        landscape: dto.orientation === 'landscape',
        displayHeaderFooter: dto.displayHeaderFooter,
        headerTemplate: dto.headerTemplate,
        footerTemplate: dto.footerTemplate,
        margin: dto.margin,
      };

      // Caching conservador (solo si se guarda en storage y no se forzó un filename)
      if (dto.saveToStorage && dto.enableCache !== false && !dto.filename) {
        const cacheKey = createHash('sha256')
          .update(
            JSON.stringify({
              html: dto.html,
              options: generatorOptions,
            }),
          )
          .digest('hex')
          .slice(0, 16);

        const cachedFilename = `custom-pdf-${cacheKey}.pdf`;
        const cached = await this.storage.getCached(cachedFilename);
        if (cached) {
          return {
            buffer: cached.toString('base64'),
            filename: cachedFilename,
            mimeType: 'application/pdf',
            size: cached.length,
            url: this.storage.getPublicUrl(cachedFilename),
            generatedAt: new Date(),
          };
        }

        const buffer = await this.queue.enqueue(() =>
          this.pdfGenerator.generateFromHtml(dto.html, generatorOptions),
        );
        await this.storage.save(buffer, cachedFilename);

        return {
          buffer: buffer.toString('base64'),
          filename: cachedFilename,
          mimeType: 'application/pdf',
          size: buffer.length,
          url: this.storage.getPublicUrl(cachedFilename),
          generatedAt: new Date(),
        };
      }

      const buffer = await this.queue.enqueue(() =>
        this.pdfGenerator.generateFromHtml(dto.html, generatorOptions),
      );

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
