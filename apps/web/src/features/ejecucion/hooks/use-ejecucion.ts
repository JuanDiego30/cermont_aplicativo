/**
 * ARCHIVO: use-ejecucion.ts
 * FUNCION: Hooks SWR para gestión de estado de ejecución de órdenes
 * IMPLEMENTACION: useSWR para fetching, useMutation para operaciones de ejecución
 * DEPENDENCIAS: swr, @/hooks/use-mutation, ejecucion.api
 * EXPORTS: useEjecucionByOrden, useIniciarEjecucion, usePausarEjecucion, etc.
 */
'use client';
import useSWR from 'swr';
import { useMutation, useInvalidate } from '@/hooks/use-mutation';
import { swrKeys } from '@/lib/swr-config';
import {
  ejecucionApi,
  type Ejecucion,
  type IniciarEjecucionInput,
  type ActualizarProgresoInput,
  type CompletarTareaInput,
  type UbicacionGPS,
} from '../api/ejecucion.api';

/**
 * Hook para obtener ejecución por orden ID
 */
export function useEjecucionByOrden(ordenId: string | undefined) {
  return useSWR(
    ordenId ? `ejecucion:orden:${ordenId}` : null,
    () => (ordenId ? ejecucionApi.getByOrdenId(ordenId) : null),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook para obtener ejecución por ID
 */
export function useEjecucion(id: string | undefined) {
  return useSWR(
    id ? swrKeys.ejecucion.detail(id) : null,
    () => (id ? ejecucionApi.getById(id) : null),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook para iniciar ejecución
 */
export function useIniciarEjecucion() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data: IniciarEjecucionInput) => ejecucionApi.iniciar(data),
    onSuccess: () => {
      invalidate('ejecucion');
      invalidate('ordenes');
    },
  });
}

/**
 * Hook para actualizar progreso
 */
export function useActualizarProgreso() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ActualizarProgresoInput }) =>
      ejecucionApi.actualizarProgreso(id, data),
    onSuccess: () => {
      invalidate('ejecucion');
    },
  });
}

/**
 * Hook para pausar ejecución
 */
export function usePausarEjecucion() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo?: string }) =>
      ejecucionApi.pausar(id, motivo),
    onSuccess: () => {
      invalidate('ejecucion');
      invalidate('ordenes');
    },
  });
}

/**
 * Hook para reanudar ejecución
 */
export function useReanudarEjecucion() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => ejecucionApi.reanudar(id),
    onSuccess: () => {
      invalidate('ejecucion');
      invalidate('ordenes');
    },
  });
}

/**
 * Hook para completar ejecución
 */
export function useCompletarEjecucion() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, ubicacion }: { id: string; ubicacion?: UbicacionGPS }) =>
      ejecucionApi.completar(id, ubicacion),
    onSuccess: () => {
      invalidate('ejecucion');
      invalidate('ordenes');
    },
  });
}

/**
 * Hook para completar tarea
 */
export function useCompletarTarea() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({
      ejecucionId,
      tareaId,
      data,
    }: {
      ejecucionId: string;
      tareaId: string;
      data?: CompletarTareaInput;
    }) => ejecucionApi.completarTarea(ejecucionId, tareaId, data),
    onSuccess: () => {
      invalidate('ejecucion');
    },
  });
}

/**
 * Hook para marcar checklist item
 */
export function useMarcarChecklist() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({
      ejecucionId,
      checklistId,
      completado,
    }: {
      ejecucionId: string;
      checklistId: string;
      completado: boolean;
    }) => ejecucionApi.marcarChecklist(ejecucionId, checklistId, completado),
    onSuccess: () => {
      invalidate('ejecucion');
    },
  });
}

/**
 * Hook para obtener ejecuciones del usuario actual
 */
export function useMisEjecuciones() {
  return useSWR(
    'ejecucion:mis-ejecuciones',
    () => ejecucionApi.getMisEjecuciones(),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook para registrar ubicación GPS
 */
export function useRegistrarUbicacion() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, ubicacion }: { id: string; ubicacion: UbicacionGPS }) =>
      ejecucionApi.registrarUbicacion(id, ubicacion),
    onSuccess: () => {
      invalidate('ejecucion');
    },
  });
}
