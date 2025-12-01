/**
 * Hook: useEquipment
 * React Query hooks para equipos certificados
 * 
 * @file frontend/src/features/equipment/hooks/useEquipment.ts
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentApi } from '../api/equipment-service';
import type {
  EquipmentFilters,
  CreateEquipmentDTO,
  UpdateEquipmentDTO,
} from '../types/equipment.types';

const QUERY_KEYS = {
  all: ['equipment'] as const,
  lists: () => [...QUERY_KEYS.all, 'list'] as const,
  list: (filters: EquipmentFilters) => [...QUERY_KEYS.lists(), filters] as const,
  details: () => [...QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...QUERY_KEYS.details(), id] as const,
  alerts: (days: number) => [...QUERY_KEYS.all, 'alerts', days] as const,
  stats: () => [...QUERY_KEYS.all, 'stats'] as const,
};

/**
 * Hook para listar equipos con filtros
 */
export function useEquipmentList(filters: EquipmentFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.list(filters),
    queryFn: () => equipmentApi.list(filters),
    staleTime: 30_000, // 30 segundos
  });
}

/**
 * Hook para obtener un equipo por ID
 */
export function useEquipment(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => equipmentApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook para crear equipo
 */
export function useCreateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEquipmentDTO) => equipmentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats() });
    },
  });
}

/**
 * Hook para actualizar equipo
 */
export function useUpdateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEquipmentDTO }) =>
      equipmentApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats() });
    },
  });
}

/**
 * Hook para eliminar equipo
 */
export function useDeleteEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => equipmentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats() });
    },
  });
}

/**
 * Hook para obtener alertas de certificaciones
 */
export function useEquipmentAlerts(daysAhead: number = 30) {
  return useQuery({
    queryKey: QUERY_KEYS.alerts(daysAhead),
    queryFn: () => equipmentApi.getAlerts(daysAhead),
    staleTime: 60_000, // 1 minuto
    refetchInterval: 300_000, // Refrescar cada 5 minutos
  });
}

/**
 * Hook para obtener estadísticas
 */
export function useEquipmentStats() {
  return useQuery({
    queryKey: QUERY_KEYS.stats(),
    queryFn: () => equipmentApi.getStats(),
    staleTime: 60_000,
  });
}

/**
 * Hook para asignar equipo a usuario
 */
export function useAssignEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ equipmentId, userId }: { equipmentId: string; userId: string }) =>
      equipmentApi.assign(equipmentId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(variables.equipmentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
    },
  });
}

/**
 * Hook para liberar equipo
 */
export function useReleaseEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (equipmentId: string) => equipmentApi.release(equipmentId),
    onSuccess: (_, equipmentId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(equipmentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
    },
  });
}
