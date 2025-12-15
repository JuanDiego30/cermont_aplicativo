/**
 * ARCHIVO: index.ts
 * FUNCION: Barrel file para el módulo de Mantenimientos
 * IMPLEMENTACION: Re-exporta tipos, API, hooks, componentes y utilidades
 * DEPENDENCIAS: Submódulos internos (types, api, hooks, components, utils)
 * EXPORTS: Mantenimiento, mantenimientosApi, useMantenimientos, MantenimientoCard, etc.
 */
export * from './types/mantenimiento.types';
export * from './api/mantenimientos.api';
export * from './hooks/use-mantenimientos';
export * from './components/MantenimientoCard';
export * from './components/MantenimientoCardSkeleton';
export * from './utils/mantenimiento.utils';

// Stub for list (will be implemented or consumer uses map + card)
export const MantenimientosList = () => null;
