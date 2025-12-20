/**
 * @file archivado-api.ts
 * @description API client para Archivado
 */

import { apiClient } from '@/lib/api';

export interface EstadisticasArchivado {
  totalArchivos: number;
  totalOrdenesArchivadas: number;
  espacioUsado: number;
  archivosPorAnio: Record<string, number>;
}

export interface ArchivoHistorico {
  id: string;
  tipo: string;
  mes: number;
  anio: number;
  nombreArchivo: string;
  tamanioBytes: number;
  cantidadOrdenes: number;
  cantidadEvidencias: number;
  disponible: boolean;
  fechaArchivado: string;
}

export interface ArchivarOrdenDto {
  ordenId: string;
  motivo?: string;
}

export const archivadoApi = {
  /**
   * Listar órdenes archivadas
   */
  list: async (params?: {
    page?: number;
    limit?: number;
    fechaDesde?: string;
    fechaHasta?: string;
  }): Promise<{ data: any[]; total: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.limit) searchParams.append('limit', String(params.limit));
    if (params?.fechaDesde) searchParams.append('fechaDesde', params.fechaDesde);
    if (params?.fechaHasta) searchParams.append('fechaHasta', params.fechaHasta);
    const query = searchParams.toString();
    return apiClient.get<{ data: any[]; total: number }>(`/archivado${query ? `?${query}` : ''}`);
  },

  /**
   * Archivar una orden
   */
  archivar: async (data: ArchivarOrdenDto): Promise<any> => {
    return apiClient.post('/archivado', data);
  },

  /**
   * Desarchivar una orden
   */
  desarchivar: async (ordenId: string): Promise<void> => {
    return apiClient.delete(`/archivado/${ordenId}`);
  },

  /**
   * Obtener estadísticas de archivado
   */
  getEstadisticas: async (): Promise<EstadisticasArchivado> => {
    return apiClient.get<EstadisticasArchivado>('/archivado/estadisticas');
  },

  /**
   * Listar archivos históricos disponibles
   */
  getArchivosHistoricos: async (anio?: number): Promise<{ data: ArchivoHistorico[] }> => {
    const searchParams = new URLSearchParams();
    if (anio) searchParams.append('anio', String(anio));
    const query = searchParams.toString();
    return apiClient.get<{ data: ArchivoHistorico[] }>(`/archivado/archivos${query ? `?${query}` : ''}`);
  },

  /**
   * Descargar archivo histórico
   */
  descargarArchivo: async (id: string): Promise<void> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const url = `${API_BASE_URL}/api/archivado/descargar/${id}`;
    
    // Obtener token del storage o cookie
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const response = await fetch(url, {
      credentials: 'include',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    
    if (!response.ok) {
      throw new Error('Error al descargar archivo');
    }
    
    // Crear blob y descargar
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `archivo-${id}.zip`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
  },

  /**
   * Archivar órdenes de un mes específico manualmente (admin)
   */
  archivarMes: async (mes: number, anio: number): Promise<{ message: string; archivadas: number; archivo: any }> => {
    return apiClient.post<{ message: string; archivadas: number; archivo: any }>(`/archivado/archivar/${mes}/${anio}`);
  },

  /**
   * Ejecutar archivado automático ahora (admin)
   */
  archivarAhora: async (): Promise<{ message: string; archivadas: number }> => {
    return apiClient.post<{ message: string; archivadas: number }>('/archivado/archivar-ahora');
  },

  /**
   * Generar ZIP con evidencias de un mes (admin)
   */
  generarZipEvidencias: async (mes: number, anio: number): Promise<{ message: string; archivo: any }> => {
    return apiClient.post<{ message: string; archivo: any }>(`/archivado/zip-evidencias/${mes}/${anio}`);
  },
};
