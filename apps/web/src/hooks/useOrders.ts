/**
 * @module useOrders
 * @description Hooks para gestión de órdenes usando SWR.
 */
'use client';

import useSWR from 'swr';
import { useMutation, useInvalidate } from './use-mutation';
import { ordersService, ListOrdersParams } from '@/services/orders.service';
import { swrKeys } from '@/lib/swr-config';
import type { CreateOrderInput, UpdateOrderInput, OrderStatus, OrderPriority } from '@/types/order';

// Query keys factory
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
  return useSWR(
    swrKeys.orders.list(params),
    () => ordersService.list(params),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook para obtener una orden específica
 */
export function useOrder(id: string) {
  return useSWR(
    id ? swrKeys.orders.detail(id) : null,
    () => ordersService.getById(id),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook para estadísticas de órdenes
 */
export function useOrderStats() {
  return useSWR(
    swrKeys.orders.stats(),
    () => ordersService.getStats(),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook para crear orden
 */
export function useCreateOrder() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (data: CreateOrderInput) => ordersService.create(data),
    onSuccess: () => {
      invalidate('orders');
    },
  });
}

/**
 * Hook para actualizar orden
 */
export function useUpdateOrder() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderInput }) => 
      ordersService.update(id, data),
    onSuccess: () => {
      invalidate('orders');
    },
  });
}

/**
 * Hook para eliminar orden
 */
export function useDeleteOrder() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (id: string) => ordersService.delete(id),
    onSuccess: () => {
      invalidate('orders');
    },
  });
}

/**
 * Hook para cambiar estado de orden
 */
export function useChangeOrderStatus() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => 
      ordersService.changeStatus(id, status),
    onSuccess: () => {
      invalidate('orders');
    },
  });
}

/**
 * Hook para cambiar prioridad de orden
 */
export function useChangeOrderPriority() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, priority }: { id: string; priority: OrderPriority }) => 
      ordersService.changePriority(id, priority),
    onSuccess: () => {
      invalidate('orders');
    },
  });
}

/**
 * Hook para asignar técnico a orden
 */
export function useAssignOrderTechnician() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, technicianId }: { id: string; technicianId: string }) => 
      ordersService.assignTechnician(id, technicianId),
    onSuccess: () => {
      invalidate('orders');
    },
  });
}
