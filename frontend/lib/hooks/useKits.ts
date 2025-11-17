import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kitsApi } from '@/lib/api/kits';
import type { Kit, CreateKitDTO, UpdateKitDTO } from '@/lib/types/kit';

const KITS_QUERY_KEY = 'kits';

/**
 * Hook para obtener todos los kits
 */
export function useKits() {
  return useQuery({
    queryKey: [KITS_QUERY_KEY],
    queryFn: kitsApi.getAll,
  });
}

/**
 * Hook para obtener un kit espec�fico
 */
export function useKit(id: string) {
  return useQuery({
    queryKey: [KITS_QUERY_KEY, id],
    queryFn: () => kitsApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook para obtener kits por categor�a
 */
export function useKitsByCategory(category: string) {
  return useQuery({
    queryKey: [KITS_QUERY_KEY, 'category', category],
    queryFn: () => kitsApi.getByCategory(category),
    enabled: !!category,
  });
}

/**
 * Hook para obtener estad�sticas de kits
 */
export function useKitsStats() {
  return useQuery({
    queryKey: [KITS_QUERY_KEY, 'stats'],
    queryFn: kitsApi.getStats,
  });
}

/**
 * Hook para crear kit
 */
export function useCreateKit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateKitDTO) => kitsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KITS_QUERY_KEY] });
    },
  });
}

/**
 * Hook para actualizar kit
 */
export function useUpdateKit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateKitDTO }) =>
      kitsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [KITS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [KITS_QUERY_KEY, variables.id] });
    },
  });
}

/**
 * Hook para eliminar kit
 */
export function useDeleteKit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => kitsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KITS_QUERY_KEY] });
    },
  });
}

/**
 * Hook para duplicar kit
 */
export function useDuplicateKit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => kitsApi.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KITS_QUERY_KEY] });
    },
  });
}

