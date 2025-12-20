import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { dashboardApi } from '../api/dashboard-api';

const KEYS = {
  STATS: '/dashboard/stats',
  METRICAS: '/dashboard/metricas',
  ORDENES_RECIENTES: '/dashboard/ordenes-recientes',
  OVERVIEW: '/dashboard/overview',
  COSTOS: '/dashboard/costs-breakdown',
  TRENDS: '/dashboard/performance-trends',
};

export function useDashboardStats() {
  return useSWR(
    KEYS.STATS,
    () => dashboardApi.getStats(),
    {
      dedupingInterval: 5 * 60 * 1000,
    }
  );
}

export function useDashboardMetricas() {
  return useSWR(
    KEYS.METRICAS,
    () => dashboardApi.getMetricas(),
    {
      dedupingInterval: 2 * 60 * 1000,
    }
  );
}

export function useOrdenesRecientes() {
  return useSWR(
    KEYS.ORDENES_RECIENTES,
    () => dashboardApi.getOrdenesRecientes(),
    {
      dedupingInterval: 1 * 60 * 1000,
    }
  );
}

export function useDashboardOverview() {
  return useSWR(
    KEYS.OVERVIEW,
    () => dashboardApi.getOverview(),
    {
      dedupingInterval: 3 * 60 * 1000,
    }
  );
}

export function useRefreshKPIs() {
  return useSWRMutation(
    KEYS.OVERVIEW,
    async () => {
      // Invalida explícitamente las keys principales
      const result = await dashboardApi.refreshKPIs();
      return result;
    }
  );
}

export function useCostosBreakdown() {
  return useSWR(
    KEYS.COSTOS,
    () => dashboardApi.getCostosBreakdown(),
    {
      dedupingInterval: 5 * 60 * 1000,
    }
  );
}

export function usePerformanceTrends(params: { desde: string; hasta: string; granularidad?: 'DIA' | 'SEMANA' | 'MES' }) {
  const key = [KEYS.TRENDS, JSON.stringify(params)];
  return useSWR(
    params.desde && params.hasta ? key : null,
    () => dashboardApi.getPerformanceTrends(params),
    {
      dedupingInterval: 10 * 60 * 1000,
    }
  );
}
