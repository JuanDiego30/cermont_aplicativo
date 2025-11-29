/**
 * Billing Hooks
 * Hooks de React Query para facturación
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi } from '../api';
import type { BillingState, BillingFilters, UpdateBillingStatePayload } from '../types';

// Query Keys
export const billingKeys = {
  all: ['billing'] as const,
  stats: () => [...billingKeys.all, 'stats'] as const,
  orders: () => [...billingKeys.all, 'orders'] as const,
  ordersByState: (state: BillingState) => [...billingKeys.orders(), 'state', state] as const,
  ordersList: (filters: BillingFilters) => [...billingKeys.orders(), 'list', filters] as const,
  order: (id: string) => [...billingKeys.orders(), id] as const,
};

/**
 * Hook para obtener estadísticas de facturación
 */
export function useBillingStats() {
  return useQuery({
    queryKey: billingKeys.stats(),
    queryFn: () => billingApi.getStats(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para listar órdenes por estado
 */
export function useBillingByState(
  state: BillingState,
  page = 1,
  pageSize = 20,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...billingKeys.ordersByState(state), page, pageSize],
    queryFn: () => billingApi.listByState(state, page, pageSize),
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook para listar órdenes con filtros
 */
export function useBillingOrders(
  filters: BillingFilters = {},
  page = 1,
  pageSize = 20
) {
  return useQuery({
    queryKey: [...billingKeys.ordersList(filters), page, pageSize],
    queryFn: () => billingApi.list(filters, page, pageSize),
  });
}

/**
 * Hook para obtener detalle de facturación
 */
export function useBillingOrder(orderId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: billingKeys.order(orderId),
    queryFn: () => billingApi.getOrder(orderId),
    enabled: (options?.enabled ?? true) && !!orderId,
  });
}

/**
 * Hook para actualizar estado de facturación
 */
export function useUpdateBillingState() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: UpdateBillingStatePayload) => 
      billingApi.updateState(payload),
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: billingKeys.stats() });
      queryClient.invalidateQueries({ queryKey: billingKeys.orders() });
      queryClient.setQueryData(billingKeys.order(data.id), data);
    },
  });
}

/**
 * Hook para generar factura
 */
export function useGenerateInvoice() {
  return useMutation({
    mutationFn: (orderId: string) => billingApi.generateInvoice(orderId),
  });
}

/**
 * Hook para registrar pago
 */
export function useRecordPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      orderId, 
      amount, 
      method 
    }: { 
      orderId: string; 
      amount: number; 
      method: string 
    }) => billingApi.recordPayment(orderId, amount, method),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.stats() });
      queryClient.invalidateQueries({ queryKey: billingKeys.orders() });
      queryClient.setQueryData(billingKeys.order(data.id), data);
    },
  });
}
