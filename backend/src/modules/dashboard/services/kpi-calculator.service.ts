/**
 * @service KpiCalculatorService
 *
 * Calcula métricas y KPIs en tiempo real para supervisores.
 * Uso: GET /dashboard/overview retorna datos actualizados.
 * Performance: Cachea cálculos cada 5 minutos para optimizar consultas.
 *
 * Métricas calculadas:
 * - Operativas: órdenes, tiempo ciclo, cumplimiento
 * - Costos: presupuesto vs real, desviación, margen
 * - Alertas: detección automática de problemas
 */
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IKpiMetrics,
  IKpiOverview,
  IKpiCostos,
  IKpiTecnicos,
  IAlerta,
  ICostoDesglosado,
  IKpiTendencias,
  ITendencia,
} from '../interfaces/kpi.interface';

@Injectable()
export class KpiCalculatorService {
  private readonly logger = new Logger(KpiCalculatorService.name);
  private cachedMetrics: IKpiMetrics | null = null;
  private cacheTimestamp: Date | null = null;
  private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutos

  // Umbrales para alertas
  private readonly UMBRAL_CUMPLIMIENTO = 90; // %
  private readonly UMBRAL_SOBRECOSTO = 5; // %
  private readonly UMBRAL_TIEMPO_CICLO = 20; // horas
  private readonly UMBRAL_DIAS_VENCIMIENTO = 3; // días

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene KPIs actualizados (con caché de 5 minutos).
   */
  async getKpis(): Promise<IKpiMetrics> {
    if (this.cachedMetrics && this.isCacheValid()) {
      this.logger.debug('Retornando métricas desde caché');
      return this.cachedMetrics;
    }

    const metrics = await this.calculateAllMetrics();
    this.cachedMetrics = metrics;
    this.cacheTimestamp = new Date();

    return metrics;
  }

  /**
   * Fuerza recálculo de métricas (invalida caché).
   */
  async refreshKpis(): Promise<IKpiMetrics> {
    this.invalidateCache();
    return this.getKpis();
  }

  /**
   * Calcula todas las métricas.
   */
  private async calculateAllMetrics(): Promise<IKpiMetrics> {
    const startTime = Date.now();

    try {
      const [overview, costos, tecnicos] = await Promise.all([
        this.calculateOverview(),
        this.calculateCostos(),
        this.calculateTecnicos(),
      ]);

      const alertas = await this.detectAlerts(overview, costos);

      const metrics: IKpiMetrics = {
        overview,
        costos,
        tecnicos,
        alertas,
        timestamp: new Date(),
      };

      const elapsed = Date.now() - startTime;
      this.logger.log(`✅ KPIs calculados en ${elapsed}ms`);

      return metrics;
    } catch (error) {
      this.logger.error('❌ Error calculando KPIs', error);
      throw error;
    }
  }

  /**
   * Calcula métricas operativas (órdenes, tiempo ciclo, cumplimiento).
   */
  private async calculateOverview(): Promise<IKpiOverview> {
    const [ordenes_totales, ordenes_completadas, ordenes_en_progreso, ordenes_en_planeacion] =
      await Promise.all([
        this.prisma.order.count(),
        this.prisma.order.count({ where: { estado: 'completada' } }),
        this.prisma.order.count({ where: { estado: 'ejecucion' } }),
        this.prisma.order.count({ where: { estado: 'planeacion' } }),
      ]);

    // Tasa de cumplimiento
    const tasa_cumplimiento =
      ordenes_totales > 0
        ? parseFloat(((ordenes_completadas / ordenes_totales) * 100).toFixed(1))
        : 0;

    // Tiempo promedio de ciclo (solo órdenes completadas con fechas)
    const ordenesConFechas = await this.prisma.order.findMany({
      where: {
        estado: 'completada',
        fechaInicio: { not: null },
        fechaFin: { not: null },
      },
      select: { fechaInicio: true, fechaFin: true },
    });

    let tiempo_promedio_ciclo = 0;
    let promedio_dias_completar = 0;

    if (ordenesConFechas.length > 0) {
      const tiemposHoras = ordenesConFechas.map(o => {
        const inicio = o.fechaInicio!.getTime();
        const fin = o.fechaFin!.getTime();
        return (fin - inicio) / (1000 * 60 * 60); // horas
      });

      tiempo_promedio_ciclo = parseFloat(
        (tiemposHoras.reduce((a, b) => a + b, 0) / tiemposHoras.length).toFixed(1)
      );

      promedio_dias_completar = parseFloat((tiempo_promedio_ciclo / 24).toFixed(1));
    }

    return {
      ordenes_totales,
      ordenes_completadas,
      ordenes_en_progreso,
      ordenes_en_planeacion,
      tasa_cumplimiento,
      tiempo_promedio_ciclo,
      promedio_dias_completar,
    };
  }

  /**
   * Calcula métricas de costos.
   */
  private async calculateCostos(): Promise<IKpiCostos> {
    // Obtener órdenes con costos y facturas
    const ordenes = await this.prisma.order.findMany({
      include: {
        costos: true,
        factura: true,
      },
    });

    let presupuestado_total = 0;
    let costo_real_total = 0;
    let impuestos_total = 0;
    let facturado_total = 0;
    let pendiente_facturar = 0;

    for (const orden of ordenes) {
      // Presupuesto estimado
      presupuestado_total += orden.presupuestoEstimado ?? 0;

      // Costo real (suma de todos los costos)
      const costoReal = orden.costos.reduce((sum, c) => sum + c.monto, 0);
      costo_real_total += costoReal;

      // Impuestos
      const impuestoPorcentaje = orden.impuestosAplicables ?? 0;
      impuestos_total += costoReal * impuestoPorcentaje;

      // Facturación
      if (orden.factura) {
        // Asumiendo que la factura tiene un monto
        facturado_total += costoReal + costoReal * impuestoPorcentaje;
      } else if (orden.estado === 'completada') {
        pendiente_facturar += costoReal;
      }
    }

    // Desviación porcentual
    const desviacion_porcentaje =
      presupuestado_total > 0
        ? parseFloat(
            (((costo_real_total - presupuestado_total) / presupuestado_total) * 100).toFixed(1)
          )
        : 0;

    // Margen de utilidad
    const total_con_impuestos = costo_real_total + impuestos_total;
    const margen_utilidad =
      total_con_impuestos > 0
        ? parseFloat(((impuestos_total / total_con_impuestos) * 100).toFixed(1))
        : 0;

    return {
      presupuestado_total,
      costo_real_total,
      desviacion_porcentaje,
      impuestos_total,
      margen_utilidad,
      facturado_total,
      pendiente_facturar,
    };
  }

  /**
   * Calcula métricas de técnicos.
   */
  private async calculateTecnicos(): Promise<IKpiTecnicos> {
    const [tecnicos_activos, tecnicosConOrdenes] = await Promise.all([
      this.prisma.user.count({
        where: { role: 'tecnico', active: true },
      }),
      this.prisma.user.findMany({
        where: { role: 'tecnico', active: true },
        include: {
          asignaciones: {
            where: { estado: 'ejecucion' },
          },
        },
      }),
    ]);

    const tecnicos_ocupados = tecnicosConOrdenes.filter(t => t.asignaciones.length > 0).length;

    // Top técnico por órdenes completadas
    const topTecnicos = await this.prisma.order.groupBy({
      by: ['asignadoId'],
      where: {
        estado: 'completada',
        asignadoId: { not: null },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 1,
    });

    let top_tecnico: IKpiTecnicos['top_tecnico'] = undefined;

    if (topTecnicos.length > 0 && topTecnicos[0].asignadoId) {
      const tecnico = await this.prisma.user.findUnique({
        where: { id: topTecnicos[0].asignadoId },
        select: { id: true, name: true },
      });

      if (tecnico) {
        top_tecnico = {
          id: tecnico.id,
          nombre: tecnico.name,
          ordenes_completadas: topTecnicos[0]._count.id,
        };
      }
    }

    // Promedio de órdenes por técnico
    const totalOrdenesAsignadas = await this.prisma.order.count({
      where: { asignadoId: { not: null } },
    });

    const promedio_ordenes_por_tecnico =
      tecnicos_activos > 0 ? parseFloat((totalOrdenesAsignadas / tecnicos_activos).toFixed(1)) : 0;

    return {
      tecnicos_activos,
      tecnicos_ocupados,
      promedio_ordenes_por_tecnico,
      top_tecnico,
    };
  }

  /**
   * Detecta alertas automáticas basadas en umbrales.
   */
  private async detectAlerts(overview: IKpiOverview, costos: IKpiCostos): Promise<IAlerta[]> {
    const alertas: IAlerta[] = [];
    const now = new Date();

    // Alerta 1: Tasa de cumplimiento baja
    if (overview.tasa_cumplimiento < this.UMBRAL_CUMPLIMIENTO) {
      alertas.push({
        tipo: 'INCUMPLIMIENTO',
        entidad_id: 'GLOBAL',
        entidad_tipo: 'GLOBAL',
        mensaje: `Tasa de cumplimiento en ${overview.tasa_cumplimiento}%. Objetivo: ${this.UMBRAL_CUMPLIMIENTO}%`,
        severidad: overview.tasa_cumplimiento < 80 ? 'ALTA' : 'MEDIA',
        timestamp: now,
      });
    }

    // Alerta 2: Sobrecosto global
    if (costos.desviacion_porcentaje > this.UMBRAL_SOBRECOSTO) {
      alertas.push({
        tipo: 'SOBRECOSTO',
        entidad_id: 'GLOBAL',
        entidad_tipo: 'GLOBAL',
        mensaje: `Costos reales ${costos.desviacion_porcentaje}% sobre presupuesto`,
        severidad: costos.desviacion_porcentaje > 10 ? 'ALTA' : 'MEDIA',
        timestamp: now,
      });
    }

    // Alerta 3: Tiempo de ciclo alto
    if (overview.tiempo_promedio_ciclo > this.UMBRAL_TIEMPO_CICLO) {
      alertas.push({
        tipo: 'RETRASO',
        entidad_id: 'GLOBAL',
        entidad_tipo: 'GLOBAL',
        mensaje: `Tiempo promedio de ciclo: ${overview.tiempo_promedio_ciclo}h (límite: ${this.UMBRAL_TIEMPO_CICLO}h)`,
        severidad: 'MEDIA',
        timestamp: now,
      });
    }

    // Alerta 4: Órdenes próximas a vencer
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + this.UMBRAL_DIAS_VENCIMIENTO);

    const ordenesProximasVencer = await this.prisma.order.findMany({
      where: {
        estado: { in: ['planeacion', 'ejecucion'] },
        fechaFinEstimada: {
          lte: fechaLimite,
          gte: now,
        },
      },
      select: { id: true, numero: true, fechaFinEstimada: true },
    });

    for (const orden of ordenesProximasVencer) {
      alertas.push({
        tipo: 'VENCIMIENTO_PROXIMO',
        entidad_id: orden.id,
        entidad_tipo: 'ORDEN',
        mensaje: `Orden ${orden.numero} vence en menos de ${this.UMBRAL_DIAS_VENCIMIENTO} días`,
        severidad: 'MEDIA',
        metadata: { fechaVencimiento: orden.fechaFinEstimada },
        timestamp: now,
      });
    }

    // Alerta 5: Órdenes con sobrecosto individual
    const ordenesConSobrecosto = await this.prisma.order.findMany({
      where: {
        presupuestoEstimado: { gt: 0 },
      },
      include: { costos: true },
    });

    for (const orden of ordenesConSobrecosto) {
      const costoReal = orden.costos.reduce((sum, c) => sum + c.monto, 0);
      const presupuesto = orden.presupuestoEstimado ?? 0;

      if (presupuesto > 0) {
        const desviacion = ((costoReal - presupuesto) / presupuesto) * 100;

        if (desviacion > this.UMBRAL_SOBRECOSTO) {
          alertas.push({
            tipo: 'SOBRECOSTO',
            entidad_id: orden.id,
            entidad_tipo: 'ORDEN',
            mensaje: `Orden ${orden.numero}: ${desviacion.toFixed(1)}% sobre presupuesto`,
            severidad: desviacion > 15 ? 'ALTA' : 'MEDIA',
            metadata: { presupuesto, costoReal, desviacion },
            timestamp: now,
          });
        }
      }
    }

    return alertas;
  }

  /**
   * Obtiene desglose de costos por orden.
   */
  async getCostosDesglosados(): Promise<ICostoDesglosado[]> {
    const ordenes = await this.prisma.order.findMany({
      include: { costos: true },
      where: { estado: 'completada' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return ordenes.map(orden => {
      const desglose = {
        mano_obra: 0,
        materiales: 0,
        equipos: 0,
        transporte: 0,
        otros: 0,
      };

      for (const costo of orden.costos) {
        const tipo = costo.tipo.toLowerCase();
        if (tipo.includes('mano') || tipo.includes('obra') || tipo.includes('personal')) {
          desglose.mano_obra += costo.monto;
        } else if (tipo.includes('material')) {
          desglose.materiales += costo.monto;
        } else if (tipo.includes('equipo') || tipo.includes('herramienta')) {
          desglose.equipos += costo.monto;
        } else if (tipo.includes('transport') || tipo.includes('viaje')) {
          desglose.transporte += costo.monto;
        } else {
          desglose.otros += costo.monto;
        }
      }

      const costo_real = Object.values(desglose).reduce((a, b) => a + b, 0);
      const presupuesto = orden.presupuestoEstimado ?? 0;
      const desviacion =
        presupuesto > 0
          ? parseFloat((((costo_real - presupuesto) / presupuesto) * 100).toFixed(1))
          : 0;

      return {
        orden_id: orden.id,
        numero_orden: orden.numero,
        cliente: orden.cliente,
        presupuesto,
        costo_real,
        desglose,
        desviacion,
        estado: orden.estado,
      };
    });
  }

  /**
   * Obtiene tendencias de KPIs en período.
   */
  async getTendencias(
    desde: Date,
    hasta: Date,
    granularidad: 'DIA' | 'SEMANA' | 'MES'
  ): Promise<IKpiTendencias> {
    // Implementación simplificada - agrupa por fecha
    const ordenes = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: desde, lte: hasta },
      },
      include: { costos: true },
      orderBy: { createdAt: 'asc' },
    });

    // Agrupar por período
    const grupos = new Map<string, { ordenes: number; costos: number; completadas: number }>();

    for (const orden of ordenes) {
      const fecha = this.formatFechaByGranularidad(orden.createdAt, granularidad);

      if (!grupos.has(fecha)) {
        grupos.set(fecha, { ordenes: 0, costos: 0, completadas: 0 });
      }

      const grupo = grupos.get(fecha)!;
      grupo.ordenes++;
      grupo.costos += orden.costos.reduce((sum, c) => sum + c.monto, 0);
      if (orden.estado === 'completada') {
        grupo.completadas++;
      }
    }

    const ordenes_completadas: ITendencia[] = [];
    const costos: ITendencia[] = [];

    grupos.forEach((valores, fecha) => {
      ordenes_completadas.push({ fecha, valor: valores.completadas });
      costos.push({ fecha, valor: valores.costos });
    });

    return {
      ordenes_completadas,
      costos,
      tiempo_ciclo: [], // TODO: Implementar
      periodo: { desde, hasta, granularidad },
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  private isCacheValid(): boolean {
    if (!this.cacheTimestamp) return false;
    const elapsed = Date.now() - this.cacheTimestamp.getTime();
    return elapsed < this.CACHE_DURATION_MS;
  }

  private invalidateCache(): void {
    this.cachedMetrics = null;
    this.cacheTimestamp = null;
  }

  private formatFechaByGranularidad(fecha: Date, granularidad: 'DIA' | 'SEMANA' | 'MES'): string {
    const year = fecha.getFullYear();
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const day = fecha.getDate().toString().padStart(2, '0');

    switch (granularidad) {
      case 'DIA':
        return `${year}-${month}-${day}`;
      case 'SEMANA':
        const week = this.getWeekNumber(fecha);
        return `${year}-W${week.toString().padStart(2, '0')}`;
      case 'MES':
        return `${year}-${month}`;
    }
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  /**
   * Scheduler: Limpiar caché cada 5 minutos.
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  private resetCache(): void {
    this.invalidateCache();
    this.logger.debug('🔄 Caché de KPIs invalidado');
  }
}
