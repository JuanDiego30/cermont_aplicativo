import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { GenerateReporteOrdenDto } from '../dto/generate-reporte-orden.dto';
import { PdfResponseDto } from '../dto/pdf-response.dto';
import { IPdfGenerator, PDF_GENERATOR } from '../../domain/interfaces/pdf-generator.interface';
import { OrdenTemplate } from '../../domain/templates/orden.template';
import { PrismaService } from '@/prisma/prisma.service';
import { PdfStorageService } from '../../infrastructure/services/pdf-storage.service';

@Injectable()
export class GenerateReporteOrdenUseCase {
    private readonly logger = new Logger(GenerateReporteOrdenUseCase.name);

    constructor(
        @Inject(PDF_GENERATOR)
        private readonly pdfGenerator: IPdfGenerator,
        private readonly prisma: PrismaService,
        private readonly storage: PdfStorageService,
    ) { }

    async execute(dto: GenerateReporteOrdenDto): Promise<PdfResponseDto> {
        try {
            this.logger.log(`Generando reporte de orden: ${dto.ordenId}`);

            // Obtener datos de la orden
            const orden = await this.prisma.order.findUnique({
                where: { id: dto.ordenId },
            });

            if (!orden) {
                throw new NotFoundException(`Orden no encontrada: ${dto.ordenId}`);
            }

            // Generar HTML desde template
            const html = OrdenTemplate.generate(orden);

            // Generar PDF
            const buffer = await this.pdfGenerator.generateFromHtml(html, {
                format: dto.pageSize,
                landscape: dto.orientation === 'landscape',
                printBackground: true,
            });

            const filename = `reporte-orden-${orden.numero}-${Date.now()}.pdf`;

            // Guardar en storage si es necesario
            let url: string | undefined;
            if (dto.incluirHistorial) {
                await this.storage.save(buffer, filename);
                url = this.storage.getPublicUrl(filename);
            }

            this.logger.log(`Reporte generado: ${filename}`);

            return {
                buffer: buffer.toString('base64'),
                filename,
                mimeType: 'application/pdf',
                size: buffer.length,
                url,
                generatedAt: new Date(),
            };
        } catch (error) {
            this.logger.error('Error generando reporte de orden', error);
            throw error;
        }
    }
}
