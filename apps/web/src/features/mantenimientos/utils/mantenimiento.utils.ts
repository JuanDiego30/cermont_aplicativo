/**
 * @file mantenimiento.utils.ts
 * @description Utility functions and constants for Mantenimientos
 */

import { EstadoMantenimiento, TipoMantenimiento } from '../types/mantenimiento.types';

export const ESTADO_MANTENIMIENTO_CONFIG: Record<EstadoMantenimiento, { label: string; color: string }> = {
    programado: { label: 'Programado', color: 'gray' },
    en_proceso: { label: 'En Proceso', color: 'yellow' },
    completado: { label: 'Completado', color: 'green' },
    cancelado: { label: 'Cancelado', color: 'red' },
};

export const TIPO_MANTENIMIENTO_CONFIG: Record<TipoMantenimiento, { label: string; icon: string }> = {
    preventivo: { label: 'Preventivo', icon: 'ShieldCheckIcon' },
    correctivo: { label: 'Correctivo', icon: 'WrenchIcon' },
    predictivo: { label: 'Predictivo', icon: 'ActivityIcon' },
};
