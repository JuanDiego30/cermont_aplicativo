'use client';

/**
 * @file use-kits.ts
 * @description SWR hooks for kits management
 */

import useSWR from 'swr';
import { useMutation, useInvalidate } from '@/hooks/use-mutation';
import { swrKeys } from '@/lib/swr-config';
import { kitsService } from '../services/kits.service';
import type { Kit, KitFilters, EstadoKit } from '../index';

/**
 * Hook para obtener la lista de kits
 */
export function useKits(filters?: KitFilters) {
  return useSWR(
    swrKeys.kits.list(filters),
    () => kitsService.list(filters),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook para obtener un kit por ID
 */
export function useKit(id: string | undefined) {
  return useSWR(
    id ? swrKeys.kits.detail(id) : null,
    () => (id ? kitsService.getById(id) : null),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook para obtener kits sugeridos por tipo de orden
 */
export function useKitsSugeridos(tipoOrden: string | undefined) {
  return useSWR(
    tipoOrden ? `kits:sugeridos:${tipoOrden}` : null,
    () => (tipoOrden ? kitsService.getSugeridos(tipoOrden) : []),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook para crear un kit
 */
export function useCreateKit() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data: Partial<Kit>) => kitsService.create(data),
    onSuccess: () => {
      invalidate('kits');
    },
  });
}

/**
 * Hook para actualizar un kit
 */
export function useUpdateKit() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Kit> }) =>
      kitsService.update(id, data),
    onSuccess: () => {
      invalidate('kits');
    },
  });
}

/**
 * Hook para eliminar un kit
 */
export function useDeleteKit() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => kitsService.delete(id),
    onSuccess: () => {
      invalidate('kits');
    },
  });
}

/**
 * Hook para cambiar el estado de un kit
 */
export function useChangeKitEstado() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoKit }) =>
      kitsService.changeEstado(id, estado),
    onSuccess: () => {
      invalidate('kits');
    },
  });
}
