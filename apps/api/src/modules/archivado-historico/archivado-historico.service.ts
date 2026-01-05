import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  ArchivarManualDto,
  ExportarHistoricoDto,
  ConsultarHistoricoDto,
  OrdenArchivadaResponseDto,
  ResultadoArchivadoDto,
  ResultadoExportacionDto,
  EstadisticasArchivoDto,
  TipoExportacion,
} from "./application/dto/archivado-historico.dto";
import * as fs from "fs";
import * as path from "path";

/**
 * ArchivadoHistoricoService
 *
 * NOTE: This service works with the existing Prisma schema.
 * Orders are "archived" by setting estado='completada' and adding metadata.
 * For full archiving support, consider adding these fields to Order model:
 * - archivada: Boolean
 * - fechaArchivado: DateTime
 * - motivoArchivado: String
 */
@Injectable()
export class ArchivadoHistoricoService {
  private readonly logger = new Logger(ArchivadoHistoricoService.name);
  private readonly DIAS_PARA_ARCHIVAR = 30;
  private readonly EXPORT_DIR = path.join(process.cwd(), "archivos", "exports");

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    // Ensure export directory exists
    if (!fs.existsSync(this.EXPORT_DIR)) {
      fs.mkdirSync(this.EXPORT_DIR, { recursive: true });
    }
  }

  /**
   * Archivar órdenes automáticamente
   * Uses existing schema: looks for completada orders older than 30 days
   */
  async archivarAutomatico(): Promise<ResultadoArchivadoDto> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - this.DIAS_PARA_ARCHIVAR);

    this.logger.log(
      `Iniciando archivado automático para órdenes anteriores a ${fechaLimite.toISOString()}`,
    );

    // Get orders to archive (completed more than 30 days ago)
    const ordenesParaArchivar = await this.prisma.order.findMany({
      where: {
        estado: "completada",
        fechaFin: { lte: fechaLimite },
        // Using observaciones to track archived status
        NOT: { observaciones: { contains: "[ARCHIVADA]" } },
      },
      select: { id: true, numero: true },
    });

    let archivadas = 0;
    let omitidas = 0;
    const errores: string[] = [];

    for (const orden of ordenesParaArchivar) {
      try {
        await this.marcarComoArchivada(orden.id);
        archivadas++;
      } catch (error) {
        omitidas++;
        const mensaje =
          error instanceof Error ? error.message : "Error desconocido";
        errores.push(`Orden ${orden.numero}: ${mensaje}`);
        this.logger.error(`Error archivando orden ${orden.numero}:`, error);
      }
    }

    const proximoArchivado = this.calcularProximoArchivado();

    this.logger.log(
      `Archivado completado: ${archivadas} archivadas, ${omitidas} omitidas`,
    );

    this.eventEmitter.emit("archivado.automatico.completado", {
      archivadas,
      omitidas,
      errores,
    });

    return {
      exito: errores.length === 0,
      ordenesArchivadas: archivadas,
      ordenesOmitidas: omitidas,
      errores,
      fechaEjecucion: new Date().toISOString(),
      proximoArchivado: proximoArchivado.toISOString(),
    };
  }

  /**
   * Mark order as archived using observaciones field
   */
  private async marcarComoArchivada(ordenId: string): Promise<void> {
    const orden = await this.prisma.order.findUnique({
      where: { id: ordenId },
    });
    if (!orden) throw new NotFoundException("Orden no encontrada");

    const fechaArchivado = new Date().toISOString();
    const observacionesActuales = orden.observaciones || "";
    const nuevasObservaciones =
      `${observacionesActuales}\n[ARCHIVADA] ${fechaArchivado}`.trim();

    await this.prisma.order.update({
      where: { id: ordenId },
      data: { observaciones: nuevasObservaciones },
    });
  }

  /**
   * Archivar manualmente
   */
  async archivarManual(dto: ArchivarManualDto): Promise<ResultadoArchivadoDto> {
    let archivadas = 0;
    let omitidas = 0;
    const errores: string[] = [];

    for (const ordenId of dto.ordenesIds) {
      try {
        const orden = await this.prisma.order.findUnique({
          where: { id: ordenId },
        });

        if (!orden) {
          errores.push(`Orden ${ordenId}: No encontrada`);
          omitidas++;
          continue;
        }

        if (orden.observaciones?.includes("[ARCHIVADA]")) {
          errores.push(`Orden ${orden.numero}: Ya está archivada`);
          omitidas++;
          continue;
        }

        await this.marcarComoArchivada(ordenId);
        archivadas++;
      } catch (error) {
        const mensaje =
          error instanceof Error ? error.message : "Error desconocido";
        errores.push(`Orden ${ordenId}: ${mensaje}`);
        omitidas++;
      }
    }

    return {
      exito: errores.length === 0,
      ordenesArchivadas: archivadas,
      ordenesOmitidas: omitidas,
      errores,
      fechaEjecucion: new Date().toISOString(),
      proximoArchivado: this.calcularProximoArchivado().toISOString(),
    };
  }

  /**
   * Consultar histórico de órdenes archivadas
   */
  async consultarHistorico(dto: ConsultarHistoricoDto): Promise<{
    ordenes: OrdenArchivadaResponseDto[];
    total: number;
    pagina: number;
    totalPaginas: number;
  }> {
    const pagina = dto.pagina || 1;
    const limite = dto.limite || 20;
    const skip = (pagina - 1) * limite;

    const where: any = {
      observaciones: { contains: "[ARCHIVADA]" },
    };

    if (dto.numeroOrden) {
      where.numero = { contains: dto.numeroOrden, mode: "insensitive" };
    }
    if (dto.clienteId) {
      where.cliente = dto.clienteId;
    }
    if (dto.fechaDesde) {
      where.fechaFin = { ...where.fechaFin, gte: new Date(dto.fechaDesde) };
    }
    if (dto.fechaHasta) {
      where.fechaFin = { ...where.fechaFin, lte: new Date(dto.fechaHasta) };
    }

    const [ordenes, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limite,
        orderBy: { updatedAt: "desc" },
        include: {
          _count: { select: { evidencias: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      ordenes: ordenes.map((o) => this.mapOrdenToResponse(o)),
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  /**
   * Exportar histórico a CSV
   */
  async exportarHistorico(
    dto: ExportarHistoricoDto,
  ): Promise<ResultadoExportacionDto> {
    const fechaInicio = new Date(dto.anio, dto.mes - 1, 1);
    const fechaFin = new Date(dto.anio, dto.mes, 0, 23, 59, 59);

    const ordenes = await this.prisma.order.findMany({
      where: {
        observaciones: { contains: "[ARCHIVADA]" },
        fechaFin: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      include: {
        costos: true,
      },
    });

    if (ordenes.length === 0) {
      throw new NotFoundException(
        `No hay órdenes archivadas en ${dto.mes}/${dto.anio}`,
      );
    }

    const nombreArchivo = `ordenes_archivadas_${dto.anio}_${String(dto.mes).padStart(2, "0")}.csv`;
    const rutaArchivo = path.join(this.EXPORT_DIR, nombreArchivo);

    await this.generarCSV(ordenes, rutaArchivo);

    const stats = fs.statSync(rutaArchivo);

    return {
      exito: true,
      archivoUrl: `/archivos/exports/${nombreArchivo}`,
      nombreArchivo,
      tamano: stats.size,
      formato: dto.formato,
      ordenesIncluidas: ordenes.length,
      fechaGeneracion: new Date().toISOString(),
    };
  }

  /**
   * Obtener estadísticas de archivo
   */
  async getEstadisticas(): Promise<EstadisticasArchivoDto> {
    const [activas, archivadas] = await Promise.all([
      this.prisma.order.count({
        where: {
          NOT: { observaciones: { contains: "[ARCHIVADA]" } },
        },
      }),
      this.prisma.order.count({
        where: { observaciones: { contains: "[ARCHIVADA]" } },
      }),
    ]);

    // Calculate space used
    let espacioTotal = 0;
    if (fs.existsSync(this.EXPORT_DIR)) {
      const files = fs.readdirSync(this.EXPORT_DIR);
      for (const file of files) {
        const filepath = path.join(this.EXPORT_DIR, file);
        try {
          const stat = fs.statSync(filepath);
          espacioTotal += stat.size;
        } catch {
          /* ignore */
        }
      }
    }

    return {
      totalOrdenesActivas: activas,
      totalOrdenesArchivadas: archivadas,
      totalExportaciones: fs.existsSync(this.EXPORT_DIR)
        ? fs.readdirSync(this.EXPORT_DIR).length
        : 0,
      espacioUtilizadoMB:
        Math.round((espacioTotal / (1024 * 1024)) * 100) / 100,
      ultimoArchivado: undefined,
      proximoArchivado: this.calcularProximoArchivado().toISOString(),
      archivosPorMes: [],
    };
  }

  /**
   * Restaurar orden archivada
   */
  async restaurarOrden(ordenId: string): Promise<OrdenArchivadaResponseDto> {
    const orden = await this.prisma.order.findUnique({
      where: { id: ordenId },
      include: { _count: { select: { evidencias: true } } },
    });

    if (!orden) {
      throw new NotFoundException(`Orden ${ordenId} no encontrada`);
    }

    if (!orden.observaciones?.includes("[ARCHIVADA]")) {
      throw new NotFoundException(`Orden ${ordenId} no está archivada`);
    }

    // Remove archive marker
    const nuevasObservaciones = orden.observaciones
      .split("\n")
      .filter((line) => !line.startsWith("[ARCHIVADA]"))
      .join("\n")
      .trim();

    await this.prisma.order.update({
      where: { id: ordenId },
      data: { observaciones: nuevasObservaciones || null },
    });

    this.logger.log(`Orden ${orden.numero} restaurada desde archivo`);

    return this.mapOrdenToResponse({
      ...orden,
      observaciones: nuevasObservaciones,
    });
  }

  private mapOrdenToResponse(orden: any): OrdenArchivadaResponseDto {
    const archivoMatch = orden.observaciones?.match(/\[ARCHIVADA\] (.+)/);
    const fechaArchivado = archivoMatch
      ? archivoMatch[1]
      : orden.updatedAt.toISOString();

    return {
      id: orden.id,
      numero: orden.numero,
      descripcion: orden.descripcion,
      cliente: orden.cliente,
      estado: orden.estado,
      fechaCreacion: orden.createdAt.toISOString(),
      fechaCierre: orden.fechaFin?.toISOString() || "",
      fechaArchivado,
      montoTotal: orden.costoReal || 0,
      tieneEvidencias: (orden._count?.evidencias || 0) > 0,
      tienePDF: false,
    };
  }

  private async generarCSV(ordenes: any[], rutaArchivo: string): Promise<void> {
    const headers = [
      "ID",
      "Número",
      "Descripción",
      "Cliente",
      "Estado",
      "Fecha Creación",
      "Fecha Cierre",
      "Costo Real",
    ];
    const rows = ordenes.map((o) => [
      o.id,
      o.numero,
      o.descripcion.replace(/,/g, ";"),
      o.cliente || "N/A",
      o.estado,
      o.createdAt.toISOString(),
      o.fechaFin?.toISOString() || "",
      o.costoReal || 0,
    ]);

    const content = [headers.join(","), ...rows.map((r) => r.join(","))].join(
      "\n",
    );
    fs.writeFileSync(rutaArchivo, content, "utf-8");
  }

  private calcularProximoArchivado(): Date {
    const ahora = new Date();
    const proximo = new Date(
      ahora.getFullYear(),
      ahora.getMonth() + 1,
      1,
      2,
      0,
      0,
    );
    return proximo;
  }
}
