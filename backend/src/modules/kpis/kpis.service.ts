// ============================================
// KPIS SERVICE - Servicio unificado de KPIs
// Reemplaza múltiples Use Cases para arquitectura pragmática
// ============================================
import { PrismaService } from "@/prisma/prisma.service";
import { Injectable, Logger } from "@nestjs/common";
import { Decimal } from "@/shared/utils/decimal.util";
import {
    DashboardKpiDto,
    FinancialKpiDto,
    KpiFiltersDto,
    OrdenesKpiDto,
    TecnicosKpiDto,
} from "./dto";

@Injectable()
export class KpisService {
  private readonly logger = new Logger(KpisService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // DASHBOARD
  // ============================================

  async getDashboardKpis(filters: KpiFiltersDto): Promise<DashboardKpiDto> {
    try {
      this.logger.log("Calculando KPIs del dashboard", { filters });

      const [ordenes, tecnicos, financiero] = await Promise.all([
        this.getOrdenesKpis(filters),
        this.getTecnicosKpis(filters),
        this.getFinancialKpis(filters),
      ]);

      return {
        ordenes,
        tecnicos,
        financiero,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error("Error calculando KPIs del dashboard", error);
      throw error;
    }
  }

  // ============================================
  // ORDENES
  // ============================================

  async getOrdenesKpis(filters: KpiFiltersDto): Promise<OrdenesKpiDto> {
    try {
      const { fechaInicio, fechaFin } = this.parseKpiDateRange(filters, (now) => {
        switch (filters.periodo) {
          case "HOY": return new Date(now.setHours(0, 0, 0, 0));
          case "SEMANA": return new Date(now.setDate(now.getDate() - 7));
          case "TRIMESTRE": return new Date(now.setMonth(now.getMonth() - 3));
          case "ANO": return new Date(now.setFullYear(now.getFullYear() - 1));
          case "MES":
          default: return new Date(now.setMonth(now.getMonth() - 1));
        }
      });

      const [total, completadas, pendientes, enProgreso, canceladas, tiempoPromedio] = await Promise.all([
        this.contarOrdenes(fechaInicio, fechaFin, filters.clienteId),
        this.contarPorEstado("COMPLETADA", fechaInicio, fechaFin, filters.clienteId),
        this.contarPorEstado("PENDIENTE", fechaInicio, fechaFin, filters.clienteId),
        this.contarPorEstado("EN_PROGRESO", fechaInicio, fechaFin, filters.clienteId),
        this.contarPorEstado("CANCELADA", fechaInicio, fechaFin, filters.clienteId),
        this.calcularTiempoPromedio(fechaInicio, fechaFin, filters.clienteId),
      ]);

      const tasaCompletitud = total > 0 ? (completadas / total) * 100 : 0;

      return {
        total,
        completadas,
        pendientes,
        enProgreso,
        canceladas,
        tasaCompletitud: Math.round(tasaCompletitud * 100) / 100,
        tiempoPromedioResolucion: Math.round(tiempoPromedio * 100) / 100,
      };
    } catch (error) {
      this.logger.error("Error calculando KPIs de órdenes", error);
      throw error;
    }
  }

  private async contarOrdenes(fechaInicio: Date, fechaFin: Date, clienteId?: string): Promise<number> {
    return this.prisma.order.count({
      where: {
        createdAt: { gte: fechaInicio, lte: fechaFin },
        ...(clienteId && { clienteId }),
      },
    });
  }

  private async contarPorEstado(estado: string, fechaInicio: Date, fechaFin: Date, clienteId?: string): Promise<number> {
    return this.prisma.order.count({
      where: {
        estado: estado as any,
        createdAt: { gte: fechaInicio, lte: fechaFin },
        ...(clienteId && { clienteId }),
      },
    });
  }

  private async calcularTiempoPromedio(fechaInicio: Date, fechaFin: Date, clienteId?: string): Promise<number> {
    const ordenes = await this.prisma.order.findMany({
      where: {
        estado: "completada" as any,
        createdAt: { gte: fechaInicio, lte: fechaFin },
        fechaFin: { not: null },
        ...(clienteId && { clienteId }),
      },
      select: { createdAt: true, fechaFin: true },
    });

    if (ordenes.length === 0) return 0;
    const tiempoTotal = ordenes.reduce((acc, orden) => {
      const diff = orden.fechaFin!.getTime() - orden.createdAt.getTime();
      return acc + diff / (1000 * 60 * 60); // Horas
    }, 0);

    return tiempoTotal / ordenes.length;
  }

  // ============================================
  // TECNICOS
  // ============================================

  async getTecnicosKpis(filters: KpiFiltersDto): Promise<TecnicosKpiDto> {
    try {
      const [totalActivos, ordenesStats] = await Promise.all([
        this.contarTecnicosActivos(),
        this.obtenerEstadisticasOrdenesTecnicos(filters),
      ]);

      const disponibles = Math.floor(totalActivos * 0.6); // Placeholder logic preserved
      const ocupados = totalActivos - disponibles;
      const promedioOrdenesPorTecnico = totalActivos > 0 ? ordenesStats.total / totalActivos : 0;
      const eficienciaPromedio = ordenesStats.total > 0 ? (ordenesStats.completadas / ordenesStats.total) * 100 : 0;

      return {
        totalActivos,
        disponibles,
        ocupados,
        promedioOrdenesPorTecnico: Math.round(promedioOrdenesPorTecnico * 100) / 100,
        eficienciaPromedio: Math.round(eficienciaPromedio * 100) / 100,
      };
    } catch (error) {
      this.logger.error("Error calculando KPIs de técnicos", error);
      throw error;
    }
  }

  private async contarTecnicosActivos(): Promise<number> {
    return this.prisma.user.count({ where: { role: "tecnico" as any, active: true } });
  }

  private async obtenerEstadisticasOrdenesTecnicos(filters: KpiFiltersDto) {
    const { fechaInicio } = this.parseKpiDateRange(filters, (now) => {
        // Same default logic as Use Case (fallback logic slightly different but consistent intent)
        switch (filters.periodo) {
          case "HOY": return new Date(now.setHours(0, 0, 0, 0));
          case "SEMANA": return new Date(now.setDate(now.getDate() - 7));
          case "MES": default: return new Date(now.setMonth(now.getMonth() - 1));
        }
    });

    const whereBase: any = {
      createdAt: { gte: fechaInicio, lte: new Date() },
      asignadoId: { not: null },
    };

    const [total, completadas] = await Promise.all([
      this.prisma.order.count({ where: whereBase }),
      this.prisma.order.count({ where: { ...whereBase, estado: "completada" as any } }),
    ]);

    return { total, completadas };
  }

  // ============================================
  // FINANCIAL
  // ============================================

  async getFinancialKpis(filters: KpiFiltersDto): Promise<FinancialKpiDto> {
    try {
      const { fechaInicio, fechaFin } = this.parseKpiDateRange(filters, (now) => new Date(now.setMonth(now.getMonth() - 1)));

      const [costosData, ordenesCount] = await Promise.all([
        this.obtenerCostos(fechaInicio, fechaFin, filters.clienteId),
        this.contarOrdenesCompletadas(fechaInicio, fechaFin, filters.clienteId),
      ]);

      const ingresosTotales = this.decimalToNumber(costosData.ingresos);
      const costosTotales = this.decimalToNumber(costosData.costos);
      const utilidad = ingresosTotales - costosTotales;
      const margenGanancia = ingresosTotales > 0 ? (utilidad / ingresosTotales) * 100 : 0;
      const ticketPromedio = ordenesCount > 0 ? ingresosTotales / ordenesCount : 0;

      return {
        ingresosTotales: Math.round(ingresosTotales * 100) / 100,
        costosTotales: Math.round(costosTotales * 100) / 100,
        utilidad: Math.round(utilidad * 100) / 100,
        margenGanancia: Math.round(margenGanancia * 100) / 100,
        ticketPromedio: Math.round(ticketPromedio * 100) / 100,
      };
    } catch (error) {
      this.logger.error("Error calculando KPIs financieros", error);
      throw error;
    }
  }

  private async obtenerCostos(fechaInicio: Date, fechaFin: Date, clienteId?: string) {
    const result = await this.prisma.order.aggregate({
      where: {
        createdAt: { gte: fechaInicio, lte: fechaFin },
        cliente: clienteId ? clienteId : undefined,
        estado: { not: "cancelada" as any },
      },
      _sum: { presupuestoEstimado: true, costoReal: true },
    });

    return {
      ingresos: result._sum.presupuestoEstimado ? new Decimal(result._sum.presupuestoEstimado) : new Decimal(0),
      costos: result._sum.costoReal ? new Decimal(result._sum.costoReal) : new Decimal(0),
    };
  }

  private async contarOrdenesCompletadas(fechaInicio: Date, fechaFin: Date, clienteId?: string): Promise<number> {
    // Note: Use Case used "contarOrdenes" but filtered by 'completada' inside.
    return this.prisma.order.count({
      where: {
        estado: "completada" as any,
        createdAt: { gte: fechaInicio, lte: fechaFin },
        cliente: clienteId ? clienteId : undefined,
      },
    });
  }

  private decimalToNumber(decimal: number | Decimal): number {
    if (typeof decimal === "number") return decimal;
    return decimal ? parseFloat(decimal.toString()) : 0;
  }

  // ============================================
  // UTILS
  // ============================================

  private parseKpiDateRange(
    filters: KpiFiltersDto,
    computeDefaultStart: (now: Date, filters: KpiFiltersDto) => Date,
  ): { fechaInicio: Date; fechaFin: Date } {
    const ahora = new Date();
    let fechaInicio: Date;
    let fechaFin: Date = ahora; // Default to now

    if (filters.fechaInicio && filters.fechaFin) {
      fechaInicio = new Date(filters.fechaInicio);
      fechaFin = new Date(filters.fechaFin);
    } else {
      fechaInicio = computeDefaultStart(ahora, filters);
    }
    return { fechaInicio, fechaFin };
  }
}
