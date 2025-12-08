import { prisma } from '../../config/database.js';
import { logger } from '../../config/logger.js';

export interface DashboardMetricas {
    totalOrdenes: number;
    ordenesActivas: number;
    ordenesCompletadas: number;
    ordenesRetrasadas: number;
    tasaCumplimiento: number;
    tiempoPromedioCiclo: number;
}

export interface OrdenEstado {
    estado: string;
    cantidad: number;
}

export interface AnalisisCostos {
    montoEstimado: number;
    montoReal: number;
    varianza: number;
    porcentajeVarianza: number;
}

export interface ActividadReciente {
    ordenesCreadas: number;
    ordenesCompletadas: number;
    cambios: number;
}

// Helper type for order with cost
interface OrdenConFechas {
    fechaInicio: Date | null;
    fechaFin: Date | null;
}

interface CostoItem {
    monto: number;
}

export class DashboardService {
    /**
     * Obtener métricas principales del dashboard
     */
    async getMetricas(): Promise<DashboardMetricas> {
        try {
            const [
                totalOrdenes,
                ordenesActivas,
                ordenesCompletadas,
                ordenesRetrasadas,
                tasaCumplimiento,
                tiempoPromedioCiclo,
            ] = await Promise.all([
                this.getTotalOrdenes(),
                this.getOrdenesActivas(),
                this.getOrdenesCompletadas(),
                this.getOrdenesRetrasadas(),
                this.getTasaCumplimiento(),
                this.getTiempoPromedioCiclo(),
            ]);

            return {
                totalOrdenes,
                ordenesActivas,
                ordenesCompletadas,
                ordenesRetrasadas,
                tasaCumplimiento,
                tiempoPromedioCiclo,
            };
        } catch (error) {
            logger.error('Error al obtener métricas:', error);
            throw error;
        }
    }

    private async getTotalOrdenes(): Promise<number> {
        return prisma.order.count();
    }

    private async getOrdenesActivas(): Promise<number> {
        return prisma.order.count({
            where: {
                estado: {
                    in: ['planeacion', 'ejecucion'],
                },
            },
        });
    }

    private async getOrdenesCompletadas(): Promise<number> {
        return prisma.order.count({
            where: { estado: 'completada' },
        });
    }

    private async getOrdenesRetrasadas(): Promise<number> {
        const ahora = new Date();
        return prisma.order.count({
            where: {
                fechaFinEstimada: { lt: ahora },
                estado: { notIn: ['completada', 'cancelada'] },
            },
        });
    }

    private async getTasaCumplimiento(): Promise<number> {
        const total = await this.getTotalOrdenes();
        if (total === 0) return 0;

        const completadas = await this.getOrdenesCompletadas();
        return Math.round((completadas / total) * 100);
    }

    private async getTiempoPromedioCiclo(): Promise<number> {
        const ordenes = await prisma.order.findMany({
            where: {
                estado: 'completada',
                fechaFin: { not: null },
                fechaInicio: { not: null },
            },
            select: {
                fechaInicio: true,
                fechaFin: true,
            },
        });

        if (ordenes.length === 0) return 0;

        const tiempos = ordenes.map((o: OrdenConFechas) => {
            const inicio = new Date(o.fechaInicio!).getTime();
            const fin = new Date(o.fechaFin!).getTime();
            return (fin - inicio) / (1000 * 60 * 60); // en horas
        });

        const promedio = tiempos.reduce((a: number, b: number) => a + b, 0) / tiempos.length;
        return Math.round(promedio);
    }

    /**
     * Órdenes agrupadas por estado (para gráficos)
     */
    async getOrdenesEstado(): Promise<OrdenEstado[]> {
        try {
            const resultado = await prisma.order.groupBy({
                by: ['estado'],
                _count: true,
            });

            return resultado.map((item: { estado: string; _count: number }) => ({
                estado: item.estado,
                cantidad: item._count,
            }));
        } catch (error) {
            logger.error('Error al obtener órdenes por estado:', error);
            throw error;
        }
    }

    /**
     * Análisis de costos
     */
    async getAnalisisCostos(): Promise<AnalisisCostos> {
        try {
            const costos = await prisma.cost.findMany({
                include: {
                    orden: {
                        select: { estado: true },
                    },
                },
            });

            if (costos.length === 0) {
                return { montoEstimado: 0, montoReal: 0, varianza: 0, porcentajeVarianza: 0 };
            }

            const montoReal = costos.reduce((sum: number, c: CostoItem) => sum + c.monto, 0);
            // Estimado sería el monto planeado (simplificado aquí)
            const montoEstimado = montoReal * 0.9; // Placeholder
            const varianza = montoReal - montoEstimado;
            const porcentajeVarianza = montoEstimado > 0 ? (varianza / montoEstimado) * 100 : 0;

            return {
                montoEstimado: Math.round(montoEstimado),
                montoReal: Math.round(montoReal),
                varianza: Math.round(varianza),
                porcentajeVarianza: Math.round(porcentajeVarianza),
            };
        } catch (error) {
            logger.error('Error al obtener análisis de costos:', error);
            throw error;
        }
    }

    /**
     * Órdenes próximas a vencer
     */
    async getOrdenesPorVencer(dias: number = 3) {
        try {
            const ahora = new Date();
            const fecha = new Date(ahora.getTime() + dias * 24 * 60 * 60 * 1000);

            return await prisma.order.findMany({
                where: {
                    fechaFinEstimada: {
                        gte: ahora,
                        lte: fecha,
                    },
                    estado: { notIn: ['completada', 'cancelada'] },
                },
                include: {
                    asignado: { select: { name: true, email: true } },
                },
                orderBy: { fechaFinEstimada: 'asc' },
                take: 10,
            });
        } catch (error) {
            logger.error('Error al obtener órdenes por vencer:', error);
            throw error;
        }
    }

    /**
     * Actividad reciente
     */
    async getActividadReciente(diasAtras: number = 7): Promise<ActividadReciente> {
        try {
            const fecha = new Date(Date.now() - diasAtras * 24 * 60 * 60 * 1000);

            const [creadas, completadas, cambios] = await Promise.all([
                prisma.order.count({
                    where: { createdAt: { gte: fecha } },
                }),
                prisma.order.count({
                    where: {
                        estado: 'completada',
                        updatedAt: { gte: fecha },
                    },
                }),
                prisma.auditLog.count({
                    where: { createdAt: { gte: fecha } },
                }),
            ]);

            return {
                ordenesCreadas: creadas,
                ordenesCompletadas: completadas,
                cambios,
            };
        } catch (error) {
            logger.error('Error al obtener actividad reciente:', error);
            throw error;
        }
    }

    /**
     * Órdenes por prioridad
     */
    async getOrdenesPorPrioridad() {
        try {
            const resultado = await prisma.order.groupBy({
                by: ['prioridad'],
                _count: true,
                where: {
                    estado: { notIn: ['completada', 'cancelada'] },
                },
            });

            return resultado.map((item: { prioridad: string; _count: number }) => ({
                prioridad: item.prioridad,
                cantidad: item._count,
            }));
        } catch (error) {
            logger.error('Error al obtener órdenes por prioridad:', error);
            throw error;
        }
    }

    /**
     * Resumen de técnicos
     */
    async getResumenTecnicos() {
        try {
            const tecnicos = await prisma.user.findMany({
                where: { role: 'tecnico', active: true },
                select: {
                    id: true,
                    name: true,
                    asignaciones: {
                        where: { estado: { notIn: ['completada', 'cancelada'] } },
                        select: { id: true },
                    },
                },
            });

            return tecnicos.map((t: { id: string; name: string; asignaciones: { id: string }[] }) => ({
                id: t.id,
                nombre: t.name,
                ordenesActivas: t.asignaciones.length,
            }));
        } catch (error) {
            logger.error('Error al obtener resumen de técnicos:', error);
            throw error;
        }
    }
}

export const dashboardService = new DashboardService();
