/**
 * @file financiero.api.ts
 * @description API client para reportes financieros
 */

import axios from 'axios';
import type {
  FinancialFilters,
  FinancialResponse,
  FinancialData,
  FinancialSummary,
  ExportConfig,
} from './financiero.types';

// Configuración del cliente API
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const financieroApi = {
  /**
   * Obtiene datos financieros según filtros
   */
  async getData(filters: FinancialFilters): Promise<FinancialResponse> {
    const params = new URLSearchParams();
    
    params.append('periodo', filters.periodo);
    if (filters.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
    if (filters.fechaFin) params.append('fechaFin', filters.fechaFin);
    if (filters.categoria) params.append('categoria', filters.categoria);

    const response = await api.get<FinancialResponse>(`/api/reportes/financieros?${params}`);
    return response.data;
  },

  /**
   * Obtiene resumen de KPIs financieros
   */
  async getSummary(periodo: string): Promise<FinancialSummary> {
    const response = await api.get<FinancialSummary>(`/api/reportes/financieros/summary`, {
      params: { periodo },
    });
    return response.data;
  },

  /**
   * Exporta reporte financiero
   */
  async export(filters: FinancialFilters, config: ExportConfig): Promise<Blob> {
    const response = await api.post(
      '/api/reportes/financieros/export',
      { filters, config },
      { responseType: 'blob' }
    );
    return response.data;
  },
};

export default financieroApi;
