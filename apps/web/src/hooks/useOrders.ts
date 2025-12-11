'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService, ListOrdersParams } from '@/services/orders.service';
import type { CreateOrderInput, UpdateOrderInput, OrderStatus, OrderPriority } from '@/types/order';

// Query keys
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params?: ListOrdersParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  stats: () => [...orderKeys.all, 'stats'] as const,
};

/**
 * Hook para listar órdenes
 */
export function useOrders(params?: ListOrdersParams) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => ordersService.list(params),
  });
}

/**
 * Hook para obtener una orden específica
 */
export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook para estadísticas de órdenes
 */
export function useOrderStats() {
  return useQuery({
    queryKey: orderKeys.stats(),
    queryFn: () => ordersService.getStats(),
  });
}

/**
 * Hook para crear orden
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderInput) => ordersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    },
  });
}

/**
 * Hook para actualizar orden
 */
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderInput }) => 
      ordersService.update(id, data),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.setQueryData(orderKeys.detail(updatedOrder.id), updatedOrder);
    },
  });
}

/**
 * Hook para eliminar orden
 */
export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ordersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    },
  });
}

/**
 * Hook para cambiar estado de orden
 */
export function useChangeOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => 
      ordersService.changeStatus(id, status),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.setQueryData(orderKeys.detail(updatedOrder.id), updatedOrder);
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    },
  });
}

/**
 * Hook para cambiar prioridad de orden
 */
export function useChangeOrderPriority() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, priority }: { id: string; priority: OrderPriority }) => 
      ordersService.changePriority(id, priority),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.setQueryData(orderKeys.detail(updatedOrder.id), updatedOrder);
    },
  });
}
