// ============================================
// PLANEACIÓN HOOKS - Cermont FSM
// Hooks para planeación y kits
// ============================================

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planeacionApi, CreatePlaneacionInput, UpdatePlaneacionInput, PlaneacionItem } from '../api/planeacion.api';
import { toast } from 'sonner';

/**
 * Hook para obtener planeación por orden
 */
export function usePlaneacion(ordenId: string) {
  return useQuery({
    queryKey: ['planeacion', ordenId],
    queryFn: () => planeacionApi.getByOrdenId(ordenId),
    enabled: !!ordenId,
    retry: 1,
  });
}

/**
 * Hook para crear planeación
 */
export function useCreatePlaneacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePlaneacionInput) => planeacionApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['planeacion', data.ordenId] });
      queryClient.invalidateQueries({ queryKey: ['orden', data.ordenId] });
      toast.success('Planeación creada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear planeación');
    },
  });
}

/**
 * Hook para actualizar planeación
 */
export function useUpdatePlaneacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlaneacionInput }) =>
      planeacionApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['planeacion', data.ordenId] });
      toast.success('Planeación actualizada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar planeación');
    },
  });
}

/**
 * Hook para agregar item a planeación
 */
export function useAddPlaneacionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      planeacionId, 
      item 
    }: { 
      planeacionId: string; 
      item: Omit<PlaneacionItem, 'id' | 'planeacionId'>;
    }) => planeacionApi.addItem(planeacionId, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planeacion'] });
      toast.success('Item agregado');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al agregar item');
    },
  });
}

/**
 * Hook para eliminar item de planeación
 */
export function useRemovePlaneacionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planeacionId, itemId }: { planeacionId: string; itemId: string }) =>
      planeacionApi.removeItem(planeacionId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planeacion'] });
      toast.success('Item eliminado');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar item');
    },
  });
}

/**
 * Hook para aplicar kit a planeación
 */
export function useApplyKit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planeacionId, kitId }: { planeacionId: string; kitId: string }) =>
      planeacionApi.applyKit(planeacionId, kitId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['planeacion', data.ordenId] });
      toast.success('Kit aplicado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al aplicar kit');
    },
  });
}

/**
 * Hook para obtener kits típicos
 */
export function useKits(categoria?: string) {
  return useQuery({
    queryKey: ['kits', categoria],
    queryFn: () => planeacionApi.getKits(categoria),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para obtener kit por ID
 */
export function useKit(id: string) {
  return useQuery({
    queryKey: ['kit', id],
    queryFn: () => planeacionApi.getKitById(id),
    enabled: !!id,
  });
}
