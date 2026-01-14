import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { GenerateReporteMantenimientoDto } from "../dto/generate-reporte-mantenimiento.dto";
import { PdfResponseDto } from "../dto/pdf-response.dto";
import {
  MantenimientoTemplate,
  type MantenimientoPDFData,
} from "../../domain/templates/mantenimiento.template";
import { PrismaService } from "@/prisma/prisma.service";
import { PdfBuildService } from "../services/pdf-build.service";

@Injectable()
export class GenerateReporteMantenimientoUseCase {
  private readonly logger = new Logger(
    GenerateReporteMantenimientoUseCase.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfBuild: PdfBuildService,
  ) {}

  async execute(dto: GenerateReporteMantenimientoDto): Promise<PdfResponseDto> {
    try {
      this.logger.log(
        `Generando reporte de mantenimiento: ${dto.mantenimientoId}`,
      );

      const mantenimiento = await this.prisma.mantenimiento.findUnique({
        where: { id: dto.mantenimientoId },
        include: {
          tecnico: dto.incluirTecnico,
          // Add other relations as needed based on schema
        },
      });

      if (!mantenimiento) {
        throw new NotFoundException(
          `Mantenimiento no encontrado: ${dto.mantenimientoId}`,
        );
      }

      const templateData: MantenimientoPDFData = {
        ...(mantenimiento as unknown as MantenimientoPDFData),
        tecnico: dto.incluirTecnico
          ? (mantenimiento as { tecnico?: { name?: string; email?: string } })
              .tecnico
            ? {
                nombre:
                  (
                    mantenimiento as {
                      tecnico?: { name?: string; email?: string };
                    }
                  ).tecnico?.name ?? "",
                email: (
                  mantenimiento as {
                    tecnico?: { name?: string; email?: string };
                  }
                ).tecnico?.email,
              }
            : undefined
          : undefined,
      };

      const html = MantenimientoTemplate.generate(templateData);

      const shouldPersist = dto.saveToStorage ?? false;
      const enableCache = dto.enableCache !== false;

      const baseSlug = String(
        (mantenimiento as { titulo?: unknown }).titulo || "mantenimiento",
      )
        .substring(0, 20)
        .replace(/[^a-z0-9]/gi, "_");

      const filenameOnNoCache = `reporte-mantenimiento-${baseSlug}-${Date.now()}.pdf`;

      return this.pdfBuild.buildPdf({
        html,
        shouldPersist,
        enableCache,
        filenameOnNoCache,
        cachePayload: {
          mantenimientoId: (mantenimiento as { id?: unknown }).id,
          updatedAt: (mantenimiento as { updatedAt?: unknown }).updatedAt,
          incluirActivo: dto.incluirActivo,
          incluirTecnico: dto.incluirTecnico,
          incluirTareas: dto.incluirTareas,
          incluirProblemas: dto.incluirProblemas,
          incluirRepuestos: dto.incluirRepuestos,
          incluirRecomendaciones: dto.incluirRecomendaciones,
          incluirEvidencias: dto.incluirEvidencias,
          pageSize: dto.pageSize,
          orientation: dto.orientation,
        },
        filenameOnCache: (cacheKey) =>
          `reporte-mantenimiento-${baseSlug}-${cacheKey}.pdf`,
        generatorOptions: {
          format: dto.pageSize,
          landscape: dto.orientation === "landscape",
          printBackground: true,
        },
      });
    } catch (error) {
      this.logger.error("Error generando reporte de mantenimiento", error);
      throw error;
    }
  }
}
