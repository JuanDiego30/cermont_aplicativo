import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { KpiFiltersDto, FinancialKpiDto } from "../dto";
import { Decimal } from "decimal.js";
import { parseKpiDateRange } from "../utils/kpi-date-range";

@Injectable()
export class GetFinancialKpisUseCase {
  private readonly logger = new Logger(GetFinancialKpisUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: KpiFiltersDto): Promise<FinancialKpiDto> {
    try {
      this.logger.log("Calculando KPIs financieros", { filters });

      const { fechaInicio, fechaFin } = parseKpiDateRange(filters, (now) =>
        new Date(now.setMonth(now.getMonth() - 1)),
      );

      const [costosData, ordenesCount] = await Promise.all([
        this.obtenerCostos(fechaInicio, fechaFin, filters.clienteId),
        this.contarOrdenes(fechaInicio, fechaFin, filters.clienteId),
      ]);

      const ingresosTotales = this.decimalToNumber(costosData.ingresos);
      const costosTotales = this.decimalToNumber(costosData.costos);
      const utilidad = ingresosTotales - costosTotales;
      const margenGanancia =
        ingresosTotales > 0 ? (utilidad / ingresosTotales) * 100 : 0;
      const ticketPromedio =
        ordenesCount > 0 ? ingresosTotales / ordenesCount : 0;

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

  private async obtenerCostos(
    fechaInicio: Date,
    fechaFin: Date,
    clienteId?: string,
  ) {
    const result = await this.prisma.order.aggregate({
      where: {
        createdAt: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        cliente: clienteId ? clienteId : undefined,
        estado: { not: "cancelada" }, // Aseguramos no sumar canceladas
      },
      _sum: {
        presupuestoEstimado: true,
        costoReal: true,
      },
    });

    return {
      ingresos: result._sum.presupuestoEstimado
        ? new Decimal(result._sum.presupuestoEstimado)
        : new Decimal(0),
      costos: result._sum.costoReal
        ? new Decimal(result._sum.costoReal)
        : new Decimal(0),
    };
  }

  private async contarOrdenes(
    fechaInicio: Date,
    fechaFin: Date,
    clienteId?: string,
  ): Promise<number> {
    return this.prisma.order.count({
      where: {
        estado: "completada",
        createdAt: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        cliente: clienteId ? clienteId : undefined,
      },
    });
  }

  private decimalToNumber(decimal: number | Decimal): number {
    if (typeof decimal === "number") return decimal;
    return decimal ? parseFloat(decimal.toString()) : 0;
  }
}
