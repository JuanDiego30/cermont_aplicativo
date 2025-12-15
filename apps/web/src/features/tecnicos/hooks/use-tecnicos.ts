/**
 * ARCHIVO: use-tecnicos.ts
 * FUNCION: Hooks SWR para fetching y cache de técnicos
 * IMPLEMENTACION: Usa SWR con keys factory, soporta suspense, prefetch e invalidación
 * DEPENDENCIAS: swr, tecnicosApi, swrKeys
 * EXPORTS: useTecnicos, useTecnico, useTecnicosStats, useSuspenseTecnicos, usePrefetchTecnico, useInvalidateTecnicos, tecnicosKeys
 */
'use client';

import useSWR, { useSWRConfig } from 'swr';
import { useMutation, useInvalidate } from '@/hooks/use-mutation';
import { tecnicosApi } from '../api/tecnicos.api';
import { swrKeys } from '@/lib/swr-config';
import type { TecnicoFilters, PaginatedTecnicos, Tecnico, TecnicoStats } from '../api/tecnicos.types';

// Query keys factory (compatibilidad)
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
  return useSWR<PaginatedTecnicos>(
    options?.enabled !== false ? swrKeys.tecnicos.list(filters) : null,
    () => tecnicosApi.getAll(filters),
    {
      revalidateOnFocus: false,
      dedupingInterval: 2 * 60 * 1000,
      fallbackData: options?.initialData,
    }
  );
}

/**
 * Hook para un técnico específico
 */
export function useTecnico(id: string, options?: { enabled?: boolean }) {
  return useSWR<Tecnico>(
    (options?.enabled !== false) && id ? swrKeys.tecnicos.detail(id) : null,
    () => tecnicosApi.getById(id),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5 * 60 * 1000,
    }
  );
}

/**
 * Hook para estadísticas de técnicos
 */
export function useTecnicosStats(options?: { enabled?: boolean }) {
  return useSWR<TecnicoStats>(
    options?.enabled !== false ? swrKeys.tecnicos.stats() : null,
    () => tecnicosApi.getStats(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 1 * 60 * 1000,
    }
  );
}

/**
 * Hook con Suspense - SWR soporta suspense nativamente
 */
export function useSuspenseTecnicos(filters: TecnicoFilters = {}) {
  return useSWR<PaginatedTecnicos>(
    swrKeys.tecnicos.list(filters),
    () => tecnicosApi.getAll(filters),
    { suspense: true }
  );
}

/**
 * Hook para prefetch (hover, focus)
 */
export function usePrefetchTecnico() {
  const { mutate } = useSWRConfig();

  return (id: string) => {
    mutate(
      swrKeys.tecnicos.detail(id),
      () => tecnicosApi.getById(id),
      { revalidate: false }
    );
  };
}

/**
 * Hook para invalidar queries
 */
export function useInvalidateTecnicos() {
  const invalidate = useInvalidate();

  return {
    all: () => invalidate('tecnicos'),
    lists: () => invalidate('tecnicos:list'),
    detail: (id: string) => invalidate(`tecnicos:detail:${id}`),
    stats: () => invalidate('tecnicos:stats'),
  };
}


