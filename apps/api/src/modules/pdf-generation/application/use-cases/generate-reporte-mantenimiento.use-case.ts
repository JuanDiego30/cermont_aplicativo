import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { GenerateReporteMantenimientoDto } from '../dto/generate-reporte-mantenimiento.dto';
import { PdfResponseDto } from '../dto/pdf-response.dto';
import { IPdfGenerator, PDF_GENERATOR } from '../../domain/interfaces/pdf-generator.interface';
import { MantenimientoTemplate } from '../../domain/templates/mantenimiento.template';
import { PrismaService } from '@/prisma/prisma.service';
import { PdfStorageService } from '../../infrastructure/services/pdf-storage.service';

@Injectable()
export class GenerateReporteMantenimientoUseCase {
    private readonly logger = new Logger(GenerateReporteMantenimientoUseCase.name);

    constructor(
        @Inject(PDF_GENERATOR)
        private readonly pdfGenerator: IPdfGenerator,
        private readonly prisma: PrismaService,
        private readonly storage: PdfStorageService,
    ) { }

    async execute(dto: GenerateReporteMantenimientoDto): Promise<PdfResponseDto> {
        try {
            this.logger.log(`Generando reporte de mantenimiento: ${dto.mantenimientoId}`);

            const mantenimiento = await this.prisma.mantenimiento.findUnique({
                where: { id: dto.mantenimientoId },
                include: {
                    tecnico: dto.incluirTecnico,
                    // Add other relations as needed based on schema
                },
            });

            if (!mantenimiento) {
                throw new NotFoundException(`Mantenimiento no encontrado: ${dto.mantenimientoId}`);
            }

            const html = MantenimientoTemplate.generate(mantenimiento);

            const buffer = await this.pdfGenerator.generateFromHtml(html, {
                format: dto.pageSize,
                landscape: dto.orientation === 'landscape',
                printBackground: true,
            });

            const filename = `reporte-mantenimiento-${mantenimiento.titulo.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}-${Date.now()}.pdf`;

            let url: string | undefined;
            // Logic for saving can be added if needed, e.g. based on a dto flag or always
            // For now, let's not auto-save unless requested or configured.
            // Assuming we might want to save if it's "completed" but DTO doesn't have that flag explicitly.
            // We'll follow the pattern and return buffer.

            return {
                buffer: buffer.toString('base64'),
                filename,
                mimeType: 'application/pdf',
                size: buffer.length,
                url,
                generatedAt: new Date(),
            };
        } catch (error) {
            this.logger.error('Error generando reporte de mantenimiento', error);
            throw error;
        }
    }
}
