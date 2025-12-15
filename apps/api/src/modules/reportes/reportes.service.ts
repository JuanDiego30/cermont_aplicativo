/**
 * @service ReportesService
 * @description Servicio para generación de reportes y análisis
 * 
 * Principios aplicados:
 * - Type Safety: Interfaces tipadas, sin 'any'
 * - Clean Code: Código legible y bien estructurado
 * - SRP: Solo maneja lógica de reportes
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '.prisma/client';

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
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Genera reporte de órdenes con filtro por fechas
   */
  async reporteOrdenes(
    desde?: string,
    hasta?: string,
  ): Promise<ReporteOrdenesResult> {
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
      const costoOrden = orden.costos.reduce(
        (sumaCostos, costo) => sumaCostos + costo.monto,
        0,
      );
      return totalOrdenes + costoOrden;
    }, 0);
  }

  /**
   * Genera reporte financiero con ingresos, egresos y utilidad
   * @param periodo Período de tiempo: '1m', '3m', '6m', '1y'
   */
  async reporteFinanciero(periodo: string = '6m') {
    // Calcular fecha de inicio según el período
    const fechaInicio = new Date();
    switch (periodo) {
      case '1m':
        fechaInicio.setMonth(fechaInicio.getMonth() - 1);
        break;
      case '3m':
        fechaInicio.setMonth(fechaInicio.getMonth() - 3);
        break;
      case '6m':
        fechaInicio.setMonth(fechaInicio.getMonth() - 6);
        break;
      case '1y':
        fechaInicio.setFullYear(fechaInicio.getFullYear() - 1);
        break;
      default:
        fechaInicio.setMonth(fechaInicio.getMonth() - 6);
    }

    // Obtener órdenes completadas en el período
    const ordenes = await this.prisma.order.findMany({
      where: {
        estado: 'completada',
        fechaFin: {
          gte: fechaInicio,
        },
      },
      include: {
        costos: true,
      },
      orderBy: {
        fechaFin: 'asc',
      },
    });

    // Agrupar por mes
    const datosPorMes = new Map<string, {
      ingresos: number;
      egresos: number;
      utilidad: number;
      margen: number;
    }>();

    ordenes.forEach((orden) => {
      if (!orden.fechaFin) return;

      const mes = `${orden.fechaFin.getFullYear()}-${String(orden.fechaFin.getMonth() + 1).padStart(2, '0')}`;
      
      if (!datosPorMes.has(mes)) {
        datosPorMes.set(mes, {
          ingresos: 0,
          egresos: 0,
          utilidad: 0,
          margen: 0,
        });
      }

      const datos = datosPorMes.get(mes)!;
      
      // Calcular ingresos (presupuesto estimado + impuestos)
      const ingresosOrden = (orden.presupuestoEstimado || 0) + (orden.impuestosAplicables || 0);
      
      // Calcular egresos (suma de costos)
      const egresosOrden = orden.costos.reduce((sum, costo) => sum + costo.monto, 0);
      
      datos.ingresos += ingresosOrden;
      datos.egresos += egresosOrden;
      datos.utilidad = datos.ingresos - datos.egresos;
      datos.margen = datos.ingresos > 0 ? (datos.utilidad / datos.ingresos) * 100 : 0;
    });

    // Convertir Map a array
    const data = Array.from(datosPorMes.entries()).map(([mes, datos]) => {
      const [año, mesNum] = mes.split('-');
      const fecha = new Date(parseInt(año), parseInt(mesNum) - 1, 1);
      const nombreMes = fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      
      return {
        periodo: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1),
        periodoKey: mes,
        fecha: mes + '-01',
        ingresos: Math.round(datos.ingresos),
        egresos: Math.round(datos.egresos),
        utilidad: Math.round(datos.utilidad),
        margen: Math.round(datos.margen * 10) / 10,
      };
    });

    // Calcular resumen
    const totalIngresos = data.reduce((sum, d) => sum + d.ingresos, 0);
    const totalEgresos = data.reduce((sum, d) => sum + d.egresos, 0);
    const totalUtilidad = totalIngresos - totalEgresos;
    const promedioMargen = data.length > 0
      ? data.reduce((sum, d) => sum + d.margen, 0) / data.length
      : 0;

    // Calcular tendencias (comparando último vs promedio anterior)
    const tendenciaIngresos = this.calcularTendencia(data.map(d => d.ingresos));
    const tendenciaEgresos = this.calcularTendencia(data.map(d => d.egresos));
    const tendenciaUtilidad = this.calcularTendencia(data.map(d => d.utilidad));

    return {
      data,
      summary: {
        totalIngresos,
        totalEgresos,
        totalUtilidad,
        promedioMargen: Math.round(promedioMargen * 10) / 10,
        tendenciaIngresos,
        tendenciaEgresos,
        tendenciaUtilidad,
      },
    };
  }

  /**
   * Calcula tendencia porcentual comparando último valor con promedio anterior
   */
  private calcularTendencia(valores: number[]): number {
    if (valores.length < 2) return 0;
    
    const ultimo = valores[valores.length - 1];
    const promedio = valores.slice(0, -1).reduce((a, b) => a + b, 0) / (valores.length - 1);
    
    if (promedio === 0) return 0;
    
    return Math.round(((ultimo - promedio) / promedio) * 100 * 10) / 10;
  }
}
