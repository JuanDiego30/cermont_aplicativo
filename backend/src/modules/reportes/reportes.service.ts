/**
 * @service ReportesService
 * @description Servicio para generación de reportes y análisis
 *
 * Principios aplicados:
 * - Type Safety: Interfaces tipadas, sin 'any'
 * - Clean Code: Código legible y bien estructurado
 * - SRP: Solo maneja lógica de reportes
 */
import { Prisma } from '@/prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// ============================================================================
// Interfaces
// ============================================================================

interface FiltroFechas {
  desde?: string;
  hasta?: string;
}

export interface ResumenOrdenes {
  total: number;
  completadas: number;
  enProgreso: number;
  costoTotal: number;
}

export interface ReporteOrdenesResult {
  ordenes: OrdenConCostos[];
  resumen: ResumenOrdenes;
}

export interface OrdenConCostos {
  id: string;
  estado: string;
  costos: Array<{ monto: number }>;
  [key: string]: unknown;
}

// ============================================================================
// Constantes
// ============================================================================

const ESTADO_COMPLETADA = 'completada';
const ESTADO_EN_EJECUCION = 'ejecucion';

// ============================================================================
// Service
// ============================================================================

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Genera reporte de órdenes con filtro por fechas
   */
  async reporteOrdenes(desde?: string, hasta?: string): Promise<ReporteOrdenesResult> {
    const whereClause = this.buildDateFilter({ desde, hasta });

    const ordenes = await this.prisma.order.findMany({
      where: whereClause,
      include: {
        costos: true,
        evidencias: true,
      },
    });

    const resumen = this.calcularResumenOrdenes(ordenes);

    return { ordenes, resumen };
  }

  /**
   * Genera reporte detallado de una orden específica
   */
  async reporteOrden(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        creador: true,
        asignado: true,
        items: true,
        evidencias: true,
        costos: true,
        planeacion: {
          include: { items: true },
        },
        ejecucion: {
          include: {
            tareas: true,
            checklists: true,
          },
        },
      },
    });
  }

  // ==========================================================================
  // Private Methods
  // ==========================================================================

  /**
   * Construye filtro de fechas para consulta Prisma
   */
  private buildDateFilter(filtro: FiltroFechas): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = {};

    if (filtro.desde || filtro.hasta) {
      where.createdAt = {};

      if (filtro.desde) {
        where.createdAt.gte = new Date(filtro.desde);
      }

      if (filtro.hasta) {
        where.createdAt.lte = new Date(filtro.hasta);
      }
    }

    return where;
  }

  /**
   * Calcula resumen estadístico de órdenes
   */
  private calcularResumenOrdenes(ordenes: OrdenConCostos[]): ResumenOrdenes {
    return {
      total: ordenes.length,
      completadas: this.contarPorEstado(ordenes, ESTADO_COMPLETADA),
      enProgreso: this.contarPorEstado(ordenes, ESTADO_EN_EJECUCION),
      costoTotal: this.calcularCostoTotal(ordenes),
    };
  }

  /**
   * Cuenta órdenes por estado
   */
  private contarPorEstado(ordenes: OrdenConCostos[], estado: string): number {
    return ordenes.filter(o => o.estado === estado).length;
  }

  /**
   * Suma todos los costos de todas las órdenes
   */
  private calcularCostoTotal(ordenes: OrdenConCostos[]): number {
    return ordenes.reduce((totalOrdenes, orden) => {
      const costoOrden = orden.costos.reduce((sumaCostos, costo) => sumaCostos + costo.monto, 0);
      return totalOrdenes + costoOrden;
    }, 0);
  }
}
