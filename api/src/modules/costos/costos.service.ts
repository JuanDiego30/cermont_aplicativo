// ============================================
// COSTOS SERVICE - Cermont FSM
// Costeo en Tiempo Real: Presupuesto vs Real
// ============================================

import { prisma } from '../../config/database.js';
import { logger } from '../../config/logger.js';
import { AppError } from '../../shared/errors/AppError.js';
import { z } from 'zod';


// ============================================
// SCHEMAS DE VALIDACIÓN
// ============================================

export const registrarCostoSchema = z.object({
    ordenId: z.string().uuid('ID de orden inválido'),
    concepto: z.string().min(1, 'Concepto requerido'),
    monto: z.number().positive('Monto debe ser positivo'),
    montoPresupuestado: z.number().nonnegative().optional(),
    tipo: z.enum(['material', 'mano_obra', 'transporte', 'equipo', 'otros']),
    descripcion: z.string().optional(),
    cantidad: z.number().int().positive().optional(),
    unidad: z.string().optional(),
});

export const filtrosCostosSchema = z.object({
    ordenId: z.string().uuid().optional(),
    tipo: z.enum(['material', 'mano_obra', 'transporte', 'equipo', 'otros']).optional(),
    fechaInicio: z.coerce.date().optional(),
    fechaFin: z.coerce.date().optional(),
});

// ============================================
// TYPES
// ============================================

export type RegistrarCostoDTO = z.infer<typeof registrarCostoSchema>;
export type FiltrosCostos = z.infer<typeof filtrosCostosSchema>;

export interface ResumenCostos {
    totalPresupuestado: number;
    totalReal: number;
    varianza: number;
    porcentajeVarianza: number;
    porTipo: {
        tipo: string;
        presupuestado: number;
        real: number;
        varianza: number;
    }[];
    alertas: {
        tipo: 'warning' | 'danger';
        mensaje: string;
    }[];
}

export interface ComparativoCostos {
    ordenNumero: string;
    cliente: string;
    estado: string;
    presupuestoKit: number;
    costoReal: number;
    varianza: number;
    porcentaje: number;
    desglose: {
        concepto: string;
        tipo: string;
        presupuestado: number;
        real: number;
        diferencia: number;
    }[];
}

// ============================================
// SERVICE
// ============================================

export class CostosService {
    /**
     * Registrar un nuevo costo
     */
    async registrarCosto(data: RegistrarCostoDTO, userId: string) {
        logger.info(`Usuario ${userId} registrando costo para orden ${data.ordenId}`);

        // Verificar que la orden existe
        const orden = await prisma.order.findUnique({
            where: { id: data.ordenId },
        });

        if (!orden) {
            throw AppError.notFound('Orden');
        }

        const costo = await prisma.cost.create({
            data: {
                orderId: data.ordenId,
                concepto: data.concepto,
                monto: data.monto,
                tipo: data.tipo,
                descripcion: data.descripcion || null,
            },
        });

        logger.info(`Costo registrado: ${costo.id} - $${data.monto}`);
        return costo;
    }

    /**
     * Obtener costos de una orden
     */
    async getCostosByOrden(ordenId: string) {
        const orden = await prisma.order.findUnique({
            where: { id: ordenId },
            include: {
                costos: {
                    orderBy: { createdAt: 'desc' },
                },
                planeacion: {
                    include: { kit: true },
                },
            },
        });

        if (!orden) {
            throw AppError.notFound('Orden');
        }

        return orden;
    }

    /**
     * Obtener resumen de costos de una orden
     */
    async getResumenCostos(ordenId: string): Promise<ResumenCostos> {
        const orden = await this.getCostosByOrden(ordenId);
        const costos = orden.costos;
        const kit = orden.planeacion?.kit;

        // Calcular totales
        const totalReal = costos.reduce((sum, c) => sum + c.monto, 0);
        const totalPresupuestado = kit?.costoEstimado || 0;
        const varianza = totalReal - totalPresupuestado;
        const porcentajeVarianza = totalPresupuestado > 0
            ? ((varianza / totalPresupuestado) * 100)
            : 0;

        // Agrupar por tipo
        const porTipo: { [key: string]: { presupuestado: number; real: number } } = {};
        const tiposDefault = ['material', 'mano_obra', 'transporte', 'equipo', 'otros'];

        tiposDefault.forEach(tipo => {
            porTipo[tipo] = {
                presupuestado: totalPresupuestado / tiposDefault.length, // Distribución proporcional
                real: 0
            };
        });

        costos.forEach(c => {
            if (porTipo[c.tipo]) {
                porTipo[c.tipo].real += c.monto;
            } else {
                porTipo['otros'].real += c.monto;
            }
        });

        const porTipoArray = Object.entries(porTipo).map(([tipo, valores]) => ({
            tipo,
            presupuestado: Math.round(valores.presupuestado),
            real: Math.round(valores.real),
            varianza: Math.round(valores.real - valores.presupuestado),
        }));

        // Generar alertas
        const alertas: { tipo: 'warning' | 'danger'; mensaje: string }[] = [];

        if (porcentajeVarianza > 10 && porcentajeVarianza <= 20) {
            alertas.push({
                tipo: 'warning',
                mensaje: `Desviación del ${porcentajeVarianza.toFixed(1)}% sobre el presupuesto`,
            });
        } else if (porcentajeVarianza > 20) {
            alertas.push({
                tipo: 'danger',
                mensaje: `⚠️ Desviación crítica: ${porcentajeVarianza.toFixed(1)}% sobre presupuesto`,
            });
        }

        return {
            totalPresupuestado: Math.round(totalPresupuestado),
            totalReal: Math.round(totalReal),
            varianza: Math.round(varianza),
            porcentajeVarianza: Math.round(porcentajeVarianza * 10) / 10,
            porTipo: porTipoArray,
            alertas,
        };
    }

    /**
     * Obtener comparativo presupuesto vs real de una orden
     */
    async getComparativo(ordenId: string): Promise<ComparativoCostos> {
        const orden = await this.getCostosByOrden(ordenId);
        const kit = orden.planeacion?.kit;
        const costos = orden.costos;

        const costoReal = costos.reduce((sum, c) => sum + c.monto, 0);
        const presupuestoKit = kit?.costoEstimado || 0;
        const varianza = costoReal - presupuestoKit;

        const desglose = costos.map(c => ({
            concepto: c.concepto,
            tipo: c.tipo,
            presupuestado: 0, // Por defecto, se podría expandir con items presupuestados
            real: c.monto,
            diferencia: c.monto,
        }));

        return {
            ordenNumero: orden.numero,
            cliente: orden.cliente,
            estado: orden.estado,
            presupuestoKit,
            costoReal: Math.round(costoReal),
            varianza: Math.round(varianza),
            porcentaje: presupuestoKit > 0
                ? Math.round((varianza / presupuestoKit) * 100)
                : 0,
            desglose,
        };
    }

    /**
     * Obtener resumen de costos por período
     */
    async getResumenPeriodo(fechaInicio: Date, fechaFin: Date) {
        const ordenes = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: fechaInicio,
                    lte: fechaFin,
                },
            },
            include: {
                costos: true,
                planeacion: {
                    include: { kit: true },
                },
            },
        });

        let totalPresupuestado = 0;
        let totalReal = 0;

        const resumenOrdenes = ordenes.map(orden => {
            const presupuesto = orden.planeacion?.kit?.costoEstimado || 0;
            const real = orden.costos.reduce((sum, c) => sum + c.monto, 0);

            totalPresupuestado += presupuesto;
            totalReal += real;

            return {
                ordenId: orden.id,
                numero: orden.numero,
                cliente: orden.cliente,
                presupuesto,
                real,
                varianza: real - presupuesto,
            };
        });

        return {
            periodo: { inicio: fechaInicio, fin: fechaFin },
            totalOrdenes: ordenes.length,
            totalPresupuestado,
            totalReal,
            varianzaTotal: totalReal - totalPresupuestado,
            ordenes: resumenOrdenes,
        };
    }

    /**
     * Actualizar costo
     */
    async actualizarCosto(costoId: string, data: Partial<RegistrarCostoDTO>) {
        const costo = await prisma.cost.findUnique({ where: { id: costoId } });

        if (!costo) {
            throw AppError.notFound('Costo');
        }

        return prisma.cost.update({
            where: { id: costoId },
            data: {
                concepto: data.concepto,
                monto: data.monto,
                tipo: data.tipo,
                descripcion: data.descripcion,
            },
        });
    }

    /**
     * Eliminar costo
     */
    async eliminarCosto(costoId: string) {
        const costo = await prisma.cost.findUnique({ where: { id: costoId } });

        if (!costo) {
            throw AppError.notFound('Costo');
        }

        await prisma.cost.delete({ where: { id: costoId } });
        logger.info(`Costo eliminado: ${costoId}`);

        return { success: true };
    }
}

export const costosService = new CostosService();
