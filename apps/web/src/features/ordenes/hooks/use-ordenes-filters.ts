/**
 * @file use-ordenes-filters.ts
 * @description Hook para gestión de filtros con URL sync
 */

'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { OrdenFilters, EstadoOrden, PrioridadOrden } from '../api/orden.types';

export function useOrdenesFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parsear filtros desde URL
  const filters: OrdenFilters = useMemo(() => ({
    search: searchParams.get('search') || undefined,
    estado: (searchParams.get('estado') as EstadoOrden | 'todos') || 'todos',
    prioridad: (searchParams.get('prioridad') as PrioridadOrden | 'todos') || 'todos',
    tecnicoId: searchParams.get('tecnicoId') || undefined,
    clienteId: searchParams.get('clienteId') || undefined,
    fechaDesde: searchParams.get('fechaDesde') || undefined,
    fechaHasta: searchParams.get('fechaHasta') || undefined,
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 10,
  }), [searchParams]);

  // Actualizar filtros en URL
  const setFilters = useCallback((newFilters: Partial<OrdenFilters>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === 'todos') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    // Reset page cuando cambian otros filtros (excepto página)
    if (!('page' in newFilters)) {
      params.delete('page');
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  // Limpiar todos los filtros
  const clearFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  // Setters individuales
  const setSearch = useCallback((search: string) => {
    setFilters({ search: search || undefined });
  }, [setFilters]);

  const setEstado = useCallback((estado: EstadoOrden | 'todos') => {
    setFilters({ estado });
  }, [setFilters]);

  const setPrioridad = useCallback((prioridad: PrioridadOrden | 'todos') => {
    setFilters({ prioridad });
  }, [setFilters]);

  const setPage = useCallback((page: number) => {
    setFilters({ page });
  }, [setFilters]);

  const setDateRange = useCallback((fechaDesde?: string, fechaHasta?: string) => {
    setFilters({ fechaDesde, fechaHasta });
  }, [setFilters]);

  // Verificar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.search ||
      (filters.estado && filters.estado !== 'todos') ||
      (filters.prioridad && filters.prioridad !== 'todos') ||
      filters.tecnicoId ||
      filters.clienteId ||
      filters.fechaDesde ||
      filters.fechaHasta
    );
  }, [filters]);

  return {
    filters,
    setFilters,
    clearFilters,
    setSearch,
    setEstado,
    setPrioridad,
    setPage,
    setDateRange,
    hasActiveFilters,
  };
}
