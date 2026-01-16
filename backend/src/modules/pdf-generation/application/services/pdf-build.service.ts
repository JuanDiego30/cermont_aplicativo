import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import type { PdfResponseDto } from '../dto/pdf-response.dto';
import type {
  IPdfGenerator,
  IPdfGeneratorOptions,
} from '../../domain/interfaces/pdf-generator.interface';
import { PDF_GENERATOR } from '../../domain/interfaces/pdf-generator.interface';
import { PdfStorageService } from '../../infrastructure/services/pdf-storage.service';
import { PdfGenerationQueueService } from '../../infrastructure/services/pdf-generation-queue.service';

export interface PdfBuildRequest {
  html: string;
  generatorOptions: IPdfGeneratorOptions;
  shouldPersist: boolean;
  enableCache: boolean;
  filenameOnNoCache: string;
  cachePayload?: unknown;
  filenameOnCache?: (cacheKey: string) => string;
}

@Injectable()
export class PdfBuildService {
  constructor(
    @Inject(PDF_GENERATOR)
    private readonly pdfGenerator: IPdfGenerator,
    private readonly storage: PdfStorageService,
    private readonly queue: PdfGenerationQueueService
  ) {}

  async buildPdf(dto: PdfBuildRequest): Promise<PdfResponseDto> {
    let filename = dto.filenameOnNoCache;
    let url: string | undefined;

    if (dto.shouldPersist && dto.enableCache && dto.cachePayload && dto.filenameOnCache) {
      const cacheKey = createHash('sha256')
        .update(JSON.stringify(dto.cachePayload))
        .digest('hex')
        .slice(0, 16);

      filename = dto.filenameOnCache(cacheKey);

      const cached = await this.storage.getCached(filename);
      if (cached) {
        return this.toResponse(cached, filename, this.storage.getPublicUrl(filename));
      }
    }

    const buffer = await this.queue.enqueue(() =>
      this.pdfGenerator.generateFromHtml(dto.html, dto.generatorOptions)
    );

    if (dto.shouldPersist) {
      await this.storage.save(buffer, filename);
      url = this.storage.getPublicUrl(filename);
    }

    return this.toResponse(buffer, filename, url);
  }

  private toResponse(buffer: Buffer, filename: string, url?: string): PdfResponseDto {
    return {
      buffer: buffer.toString('base64'),
      filename,
      mimeType: 'application/pdf',
      size: buffer.length,
      url,
      generatedAt: new Date(),
    };
  }
}
