/**
 * Cliente HTTP para comunicación con la API
 * Proporciona métodos para realizar peticiones HTTP con configuración centralizada
 */

import type { ApiRequestConfig } from '../types/api';

/**
 * URL base de la API
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Clase para manejar errores de la API
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Cliente HTTP genérico para la API
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Realiza una petición HTTP
   */
  private async request<T>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<T> {
    const { method = 'GET', headers = {}, body, cache } = config;

    const url = `${this.baseUrl}${endpoint}`;

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      cache,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || 'Error en la petición',
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Error de red o servidor', 500);
    }
  }

  /**
   * Realiza una petición GET
   */
  async get<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * Realiza una petición POST
   */
  async post<T>(endpoint: string, body?: unknown, config?: Omit<ApiRequestConfig, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  /**
   * Realiza una petición PUT
   */
  async put<T>(endpoint: string, body?: unknown, config?: Omit<ApiRequestConfig, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  /**
   * Realiza una petición PATCH
   */
  async patch<T>(endpoint: string, body?: unknown, config?: Omit<ApiRequestConfig, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body });
  }

  /**
   * Realiza una petición DELETE
   */
  async delete<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

/**
 * Instancia por defecto del cliente API
 */
export const apiClient = new ApiClient();
