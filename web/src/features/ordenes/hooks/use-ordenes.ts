// 📁 web/src/features/ordenes/hooks/use-ordenes.ts

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordenesApi } from '../api/ordenes-api';
import { useOffline } from '@/hooks/use-offline';
import { toast } from 'sonner';
import type { CreateOrdenDTO, UpdateOrdenDTO } from '@/types/orden';

/**
 * Hook para listar órdenes
 */
export function useOrdenes(params?: {
  estado?: string;
  clienteId?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['ordenes', params],
    queryFn: () => ordenesApi.list(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para obtener orden por ID
 */
export function useOrden(id: string) {
  return useQuery({
    queryKey: ['orden', id],
    queryFn: () => ordenesApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook para crear orden
 */
export function useCreateOrden() {
  const queryClient = useQueryClient();
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ordenes'] });
      queryClient.setQueryData(['orden', data.data.id], data.data);
      toast.success('Orden creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Error al crear orden');
    },
  });
}

/**
 * Hook para actualizar orden
 */
export function useUpdateOrden() {
  const queryClient = useQueryClient();
  const { queueAction } = useOffline();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateOrdenDTO }) => {
      try {
        return await ordenesApi.update(id, data);
      } catch (error) {
        await queueAction({
          endpoint: `/api/ordenes/${id}`,
          method: 'PUT',
          payload: data,
        });
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ordenes'] });
      queryClient.setQueryData(['orden', variables.id], data.data);
      toast.success('Orden actualizada');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Error al actualizar');
    },
  });
}

/**
 * Hook para cambiar estado
 */
export function useChangeOrdenEstado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, estado }: { id: string; estado: string }) => {
      return await ordenesApi.updateEstado(id, estado);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ordenes'] });
      queryClient.setQueryData(['orden', variables.id], data.data);
      toast.success('Estado actualizado');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Error al actualizar estado');
    },
  });
}

/**
 * Hook para eliminar orden
 */
export function useDeleteOrden() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await ordenesApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordenes'] });
      toast.success('Orden eliminada');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Error al eliminar');
    },
  });
}

/**
 * Hook para obtener estadísticas
 */
export function useOrdenesStats() {
  return useQuery({
    queryKey: ['ordenes-stats'],
    queryFn: () => ordenesApi.getStats(),
    staleTime: 10 * 60 * 1000,
  });
}
