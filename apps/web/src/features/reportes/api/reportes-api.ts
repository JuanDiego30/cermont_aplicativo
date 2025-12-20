/**
 * @file reportes-api.ts
 * @description API client completo para Reportes
 */

import { apiClient } from '@/lib/api';

export interface ReporteQueryDto {
  fechaInicio: string;
  fechaFin: string;
  estado?: string;
  tecnicoId?: string;
  formato?: 'json' | 'pdf' | 'excel';
}

export interface OrdenReporteData {
  id: string;
  numero: string;
  titulo: string;
  estado: string;
  prioridad: string;
  fechaCreacion: string;
  fechaCompletado?: string;
  tecnico?: string;
  horasTrabajadas: number;
}

export interface ReporteSummary {
  totalOrdenes: number;
  completadas: number;
  enProgreso: number;
  canceladas: number;
  horasTotales: number;
  promedioHorasPorOrden: number;
}

export interface ReporteResponse {
  summary: ReporteSummary;
  ordenes: OrdenReporteData[];
  generadoEn: string;
}

export interface ReporteOrdenDetalle {
  orden: any;
  ejecucion?: any;
  costos?: any[];
  evidencias?: any[];
  planeacion?: any;
}

export const reportesApi = {
  /**
   * Generar reporte de órdenes
   */
  reporteOrdenes: async (query: ReporteQueryDto): Promise<ReporteResponse> => {
    const searchParams = new URLSearchParams();
    searchParams.append('fechaInicio', query.fechaInicio);
    searchParams.append('fechaFin', query.fechaFin);
    if (query.estado) searchParams.append('estado', query.estado);
    if (query.tecnicoId) searchParams.append('tecnicoId', query.tecnicoId);
    if (query.formato) searchParams.append('formato', query.formato);
    
    return apiClient.get<ReporteResponse>(`/reportes/ordenes?${searchParams.toString()}`);
  },

  /**
   * Obtener reporte detallado de una orden
   */
  reporteOrden: async (id: string): Promise<ReporteOrdenDetalle> => {
    return apiClient.get<ReporteOrdenDetalle>(`/reportes/orden/${id}`);
  },

  /**
   * Descargar reporte en formato PDF/Excel
   */
  descargarReporte: async (query: ReporteQueryDto): Promise<void> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const searchParams = new URLSearchParams();
    searchParams.append('fechaInicio', query.fechaInicio);
    searchParams.append('fechaFin', query.fechaFin);
    if (query.estado) searchParams.append('estado', query.estado);
    if (query.tecnicoId) searchParams.append('tecnicoId', query.tecnicoId);
    searchParams.append('formato', query.formato || 'pdf');
    
    const url = `${API_BASE_URL}/api/reportes/ordenes?${searchParams.toString()}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const response = await fetch(url, {
      credentials: 'include',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    
    if (!response.ok) {
      throw new Error('Error al descargar reporte');
    }
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `reporte-ordenes-${query.fechaInicio}-${query.fechaFin}.${query.formato || 'pdf'}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
  },
};
