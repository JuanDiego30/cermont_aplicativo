/**
 * @service KpisService
 *
 * Servicio para calcular KPIs y métricas del dashboard.
 */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface DashboardKPIs {
    ordenes: {
        total: number;
        enProceso: number;
        completadas: number;
        canceladas: number;
        porPrioridad: Record<string, number>;
        porSubEstado: Record<string, number>;
    };
    financiero: {
        facturado: number;
        porCobrar: number;
        costoTotal: number;
        margenPromedio: number;
        varianzaPromedio: number;
    };
    tiempos: {
        promedioEjecucionDias: number;
        promedioActaAFirmaDias: number;
        promedioSESAprobacionDias: number;
    };
    alertas: {
        total: number;
        criticas: number;
        porTipo: Record<string, number>;
    };
    tendencia: {
        ordenesPorMes: { mes: string; cantidad: number }[];
        ingresosPorMes: { mes: string; monto: number }[];
    };
}

@Injectable()
export class KpisService {
    private readonly logger = new Logger(KpisService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Obtener KPIs principales del dashboard
     */
    async getDashboardKPIs(): Promise<DashboardKPIs> {
        const [ordenes, financiero, tiempos, alertas, tendencia] = await Promise.all([
            this.getOrdenesKPIs(),
            this.getFinancieroKPIs(),
            this.getTiemposKPIs(),
            this.getAlertasKPIs(),
            this.getTendenciaKPIs(),
        ]);

        return {
            ordenes,
            financiero,
            tiempos,
            alertas,
            tendencia,
        };
    }

    /**
     * KPIs de órdenes
     */
    private async getOrdenesKPIs() {
        const [total, estados, prioridades, subEstados] = await Promise.all([
            this.prisma.order.count(),
            this.prisma.order.groupBy({
                by: ['estado'],
                _count: true,
            }),
            this.prisma.order.groupBy({
                by: ['prioridad'],
                _count: true,
            }),
            this.prisma.order.groupBy({
                by: ['subEstado'],
                _count: true,
            }),
        ]);

        const estadosMap = estados.reduce((acc, e) => {
            acc[e.estado] = e._count;
            return acc;
        }, {} as Record<string, number>);

        return {
            total,
            enProceso: (estadosMap['planeacion'] || 0) + (estadosMap['ejecucion'] || 0),
            completadas: estadosMap['completada'] || 0,
            canceladas: estadosMap['cancelada'] || 0,
            porPrioridad: prioridades.reduce((acc, p) => {
                acc[p.prioridad] = p._count;
                return acc;
            }, {} as Record<string, number>),
            porSubEstado: subEstados.reduce((acc, s) => {
                acc[s.subEstado] = s._count;
                return acc;
            }, {} as Record<string, number>),
        };
    }

    /**
     * KPIs financieros
     */
    private async getFinancieroKPIs() {
        // Total facturado (facturas aprobadas/pagadas)
        const facturas = await this.prisma.factura.findMany({
            where: { estado: { in: ['APROBADA', 'PAGADA'] } },
            select: { valorTotal: true },
        });
        const facturado = facturas.reduce((sum, f) => sum + f.valorTotal, 0);

        // Por cobrar (facturas enviadas no pagadas)
        const porCobrarResult = await this.prisma.factura.findMany({
            where: { estado: { in: ['GENERADA', 'ENVIADA', 'APROBADA'] } },
            select: { valorTotal: true },
        });
        const porCobrar = porCobrarResult.reduce((sum, f) => sum + f.valorTotal, 0);

        // Costos totales
        const costos = await this.prisma.cost.aggregate({
            _sum: { monto: true },
        });

        // Comparativas para margen y varianza promedio
        const comparativas = await this.prisma.comparativaCostos.findMany({
            select: { margenRealizado: true, varianzaPorcentaje: true },
        });

        const margenPromedio = comparativas.length > 0
            ? comparativas.reduce((sum, c) => sum + c.margenRealizado, 0) / comparativas.length
            : 0;

        const varianzaPromedio = comparativas.length > 0
            ? comparativas.reduce((sum, c) => sum + c.varianzaPorcentaje, 0) / comparativas.length
            : 0;

        return {
            facturado,
            porCobrar,
            costoTotal: costos._sum.monto || 0,
            margenPromedio,
            varianzaPromedio,
        };
    }

    /**
     * KPIs de tiempos
     */
    private async getTiemposKPIs() {
        // Promedio días de ejecución
        const ordenesCompletadas = await this.prisma.order.findMany({
            where: { estado: 'completada', fechaInicio: { not: null }, fechaFin: { not: null } },
            select: { fechaInicio: true, fechaFin: true },
        });

        const promedioEjecucionDias = ordenesCompletadas.length > 0
            ? ordenesCompletadas.reduce((sum, o) => {
                const dias = Math.ceil((o.fechaFin!.getTime() - o.fechaInicio!.getTime()) / (1000 * 60 * 60 * 24));
                return sum + dias;
            }, 0) / ordenesCompletadas.length
            : 0;

        // Promedio días acta a firma
        const actasFirmadas = await this.prisma.acta.findMany({
            where: { estado: 'FIRMADA', fechaFirma: { not: null } },
            select: { fechaEmision: true, fechaFirma: true },
        });

        const promedioActaAFirmaDias = actasFirmadas.length > 0
            ? actasFirmadas.reduce((sum, a) => {
                const dias = Math.ceil((a.fechaFirma!.getTime() - a.fechaEmision.getTime()) / (1000 * 60 * 60 * 24));
                return sum + dias;
            }, 0) / actasFirmadas.length
            : 0;

        // Promedio SES a aprobación
        const sesAprobadas = await this.prisma.sES.findMany({
            where: { estado: 'APROBADA', fechaAprobacion: { not: null } },
            select: { fechaCreacion: true, fechaAprobacion: true },
        });

        const promedioSESAprobacionDias = sesAprobadas.length > 0
            ? sesAprobadas.reduce((sum, s) => {
                const dias = Math.ceil((s.fechaAprobacion!.getTime() - s.fechaCreacion.getTime()) / (1000 * 60 * 60 * 24));
                return sum + dias;
            }, 0) / sesAprobadas.length
            : 0;

        return {
            promedioEjecucionDias: Math.round(promedioEjecucionDias * 10) / 10,
            promedioActaAFirmaDias: Math.round(promedioActaAFirmaDias * 10) / 10,
            promedioSESAprobacionDias: Math.round(promedioSESAprobacionDias * 10) / 10,
        };
    }

    /**
     * KPIs de alertas
     */
    private async getAlertasKPIs() {
        const [total, criticas, porTipo] = await Promise.all([
            this.prisma.alertaAutomatica.count({ where: { resuelta: false } }),
            this.prisma.alertaAutomatica.count({ where: { resuelta: false, prioridad: 'CRITICAL' } }),
            this.prisma.alertaAutomatica.groupBy({
                by: ['tipo'],
                where: { resuelta: false },
                _count: true,
            }),
        ]);

        return {
            total,
            criticas,
            porTipo: porTipo.reduce((acc, item) => {
                acc[item.tipo] = item._count;
                return acc;
            }, {} as Record<string, number>),
        };
    }

    /**
     * Tendencias mensuales (últimos 12 meses)
     */
    private async getTendenciaKPIs() {
        const hace12Meses = new Date();
        hace12Meses.setMonth(hace12Meses.getMonth() - 12);

        // Órdenes por mes
        const ordenes = await this.prisma.order.findMany({
            where: { createdAt: { gte: hace12Meses } },
            select: { createdAt: true },
        });

        const ordenesPorMes = this.agruparPorMes(ordenes.map(o => o.createdAt));

        // Ingresos por mes (facturas pagadas)
        const facturas = await this.prisma.factura.findMany({
            where: {
                estado: 'PAGADA',
                fechaPago: { gte: hace12Meses },
            },
            select: { fechaPago: true, valorTotal: true },
        });

        const ingresosPorMesMap = new Map<string, number>();
        for (const f of facturas) {
            if (f.fechaPago) {
                const mes = f.fechaPago.toISOString().slice(0, 7);
                ingresosPorMesMap.set(mes, (ingresosPorMesMap.get(mes) || 0) + f.valorTotal);
            }
        }

        const ingresosPorMes = Array.from(ingresosPorMesMap.entries())
            .map(([mes, monto]) => ({ mes, monto }))
            .sort((a, b) => a.mes.localeCompare(b.mes));

        return {
            ordenesPorMes,
            ingresosPorMes,
        };
    }

    private agruparPorMes(fechas: Date[]): { mes: string; cantidad: number }[] {
        const conteo = new Map<string, number>();
        for (const fecha of fechas) {
            const mes = fecha.toISOString().slice(0, 7);
            conteo.set(mes, (conteo.get(mes) || 0) + 1);
        }
        return Array.from(conteo.entries())
            .map(([mes, cantidad]) => ({ mes, cantidad }))
            .sort((a, b) => a.mes.localeCompare(b.mes));
    }

    /**
     * KPIs de una orden específica
     */
    async getOrdenKPIs(ordenId: string) {
        const orden = await this.prisma.order.findUnique({
            where: { id: ordenId },
            include: {
                propuesta: true,
                costos: true,
                comparativa: true,
                stateHistory: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!orden) return null;

        const costoReal = orden.costos.reduce((sum, c) => sum + c.monto, 0);
        const costoEstimado = orden.propuesta?.total || 0;
        const varianza = costoEstimado > 0 ? ((costoReal - costoEstimado) / costoEstimado) * 100 : 0;

        return {
            orden: {
                id: orden.id,
                numero: orden.numero,
                estado: orden.estado,
                subEstado: orden.subEstado,
            },
            financiero: {
                estimado: costoEstimado,
                real: costoReal,
                varianza: Math.round(varianza * 100) / 100,
                margen: costoEstimado - costoReal,
            },
            historialEstados: orden.stateHistory.length,
            tiempoEnProceso: orden.fechaInicio
                ? Math.ceil((new Date().getTime() - orden.fechaInicio.getTime()) / (1000 * 60 * 60 * 24))
                : 0,
        };
    }
}
