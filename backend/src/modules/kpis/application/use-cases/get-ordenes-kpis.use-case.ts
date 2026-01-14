import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { KpiFiltersDto, OrdenesKpiDto } from "../dto";
import { parseKpiDateRange } from "../utils/kpi-date-range";

@Injectable()
export class GetOrdenesKpisUseCase {
  private readonly logger = new Logger(GetOrdenesKpisUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: KpiFiltersDto): Promise<OrdenesKpiDto> {
    try {
      this.logger.log("Calculando KPIs de órdenes", { filters });

      const { fechaInicio, fechaFin } = parseKpiDateRange(filters, (now) => {
        switch (filters.periodo) {
          case "HOY":
            return new Date(now.setHours(0, 0, 0, 0));
          case "SEMANA":
            return new Date(now.setDate(now.getDate() - 7));
          case "TRIMESTRE":
            return new Date(now.setMonth(now.getMonth() - 3));
          case "ANO":
            return new Date(now.setFullYear(now.getFullYear() - 1));
          case "MES":
          default:
            return new Date(now.setMonth(now.getMonth() - 1));
        }
      });

      // Query para obtener estadísticas
      const [
        total,
        completadas,
        pendientes,
        enProgreso,
        canceladas,
        tiempoPromedio,
      ] = await Promise.all([
        this.contarOrdenes(fechaInicio, fechaFin, filters.clienteId),
        this.contarPorEstado(
          "COMPLETADA",
          fechaInicio,
          fechaFin,
          filters.clienteId,
        ),
        this.contarPorEstado(
          "PENDIENTE",
          fechaInicio,
          fechaFin,
          filters.clienteId,
        ),
        this.contarPorEstado(
          "EN_PROGRESO",
          fechaInicio,
          fechaFin,
          filters.clienteId,
        ),
        this.contarPorEstado(
          "CANCELADA",
          fechaInicio,
          fechaFin,
          filters.clienteId,
        ),
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

  private async contarOrdenes(
    fechaInicio: Date,
    fechaFin: Date,
    clienteId?: string,
  ): Promise<number> {
    return this.prisma.order.count({
      where: {
        createdAt: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        ...(clienteId && { clienteId }),
      },
    });
  }

  private async contarPorEstado(
    estado: string,
    fechaInicio: Date,
    fechaFin: Date,
    clienteId?: string,
  ): Promise<number> {
    return this.prisma.order.count({
      where: {
        estado: estado as any,
        createdAt: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        ...(clienteId && { clienteId }),
      },
    });
  }

  private async calcularTiempoPromedio(
    fechaInicio: Date,
    fechaFin: Date,
    clienteId?: string,
  ): Promise<number> {
    const ordenes = await this.prisma.order.findMany({
      where: {
        estado: "completada" as any,
        createdAt: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        fechaFin: { not: null },
        ...(clienteId && { clienteId }),
      },
      select: {
        createdAt: true,
        fechaFin: true,
      },
    });

    if (ordenes.length === 0) return 0;

    const tiempoTotal = ordenes.reduce(
      (acc: number, orden: { createdAt: Date; fechaFin: Date | null }) => {
        const diff = orden.fechaFin!.getTime() - orden.createdAt.getTime();
        return acc + diff / (1000 * 60 * 60); // Convertir a horas
      },
      0,
    );

    return tiempoTotal / ordenes.length;
  }
}
