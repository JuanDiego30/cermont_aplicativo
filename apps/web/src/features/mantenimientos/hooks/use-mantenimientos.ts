/**
 * ARCHIVO: use-mantenimientos.ts
 * FUNCION: Hooks SWR para gestión de mantenimientos (CRUD + stats)
 * IMPLEMENTACION: Usa useSWR para fetching y useMutation para operaciones de escritura
 * DEPENDENCIAS: swr, @/hooks/use-mutation, @/lib/swr-config, mantenimientosApi
 * EXPORTS: useMantenimientos, useMantenimiento, useMantenimientosStats, useCreateMantenimiento, useUpdateMantenimiento, useDeleteMantenimiento
 */
'use client';
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
        programados: data.filter((m) => m.estado === 'programado').length,
        enProceso: data.filter((m) => m.estado === 'en_proceso').length,
        completados: data.filter((m) => m.estado === 'completado').length,
        cancelados: data.filter((m) => m.estado === 'cancelado').length,
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
