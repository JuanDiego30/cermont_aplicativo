/**
 * @fileoverview Enum canónico de estados de orden
 * @module common/enums
 *
 * Este archivo es el SSOT para los estados de una orden.
 * Debe coincidir con el enum OrderStatus de Prisma.
 */

export enum OrdenEstado {
    PENDIENTE = "pendiente",
    PLANEACION = "planeacion",
    EJECUCION = "ejecucion",
    COMPLETADA = "completada",
    CANCELADA = "cancelada",
    PAUSADA = "pausada",
}

export const ORDEN_ESTADOS = Object.values(OrdenEstado);

export type OrdenEstadoType = `${OrdenEstado}`;

/**
 * Validar si un string es un estado de orden válido
 */
export function isValidOrdenEstado(estado: string): estado is OrdenEstado {
    return ORDEN_ESTADOS.includes(estado as OrdenEstado);
}

/**
 * Labels para UI/Reportes
 */
export const ORDEN_ESTADO_LABELS: Record<OrdenEstado, string> = {
    [OrdenEstado.PENDIENTE]: 'Pendiente',
    [OrdenEstado.PLANEACION]: 'En Planeación',
    [OrdenEstado.EJECUCION]: 'En Ejecución',
    [OrdenEstado.COMPLETADA]: 'Completada',
    [OrdenEstado.CANCELADA]: 'Cancelada',
    [OrdenEstado.PAUSADA]: 'Pausada',
};
