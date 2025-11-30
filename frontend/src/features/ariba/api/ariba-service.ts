import apiClient from '@/core/api/client';
import type { 
  AribaSES, 
  AribaInvoice, 
  AribaSESStatus, 
  AribaInvoiceStatus,
  OrderToSESMapping,
  AribaApiResponse 
} from '../types';

const API_BASE = '/api/ariba';

export const aribaApi = {
  // ============================================================================
  // SES (Service Entry Sheet) Operations
  // ============================================================================

  /**
   * Create a new SES from an order
   */
  async createSES(orderId: string): Promise<AribaSES> {
    const response = await apiClient.post<AribaSES>(`${API_BASE}/ses`, { orderId });
    return response;
  },

  /**
   * Get SES by ID
   */
  async getSES(sesId: string): Promise<AribaSES> {
    const response = await apiClient.get<AribaSES>(`${API_BASE}/ses/${sesId}`);
    return response;
  },

  /**
   * Get SES by order ID
   */
  async getSESByOrder(orderId: string): Promise<AribaSES | null> {
    try {
      const response = await apiClient.get<AribaSES>(`${API_BASE}/ses/order/${orderId}`);
      return response;
    } catch {
      return null;
    }
  },

  /**
   * List all SES with filters
   */
  async listSES(params?: {
    status?: AribaSESStatus;
    vendorId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
  }): Promise<AribaApiResponse<AribaSES[]>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.set('status', params.status);
    if (params?.vendorId) queryParams.set('vendorId', params.vendorId);
    if (params?.fromDate) queryParams.set('fromDate', params.fromDate);
    if (params?.toDate) queryParams.set('toDate', params.toDate);
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.pageSize) queryParams.set('pageSize', params.pageSize.toString());
    
    const queryString = queryParams.toString();
    const url = queryString ? `${API_BASE}/ses?${queryString}` : `${API_BASE}/ses`;
    const response = await apiClient.get<AribaApiResponse<AribaSES[]>>(url);
    return response;
  },

  /**
   * Submit SES for approval
   */
  async submitSES(sesId: string): Promise<AribaSES> {
    const response = await apiClient.post<AribaSES>(`${API_BASE}/ses/${sesId}/submit`);
    return response;
  },

  /**
   * Update SES draft
   */
  async updateSES(sesId: string, data: Partial<AribaSES>): Promise<AribaSES> {
    const response = await apiClient.put<AribaSES>(`${API_BASE}/ses/${sesId}`, data);
    return response;
  },

  /**
   * Cancel SES
   */
  async cancelSES(sesId: string, reason: string): Promise<void> {
    await apiClient.post(`${API_BASE}/ses/${sesId}/cancel`, { reason });
  },

  /**
   * Sync SES status from Ariba
   */
  async syncSESStatus(sesId: string): Promise<AribaSES> {
    const response = await apiClient.post<AribaSES>(`${API_BASE}/ses/${sesId}/sync`);
    return response;
  },

  // ============================================================================
  // Invoice Operations
  // ============================================================================

  /**
   * Create invoice from SES
   */
  async createInvoice(sesId: string, invoiceData: {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
  }): Promise<AribaInvoice> {
    const response = await apiClient.post<AribaInvoice>(`${API_BASE}/invoices`, {
      sesId,
      ...invoiceData,
    });
    return response;
  },

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<AribaInvoice> {
    const response = await apiClient.get<AribaInvoice>(`${API_BASE}/invoices/${invoiceId}`);
    return response;
  },

  /**
   * Get invoice by SES
   */
  async getInvoiceBySES(sesId: string): Promise<AribaInvoice | null> {
    try {
      const response = await apiClient.get<AribaInvoice>(`${API_BASE}/invoices/ses/${sesId}`);
      return response;
    } catch {
      return null;
    }
  },

  /**
   * List all invoices with filters
   */
  async listInvoices(params?: {
    status?: AribaInvoiceStatus;
    vendorId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
  }): Promise<AribaApiResponse<AribaInvoice[]>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.set('status', params.status);
    if (params?.vendorId) queryParams.set('vendorId', params.vendorId);
    if (params?.fromDate) queryParams.set('fromDate', params.fromDate);
    if (params?.toDate) queryParams.set('toDate', params.toDate);
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.pageSize) queryParams.set('pageSize', params.pageSize.toString());
    
    const queryString = queryParams.toString();
    const url = queryString ? `${API_BASE}/invoices?${queryString}` : `${API_BASE}/invoices`;
    const response = await apiClient.get<AribaApiResponse<AribaInvoice[]>>(url);
    return response;
  },

  /**
   * Submit invoice for approval
   */
  async submitInvoice(invoiceId: string): Promise<AribaInvoice> {
    const response = await apiClient.post<AribaInvoice>(`${API_BASE}/invoices/${invoiceId}/submit`);
    return response;
  },

  /**
   * Sync invoice status from Ariba
   */
  async syncInvoiceStatus(invoiceId: string): Promise<AribaInvoice> {
    const response = await apiClient.post<AribaInvoice>(`${API_BASE}/invoices/${invoiceId}/sync`);
    return response;
  },

  // ============================================================================
  // Mapping Operations
  // ============================================================================

  /**
   * Get order to SES mapping
   */
  async getOrderMapping(orderId: string): Promise<OrderToSESMapping | null> {
    try {
      const response = await apiClient.get<OrderToSESMapping>(`${API_BASE}/mappings/order/${orderId}`);
      return response;
    } catch {
      return null;
    }
  },

  /**
   * Sync all pending mappings
   */
  async syncAllPending(): Promise<{ synced: number; failed: number }> {
    const response = await apiClient.post<{ synced: number; failed: number }>(`${API_BASE}/sync/all`);
    return response;
  },

  // ============================================================================
  // Connection & Config
  // ============================================================================

  /**
   * Test Ariba connection
   */
  async testConnection(): Promise<{ connected: boolean; message: string }> {
    const response = await apiClient.get<{ connected: boolean; message: string }>(`${API_BASE}/test-connection`);
    return response;
  },

  /**
   * Get Ariba config status
   */
  async getConfigStatus(): Promise<{
    configured: boolean;
    realm?: string;
    lastSync?: Date;
  }> {
    const response = await apiClient.get<{
      configured: boolean;
      realm?: string;
      lastSync?: Date;
    }>(`${API_BASE}/config/status`);
    return response;
  },
};

export default aribaApi;
