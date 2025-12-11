// ============================================
// EJECUCIÓN HOOKS - Cermont FSM
// Hooks para ejecución de órdenes
// ============================================

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ejecucionApi, 
  IniciarEjecucionInput, 
  ActualizarProgresoInput,
  CompletarTareaInput,
  UbicacionGPS 
} from '../api/ejecucion.api';
import { useOffline } from '@/hooks/use-offline';
import { toast } from 'sonner';

/**
 * Hook para obtener ejecución por orden
 */
export function useEjecucion(ordenId: string) {
  return useQuery({
    queryKey: ['ejecucion', 'orden', ordenId],
    queryFn: () => ejecucionApi.getByOrdenId(ordenId),
    enabled: !!ordenId,
    retry: 1,
  });
}

/**
 * Hook para obtener ejecución por ID
 */
export function useEjecucionById(id: string) {
  return useQuery({
    queryKey: ['ejecucion', id],
    queryFn: () => ejecucionApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook para obtener ejecuciones activas del usuario
 */
export function useMisEjecuciones() {
  return useQuery({
    queryKey: ['ejecuciones', 'activas'],
    queryFn: () => ejecucionApi.getMisEjecuciones(),
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 60 * 1000, // Refrescar cada minuto
  });
}

/**
 * Hook para iniciar ejecución
 */
export function useIniciarEjecucion() {
  const queryClient = useQueryClient();
  const { queueAction, isOnline } = useOffline();

  return useMutation({
    mutationFn: async (data: IniciarEjecucionInput) => {
      if (!isOnline) {
        await queueAction({
          endpoint: '/api/ejecucion/iniciar',
          method: 'POST',
          payload: data,
        });
        throw new Error('Guardado offline. Se sincronizará cuando haya conexión.');
      }
      return ejecucionApi.iniciar(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ejecucion', 'orden', data.ordenId] });
      queryClient.invalidateQueries({ queryKey: ['orden', data.ordenId] });
      queryClient.invalidateQueries({ queryKey: ['ejecuciones', 'activas'] });
      toast.success('Ejecución iniciada');
    },
    onError: (error: Error) => {
      if (error.message.includes('offline')) {
        toast.info(error.message);
      } else {
        toast.error(error.message || 'Error al iniciar ejecución');
      }
    },
  });
}

/**
 * Hook para actualizar progreso
 */
export function useActualizarProgreso() {
  const queryClient = useQueryClient();
  const { queueAction, isOnline } = useOffline();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ActualizarProgresoInput }) => {
      if (!isOnline) {
        await queueAction({
          endpoint: `/api/ejecucion/${id}/progreso`,
          method: 'PATCH',
          payload: data,
        });
        throw new Error('Guardado offline');
      }
      return ejecucionApi.actualizarProgreso(id, data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['ejecucion', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['ejecucion', 'orden', data.ordenId] });
    },
    onError: (error: Error) => {
      if (!error.message.includes('offline')) {
        toast.error(error.message || 'Error al actualizar progreso');
      }
    },
  });
}

/**
 * Hook para pausar ejecución
 */
export function usePausarEjecucion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo?: string }) =>
      ejecucionApi.pausar(id, motivo),
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['ejecucion'] });
      toast.warning('Ejecución pausada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al pausar ejecución');
    },
  });
}

/**
 * Hook para reanudar ejecución
 */
export function useReanudarEjecucion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ejecucionApi.reanudar(id),
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['ejecucion'] });
      toast.success('Ejecución reanudada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al reanudar ejecución');
    },
  });
}

/**
 * Hook para completar ejecución
 */
export function useCompletarEjecucion() {
  const queryClient = useQueryClient();
  const { queueAction, isOnline } = useOffline();

  return useMutation({
    mutationFn: async ({ id, ubicacion }: { id: string; ubicacion?: UbicacionGPS }) => {
      if (!isOnline) {
        await queueAction({
          endpoint: `/api/ejecucion/${id}/completar`,
          method: 'POST',
          payload: { ubicacion },
        });
        throw new Error('Guardado offline. Se sincronizará cuando haya conexión.');
      }
      return ejecucionApi.completar(id, ubicacion);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ejecucion'] });
      queryClient.invalidateQueries({ queryKey: ['orden', data.ordenId] });
      queryClient.invalidateQueries({ queryKey: ['ordenes'] });
      toast.success('¡Ejecución completada!');
    },
    onError: (error: Error) => {
      if (error.message.includes('offline')) {
        toast.info(error.message);
      } else {
        toast.error(error.message || 'Error al completar ejecución');
      }
    },
  });
}

/**
 * Hook para completar tarea
 */
export function useCompletarTarea() {
  const queryClient = useQueryClient();
  const { queueAction, isOnline } = useOffline();

  return useMutation({
    mutationFn: async ({ 
      ejecucionId, 
      tareaId, 
      data 
    }: { 
      ejecucionId: string; 
      tareaId: string; 
      data?: CompletarTareaInput;
    }) => {
      if (!isOnline) {
        await queueAction({
          endpoint: `/api/ejecucion/${ejecucionId}/tareas/${tareaId}/completar`,
          method: 'PATCH',
          payload: data,
        });
        throw new Error('Guardado offline');
      }
      return ejecucionApi.completarTarea(ejecucionId, tareaId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ejecucion'] });
      toast.success('Tarea completada');
    },
    onError: (error: Error) => {
      if (!error.message.includes('offline')) {
        toast.error(error.message || 'Error al completar tarea');
      }
    },
  });
}

/**
 * Hook para marcar checklist
 */
export function useMarcarChecklist() {
  const queryClient = useQueryClient();
  const { queueAction, isOnline } = useOffline();

  return useMutation({
    mutationFn: async ({ 
      ejecucionId, 
      checklistId, 
      completado 
    }: { 
      ejecucionId: string; 
      checklistId: string; 
      completado: boolean;
    }) => {
      if (!isOnline) {
        await queueAction({
          endpoint: `/api/ejecucion/${ejecucionId}/checklist/${checklistId}`,
          method: 'PATCH',
          payload: { completado },
        });
        throw new Error('Guardado offline');
      }
      return ejecucionApi.marcarChecklist(ejecucionId, checklistId, completado);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ejecucion'] });
    },
    onError: (error: Error) => {
      if (!error.message.includes('offline')) {
        toast.error(error.message || 'Error al actualizar checklist');
      }
    },
  });
}

/**
 * Hook para registrar ubicación GPS
 */
export function useRegistrarUbicacion() {
  const { queueAction, isOnline } = useOffline();

  return useMutation({
    mutationFn: async ({ id, ubicacion }: { id: string; ubicacion: UbicacionGPS }) => {
      if (!isOnline) {
        await queueAction({
          endpoint: `/api/ejecucion/${id}/ubicacion`,
          method: 'POST',
          payload: ubicacion,
        });
        return;
      }
      return ejecucionApi.registrarUbicacion(id, ubicacion);
    },
  });
}
