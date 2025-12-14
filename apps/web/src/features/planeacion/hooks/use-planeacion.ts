'use client';

/**
 * @file use-planeacion.ts
 * @description SWR hooks for planeación management
 */

import useSWR from 'swr';
import { useMutation, useInvalidate } from '@/hooks/use-mutation';
import { swrKeys } from '@/lib/swr-config';
import {
  planeacionApi,
  type Planeacion,
  type CreatePlaneacionInput,
  type UpdatePlaneacionInput,
  type PlaneacionItem,
  type KitTipico,
} from '../api/planeacion.api';

/**
 * Hook para obtener la planeación por orden ID
 */
export function usePlaneacionByOrden(ordenId: string | undefined) {
  return useSWR(
    ordenId ? swrKeys.planeacion.detail(ordenId) : null,
    () => (ordenId ? planeacionApi.getByOrdenId(ordenId) : null),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook para obtener kits típicos
 */
export function useKitsTipicos(categoria?: string) {
  return useSWR(
    categoria ? `kits:tipicos:${categoria}` : 'kits:tipicos',
    () => planeacionApi.getKits(categoria),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook para obtener un kit típico por ID
 */
export function useKitTipico(id: string | undefined) {
  return useSWR(
    id ? `kits:tipico:${id}` : null,
    () => (id ? planeacionApi.getKitById(id) : null),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook para crear planeación
 */
export function useCreatePlaneacion() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data: CreatePlaneacionInput) => planeacionApi.create(data),
    onSuccess: () => {
      invalidate('planeacion');
      invalidate('ordenes');
    },
  });
}

/**
 * Hook para actualizar planeación
 */
export function useUpdatePlaneacion() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlaneacionInput }) =>
      planeacionApi.update(id, data),
    onSuccess: () => {
      invalidate('planeacion');
    },
  });
}

/**
 * Hook para agregar item a planeación
 */
export function useAddPlaneacionItem() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({
      planeacionId,
      item,
    }: {
      planeacionId: string;
      item: Omit<PlaneacionItem, 'id' | 'planeacionId'>;
    }) => planeacionApi.addItem(planeacionId, item),
    onSuccess: () => {
      invalidate('planeacion');
    },
  });
}

/**
 * Hook para eliminar item de planeación
 */
export function useRemovePlaneacionItem() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ planeacionId, itemId }: { planeacionId: string; itemId: string }) =>
      planeacionApi.removeItem(planeacionId, itemId),
    onSuccess: () => {
      invalidate('planeacion');
    },
  });
}

/**
 * Hook para aplicar kit a planeación
 */
export function useApplyKitToPlaneacion() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ planeacionId, kitId }: { planeacionId: string; kitId: string }) =>
      planeacionApi.applyKit(planeacionId, kitId),
    onSuccess: () => {
      invalidate('planeacion');
    },
  });
}
