/**
 * @file mantenimiento.utils.ts
 * @description Utility functions and constants for Mantenimientos
 */

import { EstadoMantenimiento, TipoMantenimiento } from '../types/mantenimiento.types';

export const ESTADO_MANTENIMIENTO_CONFIG: Record<EstadoMantenimiento, { label: string; color: string }> = {
    PROGRAMADO: { label: 'Programado', color: 'gray' },
    EN_PROGRESO: { label: 'En Proceso', color: 'yellow' },
    COMPLETADO: { label: 'Completado', color: 'green' },
    CANCELADO: { label: 'Cancelado', color: 'red' },
};

export const TIPO_MANTENIMIENTO_CONFIG: Record<TipoMantenimiento, { label: string; icon: string }> = {
    PREVENTIVO: { label: 'Preventivo', icon: 'ShieldCheckIcon' },
    CORRECTIVO: { label: 'Correctivo', icon: 'WrenchIcon' },
    PREDICTIVO: { label: 'Predictivo', icon: 'ActivityIcon' },
};
