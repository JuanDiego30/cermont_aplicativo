/**
 * @useCase GetDashboardStatsUseCase
 * @description Obtiene estadísticas consolidadas del dashboard
 * @version 2.0.0
 */
import { Injectable, Inject, Logger } from "@nestjs/common";
import {
  DASHBOARD_REPOSITORY,
  IDashboardRepository,
  DashboardQueryDto,
  DashboardResponse,
  DashboardStatsDto,
  TendenciaDto,
  OrdenResumenDto,
} from "../dto";

@Injectable()
export class GetDashboardStatsUseCase {
  private readonly logger = new Logger(GetDashboardStatsUseCase.name);

  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private readonly dashboardRepository: IDashboardRepository,
  ) {}

  /**
   * Ejecuta la obtención de estadísticas del dashboard
   * @param filters - Filtros opcionales para las estadísticas
   * @returns Dashboard completo con stats, tendencias y últimas órdenes
   */
  async execute(filters?: DashboardQueryDto): Promise<DashboardResponse> {
    try {
      this.logger.log(
        `Obteniendo estadísticas del dashboard con filtros: ${JSON.stringify(filters || {})}`,
      );

      // Valores por defecto para parámetros
      const diasTendencia = filters?.diasTendencia ?? 30;
      const limitOrdenes = filters?.limitOrdenes ?? 10;

      // Ejecutar queries en paralelo para mejor performance
      const [stats, tendencia, ultimasOrdenes] = await Promise.all([
        this.dashboardRepository.getStats(filters),
        this.dashboardRepository.getTendencia(diasTendencia),
        this.dashboardRepository.getUltimasOrdenes(limitOrdenes),
      ]);

      // Validar que los datos existan
      if (!stats) {
        this.logger.warn("No se pudieron obtener estadísticas del dashboard");
        throw new Error("Error al obtener estadísticas del dashboard");
      }

      // Transformar y retornar respuesta
      return this.buildResponse(stats, tendencia, ultimasOrdenes);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Error al obtener estadísticas del dashboard: ${err.message}`,
        err.stack,
      );
      throw err;
    }
  }

  /**
   * Construye la respuesta del dashboard
   * @private
   */
  private buildResponse(
    stats: DashboardStatsDto,
    tendencia: TendenciaDto[],
    ultimasOrdenes: OrdenResumenDto[],
  ): DashboardResponse {
    return {
      stats: {
        ...stats,
        ordenes: {
          ...stats.ordenes,
          porcentajePlaneacion: this.calculatePercentage(
            stats.ordenes.planeacion,
            stats.ordenes.total,
          ),
          porcentajeEjecucion: this.calculatePercentage(
            stats.ordenes.ejecucion,
            stats.ordenes.total,
          ),
          porcentajeCompletadas: this.calculatePercentage(
            stats.ordenes.completadas,
            stats.ordenes.total,
          ),
        },
      },
      tendencia: tendencia.map((t) => ({
        fecha: this.formatDate(t.fecha),
        ordenes: t.ordenes,
        ingresos: t.ingresos,
        gastos: t.gastos,
        margen: this.calculateMargin(t.ingresos, t.gastos),
      })),
      ultimasOrdenes: ultimasOrdenes.map((orden) => ({
        id: orden.id,
        numero: orden.numero,
        cliente: orden.cliente,
        descripcion: this.truncateText(orden.descripcion, 100),
        estado: orden.estado,
        subEstado: orden.subEstado,
        prioridad: orden.prioridad,
        asignado: orden.asignado,
        createdAt: orden.createdAt,
        fechaInicio: orden.fechaInicio,
        diasTranscurridos: this.calculateDaysElapsed(orden.createdAt),
        cumplimientoHES: orden.cumplimientoHES,
      })),
      metadata: {
        generadoEn: new Date().toISOString(),
        diasTendencia: tendencia.length,
        ordenesRecientes: ultimasOrdenes.length,
      },
    };
  }

  /**
   * Calcula porcentaje con manejo de división por cero
   * @private
   */
  private calculatePercentage(valor: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((valor / total) * 100 * 100) / 100; // 2 decimales
  }

  /**
   * Calcula el margen de ganancia
   * @private
   */
  private calculateMargin(ingresos: number, gastos: number): number {
    if (ingresos === 0) return 0;
    return Math.round(((ingresos - gastos) / ingresos) * 100 * 100) / 100;
  }

  /**
   * Formatea fecha a formato ISO corto (YYYY-MM-DD)
   * @private
   */
  private formatDate(fecha: Date | string): string {
    const date = typeof fecha === "string" ? new Date(fecha) : fecha;
    return date.toISOString().split("T")[0];
  }

  /**
   * Trunca texto a longitud máxima
   * @private
   */
  private truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  }

  /**
   * Calcula días transcurridos desde una fecha
   * @private
   */
  private calculateDaysElapsed(fechaInicio: Date): number {
    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    const diffTime = Math.abs(hoy.getTime() - inicio.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
