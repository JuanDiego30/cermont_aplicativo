import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CostAnalysis {
    ordenId: string;
    ordenNumero: string;
    presupuestado: {
        manoDeObra: number;
        materiales: number;
        equipos: number;
        transporte: number;
        subtotal: number;
        impuestos: number;
        total: number;
    };
    real: {
        manoDeObra: number;
        materiales: number;
        equipos: number;
        transporte: number;
        subtotal: number;
        impuestos: number;
        total: number;
    };
    varianza: {
        manoDeObra: number;
        materiales: number;
        equipos: number;
        transporte: number;
        total: number;
        porcentaje: number;
    };
    estado: 'DENTRO_PRESUPUESTO' | 'ALERTA' | 'SOBRE_PRESUPUESTO';
}

@Injectable()
export class CostosService {
    private readonly IVA_RATE = 0.19; // 19% IVA Colombia

    constructor(private readonly prisma: PrismaService) { }

    // Obtener costos de una orden
    async findByOrden(ordenId: string) {
        const costos = await this.prisma.cost.findMany({
            where: { orderId: ordenId },
            orderBy: { createdAt: 'desc' },
        });

        const total = costos.reduce((sum, c) => sum + c.monto, 0);

        return { data: costos, total };
    }

    // Crear un nuevo costo
    async create(dto: any) {
        const costo = await this.prisma.cost.create({
            data: {
                orderId: dto.ordenId,
                concepto: dto.concepto,
                monto: dto.monto,
                tipo: dto.tipo,
                descripcion: dto.descripcion,
            },
        });
        return { message: 'Costo agregado', data: costo };
    }

    // Actualizar un costo
    async update(id: string, dto: any) {
        const costo = await this.prisma.cost.update({
            where: { id },
            data: dto,
        });
        return { message: 'Costo actualizado', data: costo };
    }

    // Eliminar un costo
    async remove(id: string) {
        await this.prisma.cost.delete({ where: { id } });
        return { message: 'Costo eliminado' };
    }

    // =====================================================
    // ANÁLISIS DE COSTOS REAL VS PRESUPUESTADO
    // =====================================================

    // Obtener análisis de costos para una orden
    async getCostAnalysis(ordenId: string): Promise<CostAnalysis> {
        const orden = await this.prisma.order.findUnique({
            where: { id: ordenId },
            include: {
                planeacion: true,
                costos: true,
                ejecucion: true,
            },
        });

        if (!orden) throw new NotFoundException('Orden no encontrada');

        // Obtener costos presupuestados desde la planeación
        const presupuesto = this.calculateBudgetedCosts(orden);

        // Obtener costos reales registrados
        const costosReales = orden.costos || [];
        const real = this.calculateRealCosts(costosReales);

        // Calcular varianza
        const varianza = this.calculateVariance(presupuesto, real);

        // Determinar estado
        let estado: CostAnalysis['estado'] = 'DENTRO_PRESUPUESTO';
        if (varianza.porcentaje > 20) {
            estado = 'SOBRE_PRESUPUESTO';
        } else if (varianza.porcentaje > 10) {
            estado = 'ALERTA';
        }

        return {
            ordenId: orden.id,
            ordenNumero: orden.numero,
            presupuestado: presupuesto,
            real,
            varianza,
            estado,
        };
    }

    // Calcular costos presupuestados
    private calculateBudgetedCosts(orden: any) {
        // Obtener costo estimado del kit si existe
        const kitCosto = orden.planeacion?.kit?.costoEstimado || 0;

        // Valores base del presupuesto (pueden venir de la orden o propuesta)
        const manoDeObra = orden.montoManoObra || orden.presupuestoEstimado * 0.4 || 0;
        const materiales = orden.montoMateriales || orden.presupuestoEstimado * 0.35 || 0;
        const equipos = orden.montoEquipos || orden.presupuestoEstimado * 0.15 || 0;
        const transporte = orden.montoTransporte || orden.presupuestoEstimado * 0.1 || 0;

        const subtotal = manoDeObra + materiales + equipos + transporte + kitCosto;
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

    // Calcular costos reales
    private calculateRealCosts(costos: any[]) {
        const manoDeObra = costos
            .filter((c) => c.tipo === 'MANO_OBRA')
            .reduce((sum, c) => sum + c.monto, 0);

        const materiales = costos
            .filter((c) => c.tipo === 'MATERIAL')
            .reduce((sum, c) => sum + c.monto, 0);

        const equipos = costos
            .filter((c) => c.tipo === 'EQUIPO')
            .reduce((sum, c) => sum + c.monto, 0);

        const transporte = costos
            .filter((c) => c.tipo === 'TRANSPORTE')
            .reduce((sum, c) => sum + c.monto, 0);

        const otros = costos
            .filter((c) => !['MANO_OBRA', 'MATERIAL', 'EQUIPO', 'TRANSPORTE'].includes(c.tipo))
            .reduce((sum, c) => sum + c.monto, 0);

        const subtotal = manoDeObra + materiales + equipos + transporte + otros;
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

    // Calcular varianza
    private calculateVariance(presupuesto: any, real: any) {
        const varianzaTotal = real.total - presupuesto.total;
        const porcentaje =
            presupuesto.total > 0
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

    // Obtener reporte de costos general
    async getCostReport(dateRange?: { start: Date; end: Date }) {
        const whereClause: any = {};

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

        const analyses: CostAnalysis[] = [];

        for (const orden of ordenes) {
            try {
                const analysis = await this.getCostAnalysis(orden.id);
                analyses.push(analysis);
            } catch (error) {
                // Skip orders with errors
            }
        }

        // Calcular totales
        const totales = {
            presupuestado: analyses.reduce((sum, a) => sum + a.presupuestado.total, 0),
            real: analyses.reduce((sum, a) => sum + a.real.total, 0),
            varianza: analyses.reduce((sum, a) => sum + a.varianza.total, 0),
            ordenesEnPresupuesto: analyses.filter((a) => a.estado === 'DENTRO_PRESUPUESTO').length,
            ordenesAlerta: analyses.filter((a) => a.estado === 'ALERTA').length,
            ordenesSobrePresupuesto: analyses.filter((a) => a.estado === 'SOBRE_PRESUPUESTO').length,
        };

        const varianzaPorcentaje =
            totales.presupuestado > 0
                ? Number(((totales.varianza / totales.presupuestado) * 100).toFixed(2))
                : 0;

        return {
            totalOrdenes: analyses.length,
            totales: {
                ...totales,
                varianzaPorcentaje,
            },
            ordenesPorEstado: {
                dentroPresupuesto: totales.ordenesEnPresupuesto,
                alerta: totales.ordenesAlerta,
                sobrePresupuesto: totales.ordenesSobrePresupuesto,
            },
            detalles: analyses.map((a) => ({
                ordenNumero: a.ordenNumero,
                presupuestado: a.presupuestado.total,
                real: a.real.total,
                varianza: a.varianza.total,
                varianzaPorcentaje: a.varianza.porcentaje,
                estado: a.estado,
            })),
        };
    }

    // Crear registro de costos completo para una orden
    async createCostTracking(ordenId: string, dto: any) {
        // Verificar que la orden existe
        const orden = await this.prisma.order.findUnique({ where: { id: ordenId } });
        if (!orden) throw new NotFoundException('Orden no encontrada');

        // Crear costos por categoría
        const costosTipos = [
            { tipo: 'MANO_OBRA', monto: dto.manoDeObra || 0, concepto: 'Mano de obra' },
            { tipo: 'MATERIAL', monto: dto.materiales || 0, concepto: 'Materiales' },
            { tipo: 'EQUIPO', monto: dto.equipos || 0, concepto: 'Equipos' },
            { tipo: 'TRANSPORTE', monto: dto.transporte || 0, concepto: 'Transporte' },
        ];

        const costosCreados = [];

        for (const costoData of costosTipos) {
            if (costoData.monto > 0) {
                const costo = await this.prisma.cost.create({
                    data: {
                        orderId: ordenId,
                        concepto: costoData.concepto,
                        monto: costoData.monto,
                        tipo: costoData.tipo,
                        descripcion: dto.descripcion || null,
                    },
                });
                costosCreados.push(costo);
            }
        }

        // Obtener análisis actualizado
        const analysis = await this.getCostAnalysis(ordenId);

        return {
            message: 'Registro de costos creado',
            costosCreados: costosCreados.length,
            analysis,
        };
    }

    // Obtener dashboard de costos para el frontend
    async getCostDashboard() {
        // Obtener órdenes completadas del último mes
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

        const analyses = [];

        for (const orden of ordenesRecientes) {
            try {
                const analysis = await this.getCostAnalysis(orden.id);
                analyses.push(analysis);
            } catch (error) {
                // Skip
            }
        }

        // Top 5 órdenes sobre presupuesto
        const sobrePresupuesto = analyses
            .filter((a) => a.varianza.total > 0)
            .sort((a, b) => b.varianza.total - a.varianza.total)
            .slice(0, 5);

        // Top 5 órdenes bajo presupuesto
        const bajoPresupuesto = analyses
            .filter((a) => a.varianza.total < 0)
            .sort((a, b) => a.varianza.total - b.varianza.total)
            .slice(0, 5);

        // Métricas generales
        const totalPresupuestado = analyses.reduce((sum, a) => sum + a.presupuestado.total, 0);
        const totalReal = analyses.reduce((sum, a) => sum + a.real.total, 0);
        const varianza = totalReal - totalPresupuestado;

        return {
            metricas: {
                totalPresupuestado,
                totalReal,
                varianza,
                varianzaPorcentaje:
                    totalPresupuestado > 0
                        ? Number(((varianza / totalPresupuestado) * 100).toFixed(2))
                        : 0,
                ordenesAnalizadas: analyses.length,
            },
            alertas: {
                sobrePresupuesto: analyses.filter((a) => a.estado === 'SOBRE_PRESUPUESTO').length,
                enAlerta: analyses.filter((a) => a.estado === 'ALERTA').length,
                dentroPresupuesto: analyses.filter((a) => a.estado === 'DENTRO_PRESUPUESTO').length,
            },
            topSobrePresupuesto: sobrePresupuesto.map((a) => ({
                ordenNumero: a.ordenNumero,
                varianza: a.varianza.total,
                porcentaje: a.varianza.porcentaje,
            })),
            topBajoPresupuesto: bajoPresupuesto.map((a) => ({
                ordenNumero: a.ordenNumero,
                ahorro: Math.abs(a.varianza.total),
                porcentaje: a.varianza.porcentaje,
            })),
        };
    }
}
