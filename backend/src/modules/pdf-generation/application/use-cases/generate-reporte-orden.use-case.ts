import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { GenerateReporteOrdenDto } from '../dto/generate-reporte-orden.dto';
import { PdfResponseDto } from '../dto/pdf-response.dto';
import { OrdenTemplate, type OrdenPDFData } from '../../domain/templates/orden.template';
import { PrismaService } from '@/prisma/prisma.service';
import { PdfBuildService } from '../services/pdf-build.service';

@Injectable()
export class GenerateReporteOrdenUseCase {
  private readonly logger = new Logger(GenerateReporteOrdenUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfBuild: PdfBuildService
  ) {}

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

      const templateData: OrdenPDFData = {
        ...(orden as unknown as OrdenPDFData),
        // Normalización para el template (mantiene compatibilidad con keys "cliente" y "tecnico")
        cliente: dto.incluirCliente
          ? {
              nombre: String((orden as { cliente?: unknown }).cliente ?? ''),
              contacto: String((orden as { contactoCliente?: unknown }).contactoCliente ?? ''),
              telefono: String((orden as { telefonoCliente?: unknown }).telefonoCliente ?? ''),
              direccion: String((orden as { direccion?: unknown }).direccion ?? ''),
            }
          : undefined,
        tecnico: dto.incluirTecnico
          ? (orden as { asignado?: { name?: string; email?: string } }).asignado
            ? {
                nombre: (orden as { asignado?: { name?: string; email?: string } }).asignado?.name,
                email: (orden as { asignado?: { name?: string; email?: string } }).asignado?.email,
              }
            : undefined
          : undefined,
      };

      const html = OrdenTemplate.generate(templateData);

      // Persistencia y caché (compat: antes se guardaba cuando incluirHistorial=true)
      const shouldPersist = dto.saveToStorage ?? dto.incluirHistorial ?? false;
      const enableCache = dto.enableCache !== false;

      const numeroOrden = String((orden as { numero?: unknown }).numero ?? 'orden');
      const filenameOnNoCache = `reporte-orden-${numeroOrden}-${Date.now()}.pdf`;

      const response = await this.pdfBuild.buildPdf({
        html,
        shouldPersist,
        enableCache,
        filenameOnNoCache,
        cachePayload: {
          ordenId: (orden as { id?: unknown }).id,
          updatedAt: (orden as { updatedAt?: unknown }).updatedAt,
          incluirCliente: dto.incluirCliente,
          incluirTecnico: dto.incluirTecnico,
          incluirLineasVida: dto.incluirLineasVida,
          incluirEquipos: dto.incluirEquipos,
          incluirEvidencias: dto.incluirEvidencias,
          incluirHistorial: dto.incluirHistorial,
          pageSize: dto.pageSize,
          orientation: dto.orientation,
        },
        filenameOnCache: cacheKey => `reporte-orden-${numeroOrden}-${cacheKey}.pdf`,
        generatorOptions: {
          format: dto.pageSize,
          landscape: dto.orientation === 'landscape',
          printBackground: true,
        },
      });

      this.logger.log(`Reporte generado: ${response.filename}`);
      return response;
    } catch (error) {
      this.logger.error('Error generando reporte de orden', error);
      throw error;
    }
  }
}
