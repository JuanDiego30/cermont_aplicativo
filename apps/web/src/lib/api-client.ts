// 📁 web/src/lib/api-client.ts
// ✅ Cliente API unificado con manejo de refresh tokens y errores estructurados

import { useAuthStore } from '@/stores/authStore';

function buildApiBaseUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const API_BASE_URL = buildApiBaseUrl(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
);

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  includeAuth?: boolean;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  status?: number;
  errors?: Record<string, string[]>;
  data?: unknown;
}

export class ApiException extends Error {
  public readonly statusCode: number;
  public readonly errors?: Record<string, string[]>;
  public readonly data?: unknown;

  constructor(message: string, statusCode: number, errors?: Record<string, string[]>, data?: unknown) {
    super(message);
    this.name = 'ApiException';
    this.statusCode = statusCode;
    this.errors = errors;
    this.data = data;
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeader(): Record<string, string> {
    const token = useAuthStore.getState().token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, includeAuth = true, ...fetchOptions } = options;

    // Build URL with query params
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(includeAuth ? this.getAuthHeader() : {}),
      ...(options.headers as Record<string, string> || {}),
    };

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include', // ✅ Siempre incluir cookies para refresh tokens
    });

    if (response.status === 401) {
      // Intentar refresh token
      try {
        const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // ✅ Forzar envío de cookies HttpOnly
        }); // Cookie httpOnly se envía automáticamente

        if (refreshResponse.ok) {
          const { token: newToken } = await refreshResponse.json();
          useAuthStore.getState().setToken(newToken);

          // Reintentar petición original con nuevo token
          const newHeaders = {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          };

          const retryResponse = await fetch(url, {
            ...fetchOptions,
            headers: newHeaders,
            credentials: 'include',
          });

          if (retryResponse.ok) {
            if (retryResponse.status === 204) return {} as T;
            return retryResponse.json();
          }
        } else {
          // Si falla el refresh, logout
          useAuthStore.getState().logout();
          throw new Error('Sesión expirada');
        }
      } catch (error) {
        useAuthStore.getState().logout();
        throw error;
      }
    }

    if (!response.ok) {
      let errorData: ApiError = { message: 'Error de servidor' };
      
      try {
        errorData = await response.json();
      } catch {
        // Use default error message
      }

      throw new ApiException(
        errorData.message || 'Error en la petición',
        response.status,
        errorData.errors,
        errorData.data
      );
    }

    // Handle no content response
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(endpoint: string, data?: unknown, options?: { includeAuth?: boolean }): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      includeAuth: options?.includeAuth,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Upload genérico con multipart/form-data.
   * Útil para endpoints que requieren archivo + campos extra.
   */
  async uploadForm<T>(endpoint: string, formData: FormData, options?: { includeAuth?: boolean }): Promise<T> {
    const includeAuth = options?.includeAuth ?? true;
    const url = `${this.baseUrl}${endpoint}`;

    const buildHeaders = (tokenOverride?: string): Record<string, string> => {
      if (!includeAuth) return {};
      if (tokenOverride) return { Authorization: `Bearer ${tokenOverride}` };
      return this.getAuthHeader();
    };

    let response = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(),
      body: formData,
      credentials: 'include',
    });

    if (response.status === 401 && includeAuth) {
      try {
        const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          const { token: newToken } = await refreshResponse.json();
          useAuthStore.getState().setToken(newToken);

          response = await fetch(url, {
            method: 'POST',
            headers: buildHeaders(newToken),
            body: formData,
            credentials: 'include',
          });
        } else {
          useAuthStore.getState().logout();
          throw new ApiException('Sesión expirada', 401);
        }
      } catch (error) {
        useAuthStore.getState().logout();
        throw error;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiException(
        errorData.message || 'Error en la petición',
        response.status,
        errorData.errors,
        errorData.data
      );
    }

    if (response.status === 204) return undefined as T;
    return response.json();
  }

  /**
   * Upload file with multipart/form-data
   */
  async upload<T>(endpoint: string, file: File, fieldName = 'file'): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    return this.uploadForm<T>(endpoint, formData);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
