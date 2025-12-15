/**
 * ARCHIVO: index.ts
 * FUNCION: Barrel export del módulo de formularios/plantillas dinámicas
 * IMPLEMENTACION: Re-exporta tipos, API, hooks, componentes y utils
 * DEPENDENCIAS: Todos los submódulos de formularios
 * EXPORTS: Plantilla, formulariosApi, useFormularios, PlantillaCard
 */
export * from './types/formulario.types';
export * from './api/formularios.api';
export * from './hooks/use-formularios';
export * from './components/PlantillaCard';
export * from './utils/formulario.utils';

// Stub components (to be implemented or removed)
export const PlantillaCardSkeleton = () => null;
export const FormBuilder = () => null;
