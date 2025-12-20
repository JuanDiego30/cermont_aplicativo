import useSWR from 'swr';
import { kpisApi } from '../api/kpis-api';

const KEYS = {
  DASHBOARD: '/kpis/dashboard',
  ORDEN: '/kpis/orden',
};

export function useDashboardKPIs() {
  return useSWR(
    KEYS.DASHBOARD,
    () => kpisApi.getDashboardKPIs(),
    {
      dedupingInterval: 5 * 60 * 1000,
    }
  );
}

export function useOrdenKPIs(ordenId: string) {
  return useSWR(
    ordenId ? `${KEYS.ORDEN}/${ordenId}` : null,
    () => kpisApi.getOrdenKPIs(ordenId),
    {
      dedupingInterval: 2 * 60 * 1000,
    }
  );
}
