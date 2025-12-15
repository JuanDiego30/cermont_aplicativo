/**
 * ARCHIVO: index.tsx
 * FUNCION: Barrel export alternativo del módulo de evidencias (DEPRECADO)
 * IMPLEMENTACION: Re-exporta componentes - usar index.ts preferentemente
 * DEPENDENCIAS: Submódulos de evidencias
 * EXPORTS: EvidenciaCard, EvidenciaCardSkeleton, EvidenciasList
 */
export * from './types/evidencia.types';

// API
export * from './api/evidencias.api';

// Hooks
export * from './hooks/use-evidencias';

// Components
export { EvidenciaCard } from './components/EvidenciaCard';
export { EvidenciaCardSkeleton } from './components/EvidenciaCardSkeleton';
export { EvidenciasList } from './components/EvidenciasList';

