/**
 * @file use-tecnicos.ts
 * @description TanStack Query hooks para fetching de técnicos
 */

import { useQuery, useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { tecnicosApi } from '../api/tecnicos.api';
import type { TecnicoFilters, PaginatedTecnicos, Tecnico, TecnicoStats } from '../api/tecnicos.types';

// Query keys factory (para consistencia y type safety)
export const tecnicosKeys = {
  all: ['tecnicos'] as const,
  lists: () => [...tecnicosKeys.all, 'list'] as const,
  list: (filters: TecnicoFilters) => [...tecnicosKeys.lists(), filters] as const,
  details: () => [...tecnicosKeys.all, 'detail'] as const,
  detail: (id: string) => [...tecnicosKeys.details(), id] as const,
  stats: () => [...tecnicosKeys.all, 'stats'] as const,
};

/**
 * Hook para lista de técnicos
 */
export function useTecnicos(
  filters: TecnicoFilters = {},
  options?: {
    initialData?: PaginatedTecnicos;
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: tecnicosKeys.list(filters),
    queryFn: () => tecnicosApi.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    placeholderData: (prev) => prev, // Mantener datos anteriores durante refetch
    initialData: options?.initialData,
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook para un técnico específico
 */
export function useTecnico(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: tecnicosKeys.detail(id),
    queryFn: () => tecnicosApi.getById(id),
    enabled: (options?.enabled ?? true) && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para estadísticas de técnicos
 */
export function useTecnicosStats(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: tecnicosKeys.stats(),
    queryFn: () => tecnicosApi.getStats(),
    staleTime: 1 * 60 * 1000, // 1 minuto
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook con Suspense (para Server Components boundary)
 */
export function useSuspenseTecnicos(filters: TecnicoFilters = {}) {
  return useSuspenseQuery({
    queryKey: tecnicosKeys.list(filters),
    queryFn: () => tecnicosApi.getAll(filters),
  });
}

/**
 * Hook para prefetch (hover, focus)
 */
export function usePrefetchTecnico() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: tecnicosKeys.detail(id),
      queryFn: () => tecnicosApi.getById(id),
      staleTime: 5 * 60 * 1000,
    });
  };
}

/**
 * Hook para invalidar queries
 */
export function useInvalidateTecnicos() {
  const queryClient = useQueryClient();

  return {
    all: () => queryClient.invalidateQueries({ queryKey: tecnicosKeys.all }),
    lists: () => queryClient.invalidateQueries({ queryKey: tecnicosKeys.lists() }),
    detail: (id: string) =>
      queryClient.invalidateQueries({ queryKey: tecnicosKeys.detail(id) }),
    stats: () => queryClient.invalidateQueries({ queryKey: tecnicosKeys.stats() }),
  };
}
