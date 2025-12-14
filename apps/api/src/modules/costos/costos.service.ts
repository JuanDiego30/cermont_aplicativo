/**
 * @service CostosService
 * @description Servicio de gestión y análisis de costos
 * 
 * Principios aplicados:
 * - SRP: Métodos enfocados en una responsabilidad
 * - DRY: Lógica de cálculos centralizada
 * - Type Safety: Sin uso de 'any'
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// =====================================================
// INTERFACES Y TIPOS
// =====================================================

/**
 * Estructura de costos por categoría
 */
export interface CostBreakdown {
  manoDeObra: number;
  materiales: number;
  equipos: number;
  transporte: number;
  subtotal: number;
  impuestos: number;
  total: number;
}

/**
 * Varianza entre presupuestado y real
 */
export interface CostVariance {
  manoDeObra: number;
  materiales: number;
  equipos: number;
  transporte: number;
  total: number;
  porcentaje: number;
}

/**
 * Estado del presupuesto
 */
export type BudgetStatus = 'DENTRO_PRESUPUESTO' | 'ALERTA' | 'SOBRE_PRESUPUESTO';

/**
 * Análisis completo de costos de una orden
 */
export interface CostAnalysis {
  ordenId: string;
  ordenNumero: string;
  presupuestado: CostBreakdown;
  real: CostBreakdown;
  varianza: CostVariance;
  estado: BudgetStatus;
}

/**
 * DTO para crear un costo
 */
interface CreateCostoDto {
  ordenId: string;
  concepto: string;
  monto: number;
  tipo: string;
  descripcion?: string;
}

/**
 * DTO para actualizar un costo
 */
interface UpdateCostoDto {
  concepto?: string;
  monto?: number;
  tipo?: string;
  descripcion?: string;
}

/**
 * DTO para crear tracking de costos completo
 */
interface CreateCostTrackingDto {
  manoDeObra?: number;
  materiales?: number;
  equipos?: number;
  transporte?: number;
  descripcion?: string;
}

/**
 * Tipo para costo de Prisma
 */
interface PrismaCost {
  id: string;
  monto: number;
  tipo: string;
  concepto: string;
  descripcion: string | null;
}

/**
 * Tipo para orden con relaciones de Prisma
 */
interface OrderWithRelations {
  id: string;
  numero: string;
  presupuestoEstimado: number | null;
  planeacion: unknown;
  costos: PrismaCost[];
  ejecucion: unknown;
}

/**
 * Constantes de configuración
 */
const IVA_RATE_COLOMBIA = 0.19;
const BUDGET_THRESHOLD_WARNING = 10; // 10%
const BUDGET_THRESHOLD_CRITICAL = 20; // 20%

@Injectable()
export class CostosService {
  private readonly IVA_RATE = IVA_RATE_COLOMBIA;

  constructor(private readonly prisma: PrismaService) {}

  // =====================================================
  // OPERACIONES CRUD BÁSICAS
  // =====================================================

  /**
   * Obtener costos de una orden
   */
  async findByOrden(ordenId: string) {
    const costos = await this.prisma.cost.findMany({
      where: { orderId: ordenId },
      orderBy: { createdAt: 'desc' },
    });

    const total = this.sumCostos(costos);

    return { data: costos, total };
  }

  /**
   * Crear un nuevo costo
   */
  async create(dto: CreateCostoDto) {
    const costo = await this.prisma.cost.create({
      data: {
        orderId: dto.ordenId,
        concepto: dto.concepto,
        monto: dto.monto,
        tipo: dto.tipo,
        descripcion: dto.descripcion ?? null,
      },
    });

    return { message: 'Costo agregado', data: costo };
  }

  /**
   * Actualizar un costo
   */
  async update(id: string, dto: UpdateCostoDto) {
    const costo = await this.prisma.cost.update({
      where: { id },
      data: {
        concepto: dto.concepto,
        monto: dto.monto,
        tipo: dto.tipo,
        descripcion: dto.descripcion,
      },
    });

    return { message: 'Costo actualizado', data: costo };
  }

  /**
   * Eliminar un costo
   */
  async remove(id: string) {
    await this.prisma.cost.delete({ where: { id } });
    return { message: 'Costo eliminado' };
  }

  // =====================================================
  // ANÁLISIS DE COSTOS REAL VS PRESUPUESTADO
  // =====================================================

  /**
   * Obtener análisis de costos para una orden
   */
  async getCostAnalysis(ordenId: string): Promise<CostAnalysis> {
    const orden = await this.prisma.order.findUnique({
      where: { id: ordenId },
      include: {
        planeacion: true,
        costos: true,
        ejecucion: true,
      },
    });

    if (!orden) {
      throw new NotFoundException('Orden no encontrada');
    }

    // Calcular costos
    const presupuesto = this.calculateBudgetedCosts(orden);
    const real = this.calculateRealCosts(orden.costos ?? []);
    const varianza = this.calculateVariance(presupuesto, real);
    const estado = this.determineBudgetStatus(varianza.porcentaje);

    return {
      ordenId: orden.id,
      ordenNumero: orden.numero,
      presupuestado: presupuesto,
      real,
      varianza,
      estado,
    };
  }

  /**
   * Calcula costos presupuestados desde la orden
   */
  private calculateBudgetedCosts(orden: OrderWithRelations): CostBreakdown {
    const presupuestoBase = orden.presupuestoEstimado ?? 0;

    // Distribución por defecto si no hay desglose
    const manoDeObra = presupuestoBase * 0.4;
    const materiales = presupuestoBase * 0.35;
    const equipos = presupuestoBase * 0.15;
    const transporte = presupuestoBase * 0.1;

    return this.buildCostBreakdown(manoDeObra, materiales, equipos, transporte);
  }

  /**
   * Calcula costos reales desde registros
   */
  private calculateRealCosts(costos: PrismaCost[]): CostBreakdown {
    const manoDeObra = this.sumByTipo(costos, 'MANO_OBRA');
    const materiales = this.sumByTipo(costos, 'MATERIAL');
    const equipos = this.sumByTipo(costos, 'EQUIPO');
    const transporte = this.sumByTipo(costos, 'TRANSPORTE');

    return this.buildCostBreakdown(manoDeObra, materiales, equipos, transporte);
  }

  /**
   * Calcula varianza entre presupuesto y real
   */
  private calculateVariance(presupuesto: CostBreakdown, real: CostBreakdown): CostVariance {
    const varianzaTotal = real.total - presupuesto.total;
    const porcentaje = presupuesto.total > 0
      ? Number(((varianzaTotal / presupuesto.total) * 100).toFixed(2))
      : 0;

    return {
      manoDeObra: real.manoDeObra - presupuesto.manoDeObra,
      materiales: real.materiales - presupuesto.materiales,
      equipos: real.equipos - presupuesto.equipos,
      transporte: real.transporte - presupuesto.transporte,
      total: varianzaTotal,
      porcentaje,
    };
  }

  /**
   * Determina el estado del presupuesto según la varianza
   */
  private determineBudgetStatus(varianzaPorcentaje: number): BudgetStatus {
    if (varianzaPorcentaje > BUDGET_THRESHOLD_CRITICAL) {
      return 'SOBRE_PRESUPUESTO';
    }
    if (varianzaPorcentaje > BUDGET_THRESHOLD_WARNING) {
      return 'ALERTA';
    }
    return 'DENTRO_PRESUPUESTO';
  }

  // =====================================================
  // MÉTODOS HELPER - DRY
  // =====================================================

  /**
   * Construye breakdown de costos con IVA
   */
  private buildCostBreakdown(
    manoDeObra: number,
    materiales: number,
    equipos: number,
    transporte: number,
  ): CostBreakdown {
    const subtotal = manoDeObra + materiales + equipos + transporte;
    const impuestos = subtotal * this.IVA_RATE;
    const total = subtotal + impuestos;

    return {
      manoDeObra,
      materiales,
      equipos,
      transporte,
      subtotal,
      impuestos,
      total,
    };
  }

  /**
   * Suma costos por tipo
   */
  private sumByTipo(costos: PrismaCost[], tipo: string): number {
    return costos
      .filter((c) => c.tipo === tipo)
      .reduce((sum, c) => sum + c.monto, 0);
  }

  /**
   * Suma total de costos
   */
  private sumCostos(costos: Array<{ monto: number }>): number {
    return costos.reduce((sum, c) => sum + c.monto, 0);
  }

  // =====================================================
  // REPORTES Y DASHBOARD
  // =====================================================

  /**
   * Obtener reporte de costos general
   */
  async getCostReport(dateRange?: { start: Date; end: Date }) {
    const whereClause: Record<string, unknown> = {};

    if (dateRange?.start && dateRange?.end) {
      whereClause.createdAt = {
        gte: dateRange.start,
        lte: dateRange.end,
      };
    }

    const ordenes = await this.prisma.order.findMany({
      where: whereClause,
      include: {
        costos: true,
        planeacion: true,
      },
    });

    const analyses = await this.analyzeMultipleOrders(ordenes);
    const totales = this.calculateTotals(analyses);

    return {
      totalOrdenes: analyses.length,
      totales,
      ordenesPorEstado: this.countByStatus(analyses),
      detalles: analyses.map((a) => this.toReportDetail(a)),
    };
  }

  /**
   * Crear registro de costos completo para una orden
   */
  async createCostTracking(ordenId: string, dto: CreateCostTrackingDto) {
    const orden = await this.prisma.order.findUnique({ where: { id: ordenId } });
    if (!orden) {
      throw new NotFoundException('Orden no encontrada');
    }

    const costosTipos = [
      { tipo: 'MANO_OBRA', monto: dto.manoDeObra ?? 0, concepto: 'Mano de obra' },
      { tipo: 'MATERIAL', monto: dto.materiales ?? 0, concepto: 'Materiales' },
      { tipo: 'EQUIPO', monto: dto.equipos ?? 0, concepto: 'Equipos' },
      { tipo: 'TRANSPORTE', monto: dto.transporte ?? 0, concepto: 'Transporte' },
    ];

    const costosCreados = await this.createMultipleCosts(
      ordenId,
      costosTipos,
      dto.descripcion,
    );

    const analysis = await this.getCostAnalysis(ordenId);

    return {
      message: 'Registro de costos creado',
      costosCreados: costosCreados.length,
      analysis,
    };
  }

  /**
   * Obtener dashboard de costos para el frontend
   */
  async getCostDashboard() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ordenesRecientes = await this.prisma.order.findMany({
      where: {
        estado: { in: ['completada', 'ejecucion'] },
        createdAt: { gte: thirtyDaysAgo },
      },
      include: {
        costos: true,
        planeacion: true,
      },
      take: 20,
    });

    const analyses = await this.analyzeMultipleOrders(ordenesRecientes);

    return {
      metricas: this.calculateDashboardMetrics(analyses),
      alertas: this.countByStatus(analyses),
      topSobrePresupuesto: this.getTopOverBudget(analyses, 5),
      topBajoPresupuesto: this.getTopUnderBudget(analyses, 5),
    };
  }

  // =====================================================
  // MÉTODOS PRIVADOS PARA REPORTES
  // =====================================================

  /**
   * Analiza múltiples órdenes
   */
  private async analyzeMultipleOrders(
    ordenes: Array<{ id: string }>,
  ): Promise<CostAnalysis[]> {
    const analyses: CostAnalysis[] = [];

    for (const orden of ordenes) {
      try {
        const analysis = await this.getCostAnalysis(orden.id);
        analyses.push(analysis);
      } catch {
        // Skip orders with errors
      }
    }

    return analyses;
  }

  /**
   * Calcula totales de análisis
   */
  private calculateTotals(analyses: CostAnalysis[]) {
    const presupuestado = analyses.reduce((sum, a) => sum + a.presupuestado.total, 0);
    const real = analyses.reduce((sum, a) => sum + a.real.total, 0);
    const varianza = real - presupuestado;
    const varianzaPorcentaje = presupuestado > 0
      ? Number(((varianza / presupuestado) * 100).toFixed(2))
      : 0;

    return {
      presupuestado,
      real,
      varianza,
      varianzaPorcentaje,
    };
  }

  /**
   * Cuenta órdenes por estado
   */
  private countByStatus(analyses: CostAnalysis[]) {
    return {
      dentroPresupuesto: analyses.filter((a) => a.estado === 'DENTRO_PRESUPUESTO').length,
      alerta: analyses.filter((a) => a.estado === 'ALERTA').length,
      sobrePresupuesto: analyses.filter((a) => a.estado === 'SOBRE_PRESUPUESTO').length,
    };
  }

  /**
   * Convierte análisis a detalle de reporte
   */
  private toReportDetail(analysis: CostAnalysis) {
    return {
      ordenNumero: analysis.ordenNumero,
      presupuestado: analysis.presupuestado.total,
      real: analysis.real.total,
      varianza: analysis.varianza.total,
      varianzaPorcentaje: analysis.varianza.porcentaje,
      estado: analysis.estado,
    };
  }

  /**
   * Crea múltiples costos
   */
  private async createMultipleCosts(
    ordenId: string,
    costos: Array<{ tipo: string; monto: number; concepto: string }>,
    descripcion?: string,
  ) {
    const creados = [];

    for (const costo of costos) {
      if (costo.monto > 0) {
        const created = await this.prisma.cost.create({
          data: {
            orderId: ordenId,
            concepto: costo.concepto,
            monto: costo.monto,
            tipo: costo.tipo,
            descripcion: descripcion ?? null,
          },
        });
        creados.push(created);
      }
    }

    return creados;
  }

  /**
   * Calcula métricas del dashboard
   */
  private calculateDashboardMetrics(analyses: CostAnalysis[]) {
    const totales = this.calculateTotals(analyses);

    return {
      ...totales,
      ordenesAnalizadas: analyses.length,
    };
  }

  /**
   * Obtiene top N órdenes sobre presupuesto
   */
  private getTopOverBudget(analyses: CostAnalysis[], limit: number) {
    return analyses
      .filter((a) => a.varianza.total > 0)
      .sort((a, b) => b.varianza.total - a.varianza.total)
      .slice(0, limit)
      .map((a) => ({
        ordenNumero: a.ordenNumero,
        varianza: a.varianza.total,
        porcentaje: a.varianza.porcentaje,
      }));
  }

  /**
   * Obtiene top N órdenes bajo presupuesto
   */
  private getTopUnderBudget(analyses: CostAnalysis[], limit: number) {
    return analyses
      .filter((a) => a.varianza.total < 0)
      .sort((a, b) => a.varianza.total - b.varianza.total)
      .slice(0, limit)
      .map((a) => ({
        ordenNumero: a.ordenNumero,
        ahorro: Math.abs(a.varianza.total),
        porcentaje: a.varianza.porcentaje,
      }));
  }
}
