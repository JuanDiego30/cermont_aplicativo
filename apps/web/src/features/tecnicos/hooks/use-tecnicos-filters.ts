/**
 * @file use-tecnicos-filters.ts
 * @description Hook para manejo de estado de filtros de técnicos
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { TecnicoFilters } from '../api/tecnicos.types';

interface UseTecnicosFiltersOptions {
  syncWithUrl?: boolean;
}

export function useTecnicosFilters(
  initialFilters: TecnicoFilters = {},
  options: UseTecnicosFiltersOptions = { syncWithUrl: true }
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Inicializar filtros desde URL si syncWithUrl está habilitado
  const initialFromUrl = useMemo((): TecnicoFilters => {
    if (!options.syncWithUrl) return initialFilters;

    return {
      search: searchParams.get('search') || initialFilters.search,
      disponible: (searchParams.get('disponible') as TecnicoFilters['disponible']) || 
        initialFilters.disponible || 'todos',
      estado: (searchParams.get('estado') as TecnicoFilters['estado']) || 
        initialFilters.estado,
      ubicacion: searchParams.get('ubicacion') || initialFilters.ubicacion,
      page: Number(searchParams.get('page')) || initialFilters.page || 1,
      pageSize: Number(searchParams.get('pageSize')) || initialFilters.pageSize || 12,
    };
  }, [searchParams, initialFilters, options.syncWithUrl]);

  const [filters, setFiltersState] = useState<TecnicoFilters>(initialFromUrl);

  // Sincronizar con URL
  const syncUrl = useCallback(
    (newFilters: TecnicoFilters) => {
      if (!options.syncWithUrl) return;

      const params = new URLSearchParams();
      
      if (newFilters.search) params.set('search', newFilters.search);
      if (newFilters.disponible && newFilters.disponible !== 'todos') {
        params.set('disponible', newFilters.disponible);
      }
      if (newFilters.estado) params.set('estado', newFilters.estado);
      if (newFilters.ubicacion) params.set('ubicacion', newFilters.ubicacion);
      if (newFilters.page && newFilters.page > 1) {
        params.set('page', String(newFilters.page));
      }

      const newUrl = params.toString() 
        ? `${pathname}?${params.toString()}`
        : pathname;
      
      router.push(newUrl, { scroll: false });
    },
    [pathname, router, options.syncWithUrl]
  );

  // Actualizar filtro individual
  const updateFilter = useCallback(
    <K extends keyof TecnicoFilters>(key: K, value: TecnicoFilters[K]) => {
      const newFilters: TecnicoFilters = {
        ...filters,
        [key]: value,
        // Reset page cuando cambian otros filtros
        page: key !== 'page' ? 1 : (value as number),
      };

      setFiltersState(newFilters);
      syncUrl(newFilters);
    },
    [filters, syncUrl]
  );

  // Actualizar múltiples filtros
  const setFilters = useCallback(
    (newFilters: Partial<TecnicoFilters>) => {
      const updated: TecnicoFilters = {
        ...filters,
        ...newFilters,
      };

      setFiltersState(updated);
      syncUrl(updated);
    },
    [filters, syncUrl]
  );

  // Reset filtros
  const resetFilters = useCallback(() => {
    const defaultFilters: TecnicoFilters = {
      search: '',
      disponible: 'todos',
      page: 1,
      pageSize: 12,
    };

    setFiltersState(defaultFilters);
    syncUrl(defaultFilters);
  }, [syncUrl]);

  // Helpers específicos
  const setSearch = useCallback(
    (search: string) => updateFilter('search', search),
    [updateFilter]
  );

  const setDisponible = useCallback(
    (disponible: TecnicoFilters['disponible']) => updateFilter('disponible', disponible),
    [updateFilter]
  );

  const setPage = useCallback(
    (page: number) => updateFilter('page', page),
    [updateFilter]
  );

  const setEstado = useCallback(
    (estado: TecnicoFilters['estado']) => updateFilter('estado', estado),
    [updateFilter]
  );

  // Verificar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.search ||
      (filters.disponible && filters.disponible !== 'todos') ||
      filters.estado ||
      filters.ubicacion
    );
  }, [filters]);

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    setSearch,
    setDisponible,
    setPage,
    setEstado,
    hasActiveFilters,
  };
}
