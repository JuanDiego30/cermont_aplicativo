/**
 * API Client Completo con TypeScript
 * Cliente HTTP tipado para todos los endpoints del backend
 *
 * @file api-client.ts
 * @location frontend/lib/api/api-client.ts
 */

import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type {
  ApiResponse,
  PaginatedResponse,
  // Auth
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  User,
  // Orders
  Order,
  CreateOrderRequest,
  UpdateOrderRequest,
  TransitionStateRequest,
  AssignOrderRequest,
  OrderFilters,
  OrderStats,
  // WorkPlans
  WorkPlan,
  CreateWorkPlanRequest,
  ApproveWorkPlanRequest,
  RejectWorkPlanRequest,
  UpdateBudgetRequest,
  // Evidences
  Evidence,
  UploadEvidenceRequest,
  ApproveEvidenceRequest,
  RejectEvidenceRequest,
  EvidenceStage,
  // Kits
  Kit,
  CreateKitRequest,
  // Reports
  GenerateReportResponse,
  // Dashboard
  DashboardKPIs,
} from './shared-types';

/**
 * Configuraci�n del API Client
 */
interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  withCredentials?: boolean;
}

/**
 * API Client Class
 */
export class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(config: ApiClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      withCredentials: config.withCredentials || true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Si es 401 y tenemos refresh token, intentar renovar
        if (error.response?.status === 401 && !originalRequest._retry && this.refreshToken) {
          originalRequest._retry = true;

          try {
            const { accessToken } = await this.auth.refresh({
              refreshToken: this.refreshToken,
            });

            this.setTokens(accessToken, this.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Set authentication tokens
   */
  setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  /**
   * Clear authentication tokens
   */
  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  /**
   * Load tokens from localStorage
   */
  loadTokens(): void {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  // ========================================
  // AUTH ENDPOINTS
  // ========================================

  auth = {
    /**
     * Login
     */
    login: async (data: LoginRequest): Promise<LoginResponse> => {
      const response = await this.client.post<ApiResponse<LoginResponse>>(
        '/api/auth/login',
        data
      );
      const result = response.data.data!;
      this.setTokens(result.accessToken, result.refreshToken);
      return result;
    },

    /**
     * Logout
     */
    logout: async (): Promise<void> => {
      await this.client.post('/api/auth/logout', {
        refreshToken: this.refreshToken,
      });
      this.clearTokens();
    },

    /**
     * Refresh access token
     */
    refresh: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
      const response = await this.client.post<ApiResponse<RefreshTokenResponse>>(
        '/api/auth/refresh',
        data
      );
      return response.data.data!;
    },

    /**
     * Change password
     */
    changePassword: async (data: {
      currentPassword: string;
      newPassword: string;
    }): Promise<void> => {
      await this.client.post('/api/auth/change-password', data);
    },

    /**
     * Get current user profile
     */
    getProfile: async (): Promise<User> => {
      const response = await this.client.get<ApiResponse<User>>('/api/auth/profile');
      return response.data.data!;
    },
  };

  // ========================================
  // ORDERS ENDPOINTS
  // ========================================

  orders = {
    /**
     * Create order
     */
    create: async (data: CreateOrderRequest): Promise<Order> => {
      const response = await this.client.post<ApiResponse<Order>>('/api/orders', data);
      return response.data.data!;
    },

    /**
     * Get order by ID
     */
    getById: async (id: string): Promise<Order> => {
      const response = await this.client.get<ApiResponse<Order>>(`/api/orders/${id}`);
      return response.data.data!;
    },

    /**
     * List orders with filters
     */
    list: async (filters?: OrderFilters): Promise<PaginatedResponse<Order>> => {
      const response = await this.client.get<PaginatedResponse<Order>>('/api/orders', {
        params: filters,
      });
      return response.data;
    },

    /**
     * Transition order state
     */
    transitionState: async (id: string, data: TransitionStateRequest): Promise<Order> => {
      const response = await this.client.patch<ApiResponse<Order>>(
        `/api/orders/${id}/state`,
        data
      );
      return response.data.data!;
    },

    /**
     * Assign order to technician
     */
    assign: async (id: string, data: AssignOrderRequest): Promise<Order> => {
      const response = await this.client.patch<ApiResponse<Order>>(
        `/api/orders/${id}/assign`,
        data
      );
      return response.data.data!;
    },

    /**
     * Update order
     */
    update: async (id: string, data: UpdateOrderRequest): Promise<Order> => {
      const response = await this.client.patch<ApiResponse<Order>>(
        `/api/orders/${id}`,
        data
      );
      return response.data.data!;
    },

    /**
     * Archive order
     */
    archive: async (id: string): Promise<Order> => {
      const response = await this.client.patch<ApiResponse<Order>>(
        `/api/orders/${id}/archive`
      );
      return response.data.data!;
    },

    /**
     * Delete order
     */
    delete: async (id: string): Promise<void> => {
      await this.client.delete(`/api/orders/${id}`);
    },

    /**
     * Get order statistics
     */
    getStats: async (filters?: {
      startDate?: string;
      endDate?: string;
    }): Promise<OrderStats> => {
      const response = await this.client.get<ApiResponse<OrderStats>>('/api/orders/stats', {
        params: filters,
      });
      return response.data.data!;
    },

    /**
     * Get order history (audit trail)
     */
    getHistory: async (id: string): Promise<any[]> => {
      const response = await this.client.get<ApiResponse<any[]>>(
        `/api/orders/${id}/history`
      );
      return response.data.data!;
    },
  };

  // ========================================
  // WORKPLANS ENDPOINTS
  // ========================================

  workplans = {
    /**
     * Create work plan
     */
    create: async (data: CreateWorkPlanRequest): Promise<WorkPlan> => {
      const response = await this.client.post<ApiResponse<WorkPlan>>(
        '/api/workplans',
        data
      );
      return response.data.data!;
    },

    /**
     * Get work plan by ID
     */
    getById: async (id: string): Promise<WorkPlan> => {
      const response = await this.client.get<ApiResponse<WorkPlan>>(
        `/api/workplans/${id}`
      );
      return response.data.data!;
    },

    /**
     * Get work plan by order ID
     */
    getByOrderId: async (orderId: string): Promise<WorkPlan | null> => {
      const response = await this.client.get<ApiResponse<WorkPlan>>(
        `/api/workplans/order/${orderId}`
      );
      return response.data.data || null;
    },

    /**
     * Update work plan
     */
    update: async (id: string, data: Partial<CreateWorkPlanRequest>): Promise<WorkPlan> => {
      const response = await this.client.patch<ApiResponse<WorkPlan>>(
        `/api/workplans/${id}`,
        data
      );
      return response.data.data!;
    },

    /**
     * Approve work plan
     */
    approve: async (id: string, data: ApproveWorkPlanRequest): Promise<WorkPlan> => {
      const response = await this.client.post<ApiResponse<WorkPlan>>(
        `/api/workplans/${id}/approve`,
        data
      );
      return response.data.data!;
    },

    /**
     * Reject work plan
     */
    reject: async (id: string, data: RejectWorkPlanRequest): Promise<WorkPlan> => {
      const response = await this.client.post<ApiResponse<WorkPlan>>(
        `/api/workplans/${id}/reject`,
        data
      );
      return response.data.data!;
    },

    /**
     * Update budget
     */
    updateBudget: async (id: string, data: UpdateBudgetRequest): Promise<WorkPlan> => {
      const response = await this.client.patch<ApiResponse<WorkPlan>>(
        `/api/workplans/${id}/budget`,
        data
      );
      return response.data.data!;
    },

    /**
     * Generate PDF
     */
    generatePDF: async (id: string): Promise<Blob> => {
      const response = await this.client.get(`/api/workplans/${id}/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    },
  };

  // ========================================
  // EVIDENCES ENDPOINTS
  // ========================================

  evidences = {
    /**
     * Upload evidence
     */
    upload: async (data: {
      orderId: string;
      stage: EvidenceStage;
      file: File;
    }): Promise<Evidence> => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('orderId', data.orderId);
      formData.append('stage', data.stage);

      const response = await this.client.post<ApiResponse<Evidence>>(
        '/api/evidences',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data!;
    },

    /**
     * Approve evidence
     */
    approve: async (id: string, data: ApproveEvidenceRequest): Promise<Evidence> => {
      const response = await this.client.post<ApiResponse<Evidence>>(
        `/api/evidences/${id}/approve`,
        data
      );
      return response.data.data!;
    },

    /**
     * Reject evidence
     */
    reject: async (id: string, data: RejectEvidenceRequest): Promise<Evidence> => {
      const response = await this.client.post<ApiResponse<Evidence>>(
        `/api/evidences/${id}/reject`,
        data
      );
      return response.data.data!;
    },

    /**
     * Get evidences by order
     */
    getByOrder: async (orderId: string): Promise<Evidence[]> => {
      const response = await this.client.get<ApiResponse<Evidence[]>>(
        `/api/evidences/order/${orderId}`
      );
      return response.data.data!;
    },

    /**
     * Delete evidence
     */
    delete: async (id: string): Promise<void> => {
      await this.client.delete(`/api/evidences/${id}`);
    },

    /**
     * Sync offline evidences
     */
    sync: async (evidences: any[]): Promise<void> => {
      await this.client.post('/api/evidences/sync', { evidences });
    },

    /**
     * Download evidence file
     */
    download: async (filePath: string): Promise<Blob> => {
      const response = await this.client.get(`/api/evidences/files/${filePath}`, {
        responseType: 'blob',
      });
      return response.data;
    },
  };

  // ========================================
  // KITS ENDPOINTS
  // ========================================

  kits = {
    /**
     * Create kit
     */
    create: async (data: CreateKitRequest): Promise<Kit> => {
      const response = await this.client.post<ApiResponse<Kit>>('/api/kits', data);
      return response.data.data!;
    },

    /**
     * List all kits
     */
    list: async (): Promise<Kit[]> => {
      const response = await this.client.get<ApiResponse<Kit[]>>('/api/kits');
      return response.data.data!;
    },

    /**
     * Get kit by ID
     */
    getById: async (id: string): Promise<Kit> => {
      const response = await this.client.get<ApiResponse<Kit>>(`/api/kits/${id}`);
      return response.data.data!;
    },

    /**
     * Update kit
     */
    update: async (id: string, data: Partial<CreateKitRequest>): Promise<Kit> => {
      const response = await this.client.patch<ApiResponse<Kit>>(`/api/kits/${id}`, data);
      return response.data.data!;
    },

    /**
     * Delete kit
     */
    delete: async (id: string): Promise<void> => {
      await this.client.delete(`/api/kits/${id}`);
    },
  };

  // ========================================
  // REPORTS ENDPOINTS
  // ========================================

  reports = {
    /**
     * Generate activity report
     */
    generateActivityReport: async (orderId: string): Promise<Blob> => {
      const response = await this.client.get(`/api/reports/activity/${orderId}`, {
        responseType: 'blob',
      });
      return response.data;
    },

    /**
     * Generate acta de entrega
     */
    generateActaEntrega: async (orderId: string): Promise<Blob> => {
      const response = await this.client.post(
        `/api/reports/acta-entrega/${orderId}`,
        {},
        {
          responseType: 'blob',
        }
      );
      return response.data;
    },

    /**
     * Generate SES format
     */
    generateSES: async (orderId: string): Promise<Blob> => {
      const response = await this.client.post(
        `/api/reports/ses/${orderId}`,
        {},
        {
          responseType: 'blob',
        }
      );
      return response.data;
    },

    /**
     * Generate cost report
     */
    generateCostReport: async (workPlanId: string): Promise<Blob> => {
      const response = await this.client.get(`/api/reports/costs/${workPlanId}`, {
        responseType: 'blob',
      });
      return response.data;
    },

    /**
     * Generate dashboard report
     */
    generateDashboardReport: async (): Promise<Blob> => {
      const response = await this.client.get('/api/reports/dashboard', {
        responseType: 'blob',
      });
      return response.data;
    },
  };

  // ========================================
  // DASHBOARD ENDPOINTS
  // ========================================

  dashboard = {
    /**
     * Get KPIs
     */
    getKPIs: async (): Promise<DashboardKPIs> => {
      const response = await this.client.get<ApiResponse<DashboardKPIs>>(
        '/api/dashboard/kpis'
      );
      return response.data.data!;
    },
  };
}

/**
 * Instancia singleton del API Client
 */
export const apiClient = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 30000,
  withCredentials: true,
});

// Load tokens on init
if (typeof window !== 'undefined') {
  apiClient.loadTokens();
}
