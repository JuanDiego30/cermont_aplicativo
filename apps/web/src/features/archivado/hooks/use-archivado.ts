import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { archivadoApi, type ArchivarOrdenDto } from '../api/archivado-api';

const KEYS = {
  LIST: '/archivado/list',
  ESTADISTICAS: '/archivado/estadisticas',
  ARCHIVOS: '/archivado/archivos',
};

export function useArchivadas(params?: { page?: number; limit?: number; fechaDesde?: string; fechaHasta?: string }) {
  const key = [KEYS.LIST, JSON.stringify(params)];
  return useSWR(
    key,
    () => archivadoApi.list(params),
    {
      dedupingInterval: 2 * 60 * 1000,
    }
  );
}

export function useEstadisticasArchivado() {
  return useSWR(
    KEYS.ESTADISTICAS,
    () => archivadoApi.getEstadisticas(),
    {
      dedupingInterval: 5 * 60 * 1000,
    }
  );
}

export function useArchivosHistoricos(anio?: number) {
  return useSWR(
    [KEYS.ARCHIVOS, anio],
    () => archivadoApi.getArchivosHistoricos(anio),
    {
      dedupingInterval: 5 * 60 * 1000,
    }
  );
}

export function useArchivarOrden() {
  return useSWRMutation(
    KEYS.LIST,
    async (_, { arg: data }: { arg: ArchivarOrdenDto }) => {
      return archivadoApi.archivar(data);
    }
  );
}

export function useDesarchivarOrden() {
  return useSWRMutation(
    KEYS.LIST,
    async (_, { arg: ordenId }: { arg: string }) => {
      return archivadoApi.desarchivar(ordenId);
    }
  );
}

export function useArchivarMes() {
  return useSWRMutation(
    KEYS.ESTADISTICAS, // Invalidamos estadísticas porque cambia el conteo
    async (_, { arg }: { arg: { mes: number; anio: number } }) => {
      return archivadoApi.archivarMes(arg.mes, arg.anio);
    }
  );
}

export function useArchivarAhora() {
  return useSWRMutation(
    KEYS.LIST,
    async () => {
      return archivadoApi.archivarAhora();
    }
  );
}

export function useGenerarZipEvidencias() {
  return useSWRMutation(
    KEYS.ARCHIVOS,
    async (_, { arg }: { arg: { mes: number; anio: number } }) => {
      return archivadoApi.generarZipEvidencias(arg.mes, arg.anio);
    }
  );
}
