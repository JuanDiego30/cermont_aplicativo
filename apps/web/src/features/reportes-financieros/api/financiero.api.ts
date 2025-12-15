/**
 * ARCHIVO: financiero.api.ts
 * FUNCION: Cliente API para operaciones de reportes financieros
 * IMPLEMENTACION: Usa apiClient centralizado (baseURL + JWT + refresh)
 * EXPORTS: financieroApi (objeto con métodos async)
 */
import type {
  FinancialFilters,
  FinancialResponse,
  FinancialData,
  FinancialSummary,
  ExportConfig,
} from './financiero.types';

import { apiClient } from '@/lib/api-client';

export const financieroApi = {
  /**
   * Obtiene datos financieros según filtros
   */
  async getData(filters: FinancialFilters): Promise<FinancialResponse> {
    const params: Record<string, string> = {
      periodo: filters.periodo,
    };
    if (filters.fechaInicio) params.fechaInicio = filters.fechaInicio;
    if (filters.fechaFin) params.fechaFin = filters.fechaFin;
    if (filters.categoria) params.categoria = filters.categoria;

    return apiClient.get<FinancialResponse>('/reportes/financieros', params);
  },

  /**
   * Obtiene resumen de KPIs financieros
   */
  async getSummary(periodo: string): Promise<FinancialSummary> {
    return apiClient.get<FinancialSummary>('/reportes/financieros/summary', { periodo });
  },

  /**
   * Exporta reporte financiero
   */
  async export(filters: FinancialFilters, config: ExportConfig): Promise<Blob> {
    return apiClient.postBlob('/reportes/financieros/export', { filters, config });
  },
};

export default financieroApi;
