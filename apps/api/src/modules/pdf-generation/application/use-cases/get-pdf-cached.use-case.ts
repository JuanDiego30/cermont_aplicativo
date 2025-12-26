import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PdfStorageService } from '../../infrastructure/services/pdf-storage.service';
import { PdfResponseDto } from '../dto/pdf-response.dto';

@Injectable()
export class GetPdfCachedUseCase {
    private readonly logger = new Logger(GetPdfCachedUseCase.name);

    constructor(private readonly storage: PdfStorageService) { }

    async execute(filename: string): Promise<PdfResponseDto> {
        try {
            const buffer = await this.storage.get(filename);

            if (!buffer) {
                throw new NotFoundException(`PDF no encontrado en caché: ${filename}`);
            }

            return {
                buffer: buffer.toString('base64'),
                filename,
                mimeType: 'application/pdf',
                size: buffer.length,
                url: this.storage.getPublicUrl(filename),
                generatedAt: new Date(), // We don't track file creation time in this simple storage service yet
            };
        } catch (error) {
            this.logger.error('Error recuperando PDF de caché', error);
            throw error;
        }
    }
}
