/**
 * @file index.ts
 * @description Public exports for Formularios module
 */

export * from './types/formulario.types';
export * from './api/formularios.api';
export * from './hooks/use-formularios';
export * from './components/PlantillaCard';
export * from './utils/formulario.utils';

// Stub components (to be implemented or removed)
export const PlantillaCardSkeleton = () => null;
export const FormBuilder = () => null;
