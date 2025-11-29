/**
 * Billing API Service
 * Servicio para gestión de facturación
 */

import apiClient from '@/core/api/client';
import type { 
  BillingStats, 
  BillingOrder, 
  BillingState, 
  BillingFilters,
  BillingListResponse,
  UpdateBillingStatePayload 
} from '../types';

const BASE_URL = '/billing';

export const billingApi = {
  /**
   * Obtiene estadísticas de facturación
   */
  getStats: async (): Promise<BillingStats> => {
    return apiClient.get<BillingStats>(`${BASE_URL}/stats`);
  },

  /**
   * Lista órdenes por estado de facturación
   */
  listByState: async (
    state: BillingState,
    page = 1,
    pageSize = 20
  ): Promise<BillingListResponse> => {
    const params = new URLSearchParams({
      state,
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    return apiClient.get<BillingListResponse>(`${BASE_URL}/orders?${params}`);
  },

  /**
   * Lista órdenes con filtros
   */
  list: async (
    filters: BillingFilters = {},
    page = 1,
    pageSize = 20
  ): Promise<BillingListResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    
    if (filters.state) params.append('state', filters.state);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.clientId) params.append('clientId', filters.clientId);
    if (filters.search) params.append('search', filters.search);
    
    return apiClient.get<BillingListResponse>(`${BASE_URL}/orders?${params}`);
  },

  /**
   * Obtiene detalle de facturación de una orden
   */
  getOrder: async (orderId: string): Promise<BillingOrder> => {
    return apiClient.get<BillingOrder>(`${BASE_URL}/orders/${orderId}`);
  },

  /**
   * Actualiza el estado de facturación de una orden
   */
  updateState: async (payload: UpdateBillingStatePayload): Promise<BillingOrder> => {
    return apiClient.patch<BillingOrder>(
      `${BASE_URL}/orders/${payload.orderId}/state`,
      {
        newState: payload.newState,
        notes: payload.notes
      }
    );
  },

  /**
   * Genera factura para una orden
   */
  generateInvoice: async (orderId: string): Promise<{ invoiceUrl: string }> => {
    return apiClient.post<{ invoiceUrl: string }>(
      `${BASE_URL}/orders/${orderId}/invoice`,
      {}
    );
  },

  /**
   * Registra un pago
   */
  recordPayment: async (
    orderId: string,
    amount: number,
    method: string
  ): Promise<BillingOrder> => {
    return apiClient.post<BillingOrder>(
      `${BASE_URL}/orders/${orderId}/payment`,
      { amount, method }
    );
  }
};
