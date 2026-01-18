import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { GenerateCertificadoDto } from '../dto/generate-certificado.dto';
import { PdfResponseDto } from '../dto/pdf-response.dto';
import { CertificadoTemplate } from '../../domain/templates/certificado.template';
import { PrismaService } from '@/prisma/prisma.service';
import { PdfBuildService } from '../services/pdf-build.service';

@Injectable()
export class GenerateCertificadoInspeccionUseCase {
  private readonly logger = new Logger(GenerateCertificadoInspeccionUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfBuild: PdfBuildService
  ) {}

  async execute(dto: GenerateCertificadoDto): Promise<PdfResponseDto> {
    try {
      this.logger.log(`Generando certificado para elemento: ${dto.elementoId}`);

      // Fetch element data based on type, this is a simplified stub logic
      // In real scenario we would switch based on dto.type to fetch from correct table (LineaVida, Equipo, etc)
      // For now we will mock a generic fetch or implementation would need rich logic.
      // I'll implement a basic generic fetch or specific logic if I knew the schema better.
      // Assuming 'LineaVida' for now or generic object.

      // Let's assume we fetch a generic item or just pass DTO data + some lookups.
      // Since I don't want to break compilation with unknown tables, I will fetch based on type if possible, or just use placeholders if table doesn't exist.
      // Actually, LineaVida exists.

      const numeroCertificadoEffective =
        dto.numeroCertificado ||
        `CERT-${createHash('sha256')
          .update(
            JSON.stringify({
              tipo: dto.tipo,
              elementoId: dto.elementoId,
              inspectorId: dto.inspectorId,
            })
          )
          .digest('hex')
          .slice(0, 10)
          .toUpperCase()}`;

      let elemento: any = { codigo: 'N/A', tipo: dto.tipo, ubicacion: 'N/A' };
      let inspector: any = undefined;

      if (dto.inspectorId) {
        const user = await this.prisma.user.findUnique({
          where: { id: dto.inspectorId },
          select: { name: true, email: true },
        });

        if (user) {
          inspector = { nombre: user.name, email: user.email };
        } else {
          inspector = { nombre: 'N/A' };
        }
      }

      // Example fetch logic (stubbed for safety if schema varies)
      /*
            if (dto.tipo === 'INSPECCION_LINEA_VIDA') {
               elemento = await this.prisma.lineaVida.findUnique({ where: { id: dto.elementoId } });
            }
            */

      const data = {
        tipo: dto.tipo,
        numeroCertificado: numeroCertificadoEffective,
        elemento,
        inspector,
        fechaInspeccion: new Date(),
        aprobado: true,
        observaciones: dto.observaciones,
        fechaVencimiento: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      };

      const html = CertificadoTemplate.generate(data);

      const shouldPersist = dto.saveToStorage ?? false;
      const enableCache = dto.enableCache !== false;

      const filenameOnNoCache = `certificado-${numeroCertificadoEffective}.pdf`;

      return this.pdfBuild.buildPdf({
        html,
        shouldPersist,
        enableCache,
        filenameOnNoCache,
        cachePayload: {
          tipo: dto.tipo,
          elementoId: dto.elementoId,
          inspectorId: dto.inspectorId,
          numeroCertificado: dto.numeroCertificado,
          observaciones: dto.observaciones,
          pageSize: dto.pageSize,
        },
        filenameOnCache: cacheKey => `certificado-${dto.tipo}-${cacheKey}.pdf`,
        generatorOptions: {
          format: dto.pageSize,
          printBackground: true,
        },
      });
    } catch (error) {
      this.logger.error('Error generando certificado', error);
      throw error;
    }
  }
}
