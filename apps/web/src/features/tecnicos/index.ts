/**
 * @file index.ts
 * @description API pública del feature tecnicos
 * 
 * ✨ Este archivo define qué exporta el módulo para uso externo
 */

// API & Types
export * from './api/tecnicos.types';
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
