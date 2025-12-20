import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { reportesApi, type ReporteQueryDto } from '../api/reportes-api';

const KEYS = {
  ORDENES: '/reportes/ordenes',
  ORDEN: '/reportes/orden',
};

export function useReporteOrdenes(query: ReporteQueryDto) {
  const key = [KEYS.ORDENES, JSON.stringify(query)];
  return useSWR(
    query.fechaInicio && query.fechaFin ? key : null,
    () => reportesApi.reporteOrdenes(query),
    {
      dedupingInterval: 5 * 60 * 1000,
    }
  );
}

export function useReporteOrden(id: string) {
  return useSWR(
    id ? `${KEYS.ORDEN}/${id}` : null,
    () => reportesApi.reporteOrden(id),
    {
      dedupingInterval: 2 * 60 * 1000,
    }
  );
}

export function useDescargarReporte() {
  return useSWRMutation(
    KEYS.ORDENES,
    async (_, { arg: query }: { arg: ReporteQueryDto }) => {
      return reportesApi.descargarReporte(query);
    }
  );
}
