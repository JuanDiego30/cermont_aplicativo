'use client';

/**
 * @file use-mantenimientos.ts
 * @description SWR hooks for mantenimientos management
 */

import useSWR from 'swr';
import { useMutation, useInvalidate } from '@/hooks/use-mutation';
import { swrKeys } from '@/lib/swr-config';
import { mantenimientosApi } from '../api/mantenimientos.api';
import type { Mantenimiento, CreateMantenimientoInput, MantenimientoFilters } from '../types/mantenimiento.types';

/**
 * Hook para obtener la lista de mantenimientos
 */
export function useMantenimientos(filters?: MantenimientoFilters) {
  return useSWR(
    swrKeys.mantenimientos.list(filters),
    () => mantenimientosApi.getAll(filters),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook para obtener un mantenimiento por ID
 */
export function useMantenimiento(id: string | undefined) {
  return useSWR(
    id ? swrKeys.mantenimientos.detail(id) : null,
    () => (id ? mantenimientosApi.getById(id) : null),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook para obtener estadísticas de mantenimientos
 */
export function useMantenimientosStats() {
  return useSWR(
    swrKeys.mantenimientos.stats(),
    async () => {
      // Obtener todos los mantenimientos para calcular stats
      const data = await mantenimientosApi.getAll();
      return {
        total: data.length,
        programados: data.filter((m) => m.estado === 'PROGRAMADO').length,
        enProceso: data.filter((m) => m.estado === 'EN_PROGRESO').length,
        completados: data.filter((m) => m.estado === 'COMPLETADO').length,
        cancelados: data.filter((m) => m.estado === 'CANCELADO').length,
      };
    },
    { revalidateOnFocus: false }
  );
}

/**
 * Hook para crear un mantenimiento
 */
export function useCreateMantenimiento() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data: CreateMantenimientoInput) => mantenimientosApi.create(data),
    onSuccess: () => {
      invalidate('mantenimientos');
    },
  });
}

/**
 * Hook para actualizar un mantenimiento
 */
export function useUpdateMantenimiento() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateMantenimientoInput> }) =>
      mantenimientosApi.update(id, data),
    onSuccess: () => {
      invalidate('mantenimientos');
    },
  });
}

/**
 * Hook para eliminar un mantenimiento
 */
export function useDeleteMantenimiento() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => mantenimientosApi.delete(id),
    onSuccess: () => {
      invalidate('mantenimientos');
    },
  });
}
