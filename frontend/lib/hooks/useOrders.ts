'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, type OrderListFilters, type OrderListResult } from '../api/orders';
import { CreateOrderDTO, OrderState, type Order } from '../types/order';

export function useOrders(filters: OrderListFilters = {}) {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery<OrderListResult>({
    queryKey: ['orders', filters],
    queryFn: () => ordersApi.list(filters),
  });

  const createMutation = useMutation<Order, Error, CreateOrderDTO>({
    mutationFn: (input) => ordersApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const transitionMutation = useMutation<
    Order,
    Error,
    { id: string; newState: OrderState }
  >({
    mutationFn: ({ id, newState }) => ordersApi.transition(id, newState),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return {
    orders: ordersQuery.data?.orders ?? [],
    total: ordersQuery.data?.total ?? 0,
    page: ordersQuery.data?.page ?? 1,
    totalPages: ordersQuery.data?.totalPages ?? 1,
    isLoading: ordersQuery.isLoading,
    error: ordersQuery.error,
    createOrder: createMutation.mutate,
    createLoading: createMutation.isPending,
    transitionState: transitionMutation.mutate,
    transitionLoading: transitionMutation.isPending,
  };
}

export function useOrder(id: string) {
  return useQuery<Order>({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id),
    enabled: Boolean(id),
  });
}
