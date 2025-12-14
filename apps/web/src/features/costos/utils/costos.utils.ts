/**
 * @file costos.utils.ts
 * @description Utility functions for Costos module
 */

export const formatCostoCurrency = (monto: number): string => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(monto);
};

export const COSTO_TYPE_LABELS = {
    material: 'Material',
    mano_obra: 'Mano de Obra',
    transporte: 'Transporte',
    otros: 'Otros',
};

export const COSTO_STATUS_COLORS = {
    pendiente: 'text-yellow-600 bg-yellow-100',
    aprobado: 'text-green-600 bg-green-100',
    rechazado: 'text-red-600 bg-red-100',
};
