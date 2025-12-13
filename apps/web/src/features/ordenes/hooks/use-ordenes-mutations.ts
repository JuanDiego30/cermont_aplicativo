/**
 * @file use-ordenes-mutations.ts
 * @description Mutation hooks para órdenes con optimistic updates
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ordenesApi } from '../api/ordenes.api';
import { ordenesKeys } from './use-ordenes';
import type { 
  CreateOrdenInput, 
  UpdateOrdenInput, 
  Orden, 
  OrdenesResponse,
  EstadoOrden,
} from '../api/orden.types';

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Hook para crear nueva orden
 */
export function useCreateOrden() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrdenInput) => ordenesApi.create(input),
    onSuccess: (newOrden) => {
      // Invalidar lista de órdenes
      queryClient.invalidateQueries({ queryKey: ordenesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ordenesKeys.stats() });
      toast.success(`Orden ${newOrden.numero} creada exitosamente`);
    },
    onError: (error: Error) => {
      toast.error(`Error al crear orden: ${error.message}`);
    },
  });
}

/**
 * Hook para actualizar orden
 */
export function useUpdateOrden() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrdenInput }) =>
      ordenesApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: ordenesKeys.detail(id) });

      // Guardar valor anterior
      const previousOrden = queryClient.getQueryData<Orden>(ordenesKeys.detail(id));

      // Optimistic update
      if (previousOrden) {
        queryClient.setQueryData(ordenesKeys.detail(id), {
          ...previousOrden,
          ...data,
          updatedAt: new Date().toISOString(),
        });
      }

      return { previousOrden };
    },
    onError: (error: Error, { id }, context) => {
      // Revertir en caso de error
      if (context?.previousOrden) {
        queryClient.setQueryData(ordenesKeys.detail(id), context.previousOrden);
      }
      toast.error(`Error al actualizar orden: ${error.message}`);
    },
    onSuccess: () => {
      toast.success('Orden actualizada');
    },
    onSettled: (_, __, { id }) => {
      // Refetch para sincronizar
      queryClient.invalidateQueries({ queryKey: ordenesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ordenesKeys.lists() });
    },
  });
}

/**
 * Hook para cambiar estado de orden
 */
export function useChangeEstadoOrden() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoOrden }) =>
      ordenesApi.changeEstado(id, estado),
    onMutate: async ({ id, estado }) => {
      await queryClient.cancelQueries({ queryKey: ordenesKeys.lists() });

      // Optimistic update en la lista
      const previousLists = queryClient.getQueriesData<OrdenesResponse>({ 
        queryKey: ordenesKeys.lists() 
      });

      previousLists.forEach(([queryKey, data]) => {
        if (data) {
          queryClient.setQueryData(queryKey, {
            ...data,
            data: data.data.map((orden) =>
              orden.id === id ? { ...orden, estado } : orden
            ),
          });
        }
      });

      return { previousLists };
    },
    onError: (error: Error, _, context) => {
      // Revertir cambios
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error(`Error al cambiar estado: ${error.message}`);
    },
    onSuccess: () => {
      toast.success('Estado actualizado');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ordenesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ordenesKeys.stats() });
    },
  });
}

/**
 * Hook para asignar técnico
 */
export function useAsignarTecnico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ordenId, tecnicoId }: { ordenId: string; tecnicoId: string }) =>
      ordenesApi.asignarTecnico(ordenId, tecnicoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordenesKeys.lists() });
      toast.success('Técnico asignado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al asignar técnico: ${error.message}`);
    },
  });
}

/**
 * Hook para eliminar orden
 */
export function useDeleteOrden() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ordenesApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ordenesKeys.lists() });

      const previousLists = queryClient.getQueriesData<OrdenesResponse>({ 
        queryKey: ordenesKeys.lists() 
      });

      // Optimistic removal
      previousLists.forEach(([queryKey, data]) => {
        if (data) {
          queryClient.setQueryData(queryKey, {
            ...data,
            data: data.data.filter((orden) => orden.id !== id),
            total: data.total - 1,
          });
        }
      });

      return { previousLists };
    },
    onError: (error: Error, _, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error(`Error al eliminar orden: ${error.message}`);
    },
    onSuccess: () => {
      toast.success('Orden eliminada');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ordenesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ordenesKeys.stats() });
    },
  });
}

/**
 * Hook para exportar órdenes
 */
export function useExportOrdenes() {
  return useMutation({
    mutationFn: ordenesApi.exportToExcel,
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ordenes-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Archivo exportado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al exportar: ${error.message}`);
    },
  });
}
