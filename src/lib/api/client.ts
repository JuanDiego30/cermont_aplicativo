/**
 * Cliente HTTP base para todas las peticiones a la API
 * Maneja autenticación, errores y transformación de respuestas
 */

import { createClient } from '@/lib/supabase/client';
import { handleMockRequest } from './mock';

export interface ApiError {
  error: string;
  message?: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Cliente HTTP con manejo automático de auth y errores
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Modo Mock: no hace fetch, retorna desde localStorage
    if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
      const res: any = await handleMockRequest<T>(endpoint, options);
      return res;
    }
    // Obtener token de sesión de Supabase
    let session: any = null;
    try {
      const supabase = createClient() as any;
      if (supabase && supabase.auth?.getSession) {
        const r = await supabase.auth.getSession();
        session = r?.data?.session ?? null;
      }
    } catch {}

    // Configurar headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Agregar headers personalizados
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          headers[key] = value;
        }
      });
    }

    // Agregar token si existe sesión
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    // Resolver URL base: si el endpoint empieza con /api/ usamos Next; si no, usar BACKEND base si existe
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    const useNextApi = endpoint.startsWith('/api/');
    const url = useNextApi
      ? endpoint
      : base
        ? `${base}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`
        : endpoint;

    // Hacer la petición
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Parsear respuesta
    const json = await response.json();

    // Manejar errores HTTP
    if (!response.ok) {
      return {
        error: json.error || 'Error en la petición',
        message: json.message,
      };
    }

    return json;
  } catch (error) {
    console.error('API Client Error:', error);
    return {
      error: 'Error de conexión',
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Construye query params desde un objeto
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, String(v)));
      return;
    }
    if (typeof value === 'object') {
      searchParams.append(key, JSON.stringify(value));
      return;
    }
    searchParams.append(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Helpers para métodos HTTP comunes
 */
export const api = {
  get: <T>(endpoint: string, params?: Record<string, unknown>) => {
    const queryString = params ? buildQueryString(params) : '';
    return apiClient<T>(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  },

  post: <T>(endpoint: string, data: unknown) => {
    return apiClient<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  patch: <T>(endpoint: string, data: unknown) => {
    return apiClient<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: <T>(endpoint: string) => {
    return apiClient<T>(endpoint, {
      method: 'DELETE',
    });
  },
};
