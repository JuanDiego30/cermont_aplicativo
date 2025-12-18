/**
 * @file index.ts
 * @description Public exports for Mantenimientos module
 */

export * from './types/mantenimiento.types';
export * from './api/mantenimientos.api';
export * from './hooks/use-mantenimientos';
// Components exports
export * from './components/MantenimientosDashboard';
export * from './utils/mantenimiento.utils';

// Stub for list (will be implemented or consumer uses map + card)
export const MantenimientosList = () => null;
