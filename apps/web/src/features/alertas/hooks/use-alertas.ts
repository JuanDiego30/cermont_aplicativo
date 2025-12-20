import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { alertasApi } from '../api/alertas-api';

// Keys para invalidación
const KEYS = {
  MIS_ALERTAS: '/alertas/mis-alertas',
  TODAS_ALERTAS: '/alertas/todas',
  RESUMEN: '/alertas/resumen',
};

export function useMisAlertas() {
  return useSWR(
    KEYS.MIS_ALERTAS,
    () => alertasApi.getMisAlertas(),
    {
      refreshInterval: 60 * 1000, // Refrescar cada minuto
      dedupingInterval: 30 * 1000, // 30 segundos
    }
  );
}

export function useTodasAlertas() {
  return useSWR(
    KEYS.TODAS_ALERTAS,
    () => alertasApi.getTodasAlertas(),
    {
      dedupingInterval: 60 * 1000, // 1 minuto
    }
  );
}

export function useResumenAlertas() {
  return useSWR(
    KEYS.RESUMEN,
    () => alertasApi.getResumen(),
    {
      refreshInterval: 60 * 1000, // Refrescar cada minuto
      dedupingInterval: 30 * 1000, // 30 segundos
    }
  );
}

export function useMarcarAlertaLeida() {
  return useSWRMutation(
    KEYS.MIS_ALERTAS,
    async (_, { arg: id }: { arg: string }) => {
      await alertasApi.marcarLeida(id);
    }
  );
}

export function useMarcarAlertaResuelta() {
  return useSWRMutation(
    KEYS.MIS_ALERTAS,
    async (_, { arg: id }: { arg: string }) => {
      await alertasApi.marcarResuelta(id);
    }
  );
}

export function useEjecutarVerificacion() {
  return useSWRMutation(
    KEYS.MIS_ALERTAS,
    async () => {
      await alertasApi.ejecutarVerificacion();
    }
  );
}
