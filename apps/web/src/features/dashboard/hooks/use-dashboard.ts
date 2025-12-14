'use client';

/**
 * @file use-dashboard.ts
 * @description SWR hooks for dashboard data
 */

import useSWR from 'swr';
import { swrKeys } from '@/lib/swr-config';
import { dashboardApi, type DashboardMetrics, type OrderStatusData } from '../api/dashboard-api';

/**
 * Hook para obtener métricas del dashboard
 */
export function useDashboardMetrics() {
  return useSWR<DashboardMetrics>(
    swrKeys.dashboard.stats(),
    () => dashboardApi.getMetrics(),
    { 
      revalidateOnFocus: false,
      refreshInterval: 60000, // Refrescar cada minuto
    }
  );
}

/**
 * Hook para obtener estado de órdenes
 */
export function useOrdersStatus() {
  return useSWR<OrderStatusData[]>(
    'dashboard:orders-status',
    () => dashboardApi.getOrdersStatus(),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook para obtener estadísticas de técnicos
 */
export function useTechniciansStats() {
  return useSWR(
    'dashboard:technicians',
    () => dashboardApi.getTechniciansStats(),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook combinado para datos del dashboard
 */
export function useDashboard() {
  const { data: metrics, error: metricsError, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: ordersStatus, error: ordersError, isLoading: ordersLoading } = useOrdersStatus();
  const { data: technicians, error: techniciansError, isLoading: techniciansLoading } = useTechniciansStats();

  return {
    metrics,
    ordersStatus,
    technicians,
    isLoading: metricsLoading || ordersLoading || techniciansLoading,
    error: metricsError || ordersError || techniciansError,
  };
}

/**
 * Hook para datos recientes del dashboard
 */
export function useDashboardRecent() {
  return useSWR(
    swrKeys.dashboard.recent(),
    async () => {
      // Combinar datos recientes de diferentes fuentes
      const ordersStatus = await dashboardApi.getOrdersStatus();
      return {
        recentOrders: ordersStatus,
        timestamp: new Date().toISOString(),
      };
    },
    { 
      revalidateOnFocus: false,
      refreshInterval: 30000, // Refrescar cada 30 segundos
    }
  );
}
