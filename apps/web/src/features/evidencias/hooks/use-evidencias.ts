'use client';

/**
 * @file use-evidencias.ts
 * @description SWR hooks for evidencias management
 */

import useSWR from 'swr';
import { useMutation, useInvalidate } from '@/hooks/use-mutation';
import { swrKeys } from '@/lib/swr-config';
import { evidenciasApi } from '../api/evidencias.api';
import type { Evidencia, CreateEvidenciaInput, EvidenciaFilters } from '../types/evidencia.types';

/**
 * Hook para obtener la lista de evidencias
 */
export function useEvidencias(filters?: EvidenciaFilters) {
  return useSWR(
    swrKeys.evidencias.list(filters),
    () => evidenciasApi.getAll(filters),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook para obtener evidencias por orden ID
 */
export function useEvidenciasByOrden(ordenId: string | undefined) {
  return useSWR(
    ordenId ? `evidencias:orden:${ordenId}` : null,
    () => (ordenId ? evidenciasApi.getAll({ ordenId }) : []),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook para obtener una evidencia por ID
 */
export function useEvidencia(id: string | undefined) {
  return useSWR(
    id ? swrKeys.evidencias.detail(id) : null,
    () => (id ? evidenciasApi.getById(id) : null),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook para subir evidencia
 */
export function useUploadEvidencia() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data: CreateEvidenciaInput) => evidenciasApi.upload(data),
    onSuccess: () => {
      invalidate('evidencias');
    },
  });
}

/**
 * Hook para eliminar evidencia
 */
export function useDeleteEvidencia() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => evidenciasApi.delete(id),
    onSuccess: () => {
      invalidate('evidencias');
    },
  });
}
