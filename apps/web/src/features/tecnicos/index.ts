/**
 * ARCHIVO: index.ts
 * FUNCION: Barrel file - API pública del módulo técnicos
 * IMPLEMENTACION: Re-exporta tipos, hooks, componentes y utilidades del feature
 * DEPENDENCIAS: Submódulos api, hooks, components, schemas, utils
 * EXPORTS: Tipos, tecnicosApi, hooks SWR, componentes UI, schemas Zod, utils
 */
// API & Types (explicit exports to avoid duplicates)
export type { Tecnico, TecnicoFilters, PaginatedTecnicos, TecnicoStats, TecnicoEstado } from './api/tecnicos.types';
export { tecnicosApi } from './api/tecnicos.api';

// Hooks
export {
  useTecnicos,
  useTecnico,
  useTecnicosStats,
  useSuspenseTecnicos,
  usePrefetchTecnico,
  useInvalidateTecnicos,
  tecnicosKeys,
} from './hooks/use-tecnicos';

export {
  useCreateTecnico,
  useUpdateTecnico,
  useToggleDisponibilidad,
  useDeleteTecnico,
} from './hooks/use-tecnicos-mutations';

export { useTecnicosFilters } from './hooks/use-tecnicos-filters';

// Components
export { TecnicosStats, TecnicosStatsSkeleton } from './components/tecnicos-stats';
export { TecnicoCard, TecnicoCardSkeleton } from './components/tecnico-card';
export { TecnicosFilters } from './components/tecnicos-filters';
export { TecnicosGrid, TecnicosGridSkeleton } from './components/tecnicos-grid';
export { StatCard } from './components/stat-card';

// Schemas
export * from './schemas/tecnico.schema';

// Utils
export * from './utils/tecnico-status.utils';
