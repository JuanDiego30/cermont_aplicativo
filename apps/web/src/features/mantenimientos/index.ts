/**
 * @file index.ts
 * @description Public exports for Mantenimientos module
 */

export * from './types/mantenimiento.types';
export * from './api/mantenimientos.api';
export * from './hooks/use-mantenimientos';
export * from './components/MantenimientoCard';
export * from './components/MantenimientoCardSkeleton';
export * from './utils/mantenimiento.utils';

// Stub for list (will be implemented or consumer uses map + card)
export const MantenimientosList = () => null;
