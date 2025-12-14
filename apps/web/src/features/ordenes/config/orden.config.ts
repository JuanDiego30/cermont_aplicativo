/**
 * @file orden.config.ts
 * @description Configuration constants for Orders module (labels, colors, options)
 */

import type { OrderStatus, OrderPriority, OrderType } from '@/types/order';

export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
    planeacion: {
        label: 'Planeación',
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    },
    ejecucion: {
        label: 'Ejecución',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    },
    completada: {
        label: 'Completada',
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    },
    cancelada: {
        label: 'Cancelada',
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    },
    pausada: {
        label: 'Pausada',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    },
};

export const ORDER_PRIORITY_CONFIG: Record<OrderPriority, { label: string; color: string; border: string }> = {
    baja: {
        label: 'Baja',
        color: 'text-gray-600',
        border: 'border-l-gray-400'
    },
    media: {
        label: 'Media',
        color: 'text-blue-600',
        border: 'border-l-blue-400'
    },
    alta: {
        label: 'Alta',
        color: 'text-orange-600',
        border: 'border-l-orange-400'
    },
    urgente: {
        label: 'Urgente',
        color: 'text-red-600',
        border: 'border-l-red-500'
    },
};

export const ORDER_TYPE_OPTIONS: { value: OrderType; label: string }[] = [
    { value: 'instalacion', label: 'Instalación' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'reparacion', label: 'Reparación' },
    { value: 'inspeccion', label: 'Inspección' },
];

export const PRIORITY_OPTIONS: { value: OrderPriority; label: string }[] = [
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
    { value: 'urgente', label: 'Urgente' },
];
