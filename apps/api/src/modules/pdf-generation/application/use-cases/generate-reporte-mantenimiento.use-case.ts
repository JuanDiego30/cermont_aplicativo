import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { createHash } from 'crypto';
import { GenerateReporteMantenimientoDto } from '../dto/generate-reporte-mantenimiento.dto';
import { PdfResponseDto } from '../dto/pdf-response.dto';
import { IPdfGenerator, PDF_GENERATOR } from '../../domain/interfaces/pdf-generator.interface';
import { MantenimientoTemplate } from '../../domain/templates/mantenimiento.template';
import { PrismaService } from '@/prisma/prisma.service';
import { PdfStorageService } from '../../infrastructure/services/pdf-storage.service';
import { PdfGenerationQueueService } from '../../infrastructure/services/pdf-generation-queue.service';

@Injectable()
export class GenerateReporteMantenimientoUseCase {
    private readonly logger = new Logger(GenerateReporteMantenimientoUseCase.name);

    constructor(
        @Inject(PDF_GENERATOR)
        private readonly pdfGenerator: IPdfGenerator,
        private readonly prisma: PrismaService,
        private readonly storage: PdfStorageService,
        private readonly queue: PdfGenerationQueueService,
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

            const templateData: any = {
                ...mantenimiento,
                tecnico: dto.incluirTecnico
                    ? (mantenimiento as any).tecnico
                        ? {
                            nombre: (mantenimiento as any).tecnico.name,
                            email: (mantenimiento as any).tecnico.email,
                        }
                        : undefined
                    : undefined,
            };

            const html = MantenimientoTemplate.generate(templateData);

            const shouldPersist = dto.saveToStorage ?? false;
            const enableCache = dto.enableCache !== false;

            const baseSlug = String((mantenimiento as any).titulo || 'mantenimiento')
                .substring(0, 20)
                .replace(/[^a-z0-9]/gi, '_');

            let filename = `reporte-mantenimiento-${baseSlug}-${Date.now()}.pdf`;
            let url: string | undefined;

            if (shouldPersist && enableCache) {
                const cacheKey = createHash('sha256')
                    .update(
                        JSON.stringify({
                            mantenimientoId: (mantenimiento as any).id,
                            updatedAt: (mantenimiento as any).updatedAt,
                            incluirActivo: dto.incluirActivo,
                            incluirTecnico: dto.incluirTecnico,
                            incluirTareas: dto.incluirTareas,
                            incluirProblemas: dto.incluirProblemas,
                            incluirRepuestos: dto.incluirRepuestos,
                            incluirRecomendaciones: dto.incluirRecomendaciones,
                            incluirEvidencias: dto.incluirEvidencias,
                            pageSize: dto.pageSize,
                            orientation: dto.orientation,
                        }),
                    )
                    .digest('hex')
                    .slice(0, 16);

                filename = `reporte-mantenimiento-${baseSlug}-${cacheKey}.pdf`;

                const cached = await this.storage.getCached(filename);
                if (cached) {
                    return {
                        buffer: cached.toString('base64'),
                        filename,
                        mimeType: 'application/pdf',
                        size: cached.length,
                        url: this.storage.getPublicUrl(filename),
                        generatedAt: new Date(),
                    };
                }
            }

            const buffer = await this.queue.enqueue(() =>
                this.pdfGenerator.generateFromHtml(html, {
                    format: dto.pageSize,
                    landscape: dto.orientation === 'landscape',
                    printBackground: true,
                }),
            );

            if (shouldPersist) {
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
            this.logger.error('Error generando reporte de mantenimiento', error);
            throw error;
        }
    }
}
