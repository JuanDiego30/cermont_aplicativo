import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { createHash } from 'crypto';
import { GenerateReporteOrdenDto } from '../dto/generate-reporte-orden.dto';
import { PdfResponseDto } from '../dto/pdf-response.dto';
import { IPdfGenerator, PDF_GENERATOR } from '../../domain/interfaces/pdf-generator.interface';
import { OrdenTemplate } from '../../domain/templates/orden.template';
import { PrismaService } from '@/prisma/prisma.service';
import { PdfStorageService } from '../../infrastructure/services/pdf-storage.service';
import { PdfGenerationQueueService } from '../../infrastructure/services/pdf-generation-queue.service';

@Injectable()
export class GenerateReporteOrdenUseCase {
    private readonly logger = new Logger(GenerateReporteOrdenUseCase.name);

    constructor(
        @Inject(PDF_GENERATOR)
        private readonly pdfGenerator: IPdfGenerator,
        private readonly prisma: PrismaService,
        private readonly storage: PdfStorageService,
        private readonly queue: PdfGenerationQueueService,
    ) { }

    async execute(dto: GenerateReporteOrdenDto): Promise<PdfResponseDto> {
        try {
            this.logger.log(`Generando reporte de orden: ${dto.ordenId}`);

            // Obtener datos de la orden
            const include: Record<string, boolean> = {};
            if (dto.incluirTecnico) include.asignado = true;
            if (dto.incluirEvidencias) include.evidencias = true;
            if (dto.incluirHistorial) include.stateHistory = true;
            if (dto.incluirLineasVida || dto.incluirEquipos) include.items = true;

            const orden = await this.prisma.order.findUnique({
                where: { id: dto.ordenId },
                ...(Object.keys(include).length ? { include } : {}),
            });

            if (!orden) {
                throw new NotFoundException(`Orden no encontrada: ${dto.ordenId}`);
            }

            const templateData: any = {
                ...orden,
                // Normalización para el template (mantiene compatibilidad con keys "cliente" y "tecnico")
                cliente: dto.incluirCliente
                    ? {
                        nombre: (orden as any).cliente,
                        contacto: (orden as any).contactoCliente,
                        telefono: (orden as any).telefonoCliente,
                        direccion: (orden as any).direccion,
                    }
                    : undefined,
                tecnico: dto.incluirTecnico
                    ? (orden as any).asignado
                        ? {
                            nombre: (orden as any).asignado.name,
                            email: (orden as any).asignado.email,
                        }
                        : undefined
                    : undefined,
            };

            // Generar HTML desde template
            const html = OrdenTemplate.generate(templateData);

            // Persistencia y caché (compat: antes se guardaba cuando incluirHistorial=true)
            const shouldPersist = dto.saveToStorage ?? dto.incluirHistorial ?? false;
            const enableCache = dto.enableCache !== false;

            let filename = `reporte-orden-${(orden as any).numero}-${Date.now()}.pdf`;
            let url: string | undefined;

            if (shouldPersist && enableCache) {
                const cacheKey = createHash('sha256')
                    .update(
                        JSON.stringify({
                            ordenId: (orden as any).id,
                            updatedAt: (orden as any).updatedAt,
                            incluirCliente: dto.incluirCliente,
                            incluirTecnico: dto.incluirTecnico,
                            incluirLineasVida: dto.incluirLineasVida,
                            incluirEquipos: dto.incluirEquipos,
                            incluirEvidencias: dto.incluirEvidencias,
                            incluirHistorial: dto.incluirHistorial,
                            pageSize: dto.pageSize,
                            orientation: dto.orientation,
                        }),
                    )
                    .digest('hex')
                    .slice(0, 16);

                filename = `reporte-orden-${(orden as any).numero}-${cacheKey}.pdf`;

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

            // Generar PDF (solo si no estaba cacheado)
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
