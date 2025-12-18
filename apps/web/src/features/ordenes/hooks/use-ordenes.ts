// 📁 web/src/features/ordenes/hooks/use-ordenes.ts
// Hook canónico para gestión de órdenes con SWR

'use client';

import useSWR from 'swr';
import { useMutation, useInvalidate } from '@/hooks/use-mutation';
import { ordenesApi, type OrdenStateInfo } from '../api/ordenes-api';
import { useOffline } from '@/hooks/use-offline';
import { toast } from 'sonner';
import { swrKeys } from '@/lib/swr-config';
import type { CreateOrdenDTO, UpdateOrdenDTO } from '@/types/orden';

// ============================================================================
// Tipos
// ============================================================================

export interface OrdenesListParams {
  estado?: string;
  clienteId?: string;
  page?: number;
  limit?: number;
}

/** Tipo para errores de API con mensaje opcional */
interface ApiError {
  message?: string;
}

/** Extrae mensaje de error de forma segura */
function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as ApiError).message || defaultMessage;
  }
  return defaultMessage;
}

// ============================================================================
// Query Keys Factory (compatibilidad)
// ============================================================================

export const ordenesKeys = {
  all: ['ordenes'] as const,
  lists: () => [...ordenesKeys.all, 'list'] as const,
  list: (params?: OrdenesListParams) => [...ordenesKeys.lists(), params] as const,
  details: () => [...ordenesKeys.all, 'detail'] as const,
  detail: (id: string) => [...ordenesKeys.details(), id] as const,
  stats: () => [...ordenesKeys.all, 'stats'] as const,
};

// ============================================================================
// Query Hooks (Lectura)
// ============================================================================

/**
 * Hook para listar órdenes con filtros opcionales
 */
export function useOrdenes(params?: OrdenesListParams) {
  return useSWR(
    swrKeys.ordenes.list(params),
    () => ordenesApi.list(params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5 * 60 * 1000,
    }
  );
}

/**
 * Hook para obtener orden por ID
 */
export function useOrden(id: string) {
  return useSWR(
    id ? swrKeys.ordenes.detail(id) : null,
    () => ordenesApi.getById(id),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook para crear orden
 */
export function useCreateOrden() {
  const invalidate = useInvalidate();
  const { queueAction } = useOffline();

  return useMutation({
    mutationFn: async (data: CreateOrdenDTO) => {
      try {
        const result = await ordenesApi.create(data);
        return result;
      } catch (error) {
        // Guardar en queue para offline
        await queueAction({
          endpoint: '/api/ordenes',
          method: 'POST',
          payload: data,
        });
        throw error;
      }
    },
    onSuccess: () => {
      invalidate('ordenes');
      toast.success('Orden creada exitosamente');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Error al crear orden'));
    },
  });
}

/**
 * Hook para actualizar orden
 */
export function useUpdateOrden() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrdenDTO }) =>
      ordenesApi.update(id, data),
    onSuccess: () => {
      invalidate('ordenes');
      toast.success('Orden actualizada');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Error al actualizar orden'));
    },
  });
}

/**
 * Hook para eliminar orden
 */
export function useDeleteOrden() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (id: string) => ordenesApi.delete(id),
    onSuccess: () => {
      invalidate('ordenes');
      toast.success('Orden eliminada');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Error al eliminar orden'));
    },
  });
}

/**
 * Hook para cambiar estado de orden
 */
export function useChangeOrdenEstado() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) =>
      ordenesApi.updateEstado(id, estado),
    onSuccess: () => {
      invalidate('ordenes');
      toast.success('Estado actualizado');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Error al cambiar estado'));
    },
  });
}

/**
 * Hook para asignar técnico
 */
export function useAsignarTecnico() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ ordenId, tecnicoId }: { ordenId: string; tecnicoId: string }) =>
      ordenesApi.assignTechnician(ordenId, tecnicoId),
    onSuccess: () => {
      invalidate('ordenes');
      toast.success('Técnico asignado');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Error al asignar técnico'));
    },
  });
}

/**
 * Hook para obtener estadísticas de órdenes
 */
export function useOrdenesStats() {
  return useSWR(
    swrKeys.ordenes.stats(),
    () => ordenesApi.getStats(),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook para obtener el estado detallado de una orden (flujo 14 pasos)
 */
export function useOrdenEstado(id: string) {
  return useSWR<OrdenStateInfo>(
    id ? `ordenes:state:${id}` : null,
    () => ordenesApi.getState(id),
    { revalidateOnFocus: false }
  );
}
