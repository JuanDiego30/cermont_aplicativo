/**
 * ARCHIVO: index.ts
 * FUNCION: Barrel export del módulo de evidencias fotográficas/documentales
 * IMPLEMENTACION: Re-exporta tipos, API, hooks y componentes del módulo
 * DEPENDENCIAS: Todos los submódulos de evidencias
 * EXPORTS: Evidencia, evidenciasApi, useEvidencias, EvidenciaCard, EvidenciasList
 */
export * from './types/evidencia.types';
export * from './api/evidencias.api';
export * from './hooks/use-evidencias';
export * from './components/EvidenciaCard';
export * from './components/EvidenciasList';
export * from './components/EvidenciaCardSkeleton';
export * from './components/EvidenciasGallery';
