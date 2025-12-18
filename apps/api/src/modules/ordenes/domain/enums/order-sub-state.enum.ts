// String literal alias alineado con enum OrderStatus de Prisma
type OrderStatus = 'planeacion' | 'ejecucion' | 'pausada' | 'completada' | 'cancelada';

/**
 * @enum OrderSubState
 * Estados detallados del flujo de 14 pasos
 */
export enum OrderSubState {
    // Solicitud (Pasos 1-4)
    SOLICITUD_RECIBIDA = 'SOLICITUD_RECIBIDA',
    VISITA_PROGRAMADA = 'VISITA_PROGRAMADA',
    PROPUESTA_ELABORADA = 'PROPUESTA_ELABORADA',
    PROPUESTA_APROBADA = 'PROPUESTA_APROBADA',

    // Planeación (Paso 5)
    PLANEACION_INICIADA = 'PLANEACION_INICIADA',
    PLANEACION_APROBADA = 'PLANEACION_APROBADA',

    // Ejecución (Paso 6)
    EJECUCION_INICIADA = 'EJECUCION_INICIADA',
    EJECUCION_COMPLETADA = 'EJECUCION_COMPLETADA',

    // Informe (Paso 7)
    INFORME_GENERADO = 'INFORME_GENERADO',

    // Cierre Técnico (Pasos 8-9)
    ACTA_ELABORADA = 'ACTA_ELABORADA',
    ACTA_FIRMADA = 'ACTA_FIRMADA',

    // Cierre Administrativo (Pasos 10-13)
    SES_APROBADA = 'SES_APROBADA',
    FACTURA_APROBADA = 'FACTURA_APROBADA',

    // Final (Paso 14)
    PAGO_RECIBIDO = 'PAGO_RECIBIDO',
}

/**
 * Matriz de transiciones válidas entre estados
 */
export const TRANSITION_MATRIX: Record<OrderSubState, OrderSubState[]> = {
    // SOLICITUD
    [OrderSubState.SOLICITUD_RECIBIDA]: [
        OrderSubState.VISITA_PROGRAMADA,
        OrderSubState.PROPUESTA_ELABORADA, // Si no requiere visita
    ],
    [OrderSubState.VISITA_PROGRAMADA]: [OrderSubState.PROPUESTA_ELABORADA],
    [OrderSubState.PROPUESTA_ELABORADA]: [
        OrderSubState.PROPUESTA_APROBADA,
        OrderSubState.SOLICITUD_RECIBIDA, // Rechazo -> volver a inicio
    ],
    [OrderSubState.PROPUESTA_APROBADA]: [OrderSubState.PLANEACION_INICIADA],

    // PLANEACIÓN
    [OrderSubState.PLANEACION_INICIADA]: [OrderSubState.PLANEACION_APROBADA],
    [OrderSubState.PLANEACION_APROBADA]: [OrderSubState.EJECUCION_INICIADA],

    // EJECUCIÓN
    [OrderSubState.EJECUCION_INICIADA]: [OrderSubState.EJECUCION_COMPLETADA],
    [OrderSubState.EJECUCION_COMPLETADA]: [OrderSubState.INFORME_GENERADO],

    // INFORME
    [OrderSubState.INFORME_GENERADO]: [OrderSubState.ACTA_ELABORADA],

    // CIERRE TÉCNICO
    [OrderSubState.ACTA_ELABORADA]: [OrderSubState.ACTA_FIRMADA],
    [OrderSubState.ACTA_FIRMADA]: [OrderSubState.SES_APROBADA],

    // CIERRE ADMINISTRATIVO
    [OrderSubState.SES_APROBADA]: [OrderSubState.FACTURA_APROBADA],
    [OrderSubState.FACTURA_APROBADA]: [OrderSubState.PAGO_RECIBIDO],

    // FINAL
    [OrderSubState.PAGO_RECIBIDO]: [], // Estado terminal
};

/**
 * Mapeo de subEstado a estado principal (OrderStatus de Prisma)
 */
export function getMainStateFromSubState(subState: OrderSubState): OrderStatus {
    const mapping: Record<OrderSubState, OrderStatus> = {
        [OrderSubState.SOLICITUD_RECIBIDA]: 'planeacion',
        [OrderSubState.VISITA_PROGRAMADA]: 'planeacion',
        [OrderSubState.PROPUESTA_ELABORADA]: 'planeacion',
        [OrderSubState.PROPUESTA_APROBADA]: 'planeacion',
        [OrderSubState.PLANEACION_INICIADA]: 'planeacion',
        [OrderSubState.PLANEACION_APROBADA]: 'planeacion',
        [OrderSubState.EJECUCION_INICIADA]: 'ejecucion',
        [OrderSubState.EJECUCION_COMPLETADA]: 'ejecucion',
        [OrderSubState.INFORME_GENERADO]: 'ejecucion',
        [OrderSubState.ACTA_ELABORADA]: 'ejecucion',
        [OrderSubState.ACTA_FIRMADA]: 'ejecucion',
        [OrderSubState.SES_APROBADA]: 'completada',
        [OrderSubState.FACTURA_APROBADA]: 'completada',
        [OrderSubState.PAGO_RECIBIDO]: 'completada',
    };
    return mapping[subState];
}

/**
 * Valida si una transición es permitida
 */
export function isValidTransition(from: OrderSubState, to: OrderSubState): boolean {
    return TRANSITION_MATRIX[from]?.includes(to) ?? false;
}

/**
 * Obtiene el siguiente estado posible
 */
export function getNextPossibleStates(current: OrderSubState): OrderSubState[] {
    return TRANSITION_MATRIX[current] || [];
}

/**
 * Obtiene el paso del flujo (1-14) desde el subEstado
 */
export function getStepNumber(subState: OrderSubState): number {
    const stepMap: Record<OrderSubState, number> = {
        [OrderSubState.SOLICITUD_RECIBIDA]: 1,
        [OrderSubState.VISITA_PROGRAMADA]: 2,
        [OrderSubState.PROPUESTA_ELABORADA]: 3,
        [OrderSubState.PROPUESTA_APROBADA]: 4,
        [OrderSubState.PLANEACION_INICIADA]: 5,
        [OrderSubState.PLANEACION_APROBADA]: 5,
        [OrderSubState.EJECUCION_INICIADA]: 6,
        [OrderSubState.EJECUCION_COMPLETADA]: 6,
        [OrderSubState.INFORME_GENERADO]: 7,
        [OrderSubState.ACTA_ELABORADA]: 8,
        [OrderSubState.ACTA_FIRMADA]: 9,
        [OrderSubState.SES_APROBADA]: 11,
        [OrderSubState.FACTURA_APROBADA]: 13,
        [OrderSubState.PAGO_RECIBIDO]: 14,
    };
    return stepMap[subState] || 0;
}
