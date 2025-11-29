'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kitsApi } from '../api';
import type { CreateKitDTO, UpdateKitDTO } from '../types';

const KITS_QUERY_KEY = 'kits';

export function useKits() {
  return useQuery({
    queryKey: [KITS_QUERY_KEY],
    queryFn: kitsApi.getAll,
  });
}

export function useKit(id: string) {
  return useQuery({
    queryKey: [KITS_QUERY_KEY, id],
    queryFn: () => kitsApi.getById(id),
    enabled: !!id,
  });
}

export function useKitsByCategory(category: string) {
  return useQuery({
    queryKey: [KITS_QUERY_KEY, 'category', category],
    queryFn: () => kitsApi.getByCategory(category),
    enabled: !!category,
  });
}

export function useKitsStats() {
  return useQuery({
    queryKey: [KITS_QUERY_KEY, 'stats'],
    queryFn: kitsApi.getStats,
  });
}

export function useCreateKit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateKitDTO) => kitsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KITS_QUERY_KEY] });
    },
  });
}

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

export function useDeleteKit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => kitsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KITS_QUERY_KEY] });
    },
  });
}

export function useDuplicateKit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => kitsApi.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KITS_QUERY_KEY] });
    },
  });
}
