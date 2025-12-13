/**
 * @file use-tecnicos-mutations.ts
 * @description TanStack Query mutations para técnicos con optimistic updates
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tecnicosApi } from '../api/tecnicos.api';
import { tecnicosKeys } from './use-tecnicos';
import type {
  CreateTecnicoInput,
  UpdateTecnicoInput,
  Tecnico,
  PaginatedTecnicos,
} from '../api/tecnicos.types';

/**
 * Hook para crear técnico
 */
export function useCreateTecnico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTecnicoInput) => tecnicosApi.create(data),

    onSuccess: (data) => {
      // Invalidar listas y stats
      queryClient.invalidateQueries({ queryKey: tecnicosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tecnicosKeys.stats() });

      toast.success('Técnico creado exitosamente', {
        description: `${data.nombre} ha sido agregado al equipo`,
      });
    },

    onError: (error: Error) => {
      toast.error('Error al crear técnico', {
        description: error.message || 'Ocurrió un error inesperado',
      });
    },
  });
}

/**
 * Hook para actualizar técnico con optimistic update
 */
export function useUpdateTecnico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTecnicoInput }) =>
      tecnicosApi.update(id, data),

    onMutate: async ({ id, data }) => {
      // Cancelar queries en vuelo
      await queryClient.cancelQueries({ queryKey: tecnicosKeys.detail(id) });

      // Snapshot del estado anterior
      const previousTecnico = queryClient.getQueryData<Tecnico>(
        tecnicosKeys.detail(id)
      );

      // Optimistic update
      if (previousTecnico) {
        queryClient.setQueryData<Tecnico>(tecnicosKeys.detail(id), {
          ...previousTecnico,
          ...data,
        });
      }

      return { previousTecnico };
    },

    onError: (error: Error, variables, context) => {
      // Revertir cambios en caso de error
      if (context?.previousTecnico) {
        queryClient.setQueryData(
          tecnicosKeys.detail(variables.id),
          context.previousTecnico
        );
      }

      toast.error('Error al actualizar técnico', {
        description: error.message || 'Ocurrió un error inesperado',
      });
    },

    onSuccess: (data, variables) => {
      // Actualizar cache con datos del servidor
      queryClient.setQueryData(tecnicosKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: tecnicosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tecnicosKeys.stats() });

      toast.success('Técnico actualizado exitosamente');
    },
  });
}

/**
 * Hook para cambiar disponibilidad con optimistic update
 */
export function useToggleDisponibilidad() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, disponible }: { id: string; disponible: boolean }) =>
      tecnicosApi.toggleDisponibilidad(id, disponible),

    onMutate: async ({ id, disponible }) => {
      await queryClient.cancelQueries({ queryKey: tecnicosKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: tecnicosKeys.lists() });

      const previousTecnico = queryClient.getQueryData<Tecnico>(
        tecnicosKeys.detail(id)
      );

      // Optimistic update en detalle
      if (previousTecnico) {
        queryClient.setQueryData<Tecnico>(tecnicosKeys.detail(id), {
          ...previousTecnico,
          disponible,
        });
      }

      // Optimistic update en listas
      queryClient.setQueriesData<PaginatedTecnicos>(
        { queryKey: tecnicosKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((t) =>
              t.id === id ? { ...t, disponible } : t
            ),
          };
        }
      );

      return { previousTecnico };
    },

    onError: (error: Error, variables, context) => {
      if (context?.previousTecnico) {
        queryClient.setQueryData(
          tecnicosKeys.detail(variables.id),
          context.previousTecnico
        );
      }
      queryClient.invalidateQueries({ queryKey: tecnicosKeys.lists() });

      toast.error('Error al actualizar disponibilidad', {
        description: error.message || 'Ocurrió un error inesperado',
      });
    },

    onSuccess: (data, variables) => {
      queryClient.setQueryData(tecnicosKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: tecnicosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tecnicosKeys.stats() });

      toast.success(
        variables.disponible
          ? 'Técnico marcado como disponible'
          : 'Técnico marcado como ocupado'
      );
    },
  });
}

/**
 * Hook para eliminar técnico
 */
export function useDeleteTecnico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tecnicosApi.delete(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: tecnicosKeys.all });

      // Snapshot para revertir
      const previousLists = queryClient.getQueriesData<PaginatedTecnicos>({
        queryKey: tecnicosKeys.lists(),
      });

      // Optimistic delete
      queryClient.setQueriesData<PaginatedTecnicos>(
        { queryKey: tecnicosKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((t) => t.id !== id),
            total: old.total - 1,
          };
        }
      );

      return { previousLists };
    },

    onError: (error: Error, id, context) => {
      // Revertir cambios
      context?.previousLists.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });

      toast.error('Error al eliminar técnico', {
        description: error.message || 'Ocurrió un error inesperado',
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tecnicosKeys.all });
      toast.success('Técnico eliminado exitosamente');
    },
  });
}
