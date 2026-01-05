/**
 * @useCase GenerateReporteOrdenesUseCase
 */
import { Injectable, Inject } from "@nestjs/common";
import {
  REPORTE_REPOSITORY,
  IReporteRepository,
  ReporteQueryDto,
  ReporteResponse,
  OrdenReporteData,
  ReporteSummary,
} from "../dto";

@Injectable()
export class GenerateReporteOrdenesUseCase {
  constructor(
    @Inject(REPORTE_REPOSITORY)
    private readonly repo: IReporteRepository,
  ) {}

  async execute(filters: ReporteQueryDto): Promise<ReporteResponse> {
    const ordenes = await this.repo.getOrdenesReporte(filters);

    const ordenesData: OrdenReporteData[] = ordenes.map((o) => ({
      id: o.id,
      numero: o.numero,
      titulo: o.titulo,
      estado: o.estado,
      prioridad: o.prioridad,
      fechaCreacion: o.createdAt.toISOString(),
      fechaCompletado: o.fechaCompletado?.toISOString(),
      tecnico: o.tecnicoAsignado?.nombre,
      horasTrabajadas: o.ejecucion?.horasReales || 0,
    }));

    const summary = this.calculateSummary(ordenesData);

    return {
      summary,
      ordenes: ordenesData,
      generadoEn: new Date().toISOString(),
    };
  }

  private calculateSummary(ordenes: OrdenReporteData[]): ReporteSummary {
    const completadas = ordenes.filter((o) => o.estado === "completada").length;
    const enProgreso = ordenes.filter((o) => o.estado === "ejecucion").length;
    const canceladas = ordenes.filter((o) => o.estado === "cancelada").length;
    const horasTotales = ordenes.reduce((acc, o) => acc + o.horasTrabajadas, 0);

    return {
      totalOrdenes: ordenes.length,
      completadas,
      enProgreso,
      canceladas,
      horasTotales,
      promedioHorasPorOrden:
        ordenes.length > 0 ? Math.round(horasTotales / ordenes.length) : 0,
    };
  }
}
