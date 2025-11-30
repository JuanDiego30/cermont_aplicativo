/**
 * API Client - CERMONT
 * HTTP client con autenticación, timeout, retry y soporte offline
 * 
 * Características:
 * - Timeout configurable con AbortController
 * - Retry automático con backoff exponencial
 * - Refresh de tokens transparente
 * - Soporte offline con sincronización
 * - Manejo de errores unificado
 */

import { env } from '../config';
import { getAccessToken, getRefreshToken, updateAccessToken, clearSession } from '@/features/auth/utils/session';

// ============================================================================
// Types & Constants
// ============================================================================

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type OfflineActionType = 'CREATE' | 'UPDATE' | 'DELETE';

interface RequestConfig extends Omit<RequestInit, 'body' | 'method'> {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  requiresAuth?: boolean;
}

interface ApiError extends Error {
  status?: number;
  statusText?: string;
  data?: unknown;
  isNetworkError?: boolean;
  isTimeout?: boolean;
}

const DEFAULT_TIMEOUT = 30000; // 30 segundos
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY = 1000; // 1 segundo
const API_BASE_URL = env.API_URL;

// ============================================================================
// Token Refresh Management
// ============================================================================

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      console.log('No refresh token available');
      return false;
    }

    console.log('Attempting to refresh access token');

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      console.log('Failed to refresh token:', response.status);
      return false;
    }

    const data = await response.json();

    // Verificar que la respuesta tenga el accessToken
    if (!data.accessToken || typeof data.accessToken !== 'string') {
      console.error('Invalid token format in refresh response');
      return false;
    }

    // Actualizar solo el access token
    updateAccessToken(data.accessToken);
    console.log('Access token refreshed successfully');
    return true;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return false;
  }
}

// ============================================================================
// Offline Sync Management
// ============================================================================

const offlineActionMap: Record<HttpMethod, OfflineActionType | null> = {
  GET: null,
  POST: 'CREATE',
  PUT: 'UPDATE',
  PATCH: 'UPDATE',
  DELETE: 'DELETE',
};

let syncServiceModule: typeof import('../offline/sync-service') | null = null;

async function getSyncService() {
  if (!syncServiceModule) {
    syncServiceModule = await import('../offline/sync-service');
  }
  return syncServiceModule.syncService;
}

async function handleOfflineRequest(method: HttpMethod, url: string, data?: unknown): Promise<boolean> {
  const offlineAction = offlineActionMap[method];

  if (!offlineAction || typeof navigator === 'undefined' || navigator.onLine) {
    return false;
  }

  const syncService = await getSyncService();
  await syncService.savePendingAction({
    type: offlineAction,
    endpoint: url,
    data: data ?? {},
  });

  return true;
}

// ============================================================================
// Error Handling
// ============================================================================

function createApiError(message: string, options?: Partial<ApiError>): ApiError {
  const error = new Error(message) as ApiError;
  error.name = 'ApiError';

  if (options) {
    Object.assign(error, options);
  }

  return error;
}

async function parseErrorResponse(response: Response): Promise<ApiError> {
  let data: unknown = {};

  try {
    data = await response.json();
  } catch {
    // Response no tiene JSON válido
  }

  return createApiError(`HTTP ${response.status}: ${response.statusText}`, {
    status: response.status,
    statusText: response.statusText,
    data,
  });
}

// ============================================================================
// Request Execution with Timeout & Retry
// ============================================================================

async function executeRequestWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw createApiError('La solicitud excedió el tiempo de espera', {
        isTimeout: true,
      });
    }

    throw createApiError('Error de conexión de red', {
      isNetworkError: true,
    });
  }
}

async function executeWithRetry(
  requestFn: () => Promise<Response>,
  config: RequestConfig
): Promise<Response> {
  const maxRetries = config.retries ?? DEFAULT_RETRIES;
  const baseDelay = config.retryDelay ?? DEFAULT_RETRY_DELAY;

  let lastError: ApiError | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await requestFn();

      // Solo reintentar en errores de servidor (5xx) o timeout
      if (response.status >= 500 && attempt < maxRetries) {
        await delay(baseDelay * Math.pow(2, attempt));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error as ApiError;

      // Reintentar en errores de red o timeout
      if ((lastError.isNetworkError || lastError.isTimeout) && attempt < maxRetries) {
        await delay(baseDelay * Math.pow(2, attempt));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError || createApiError('Error desconocido después de reintentos');
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Main Request Handler
// ============================================================================

/**
 * Make a fetch request with authentication
 */
const fetchWithAuth = async (
  url: string,
  options: RequestInit & { requiresAuth?: boolean } = {},
  config: RequestConfig = {}
): Promise<Response> => {
  const { requiresAuth = true, headers = {}, ...restOptions } = options;
  const timeout = config.timeout ?? DEFAULT_TIMEOUT;

  let requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Si requiere autenticación, agregar token
  if (requiresAuth) {
    const accessToken = getAccessToken();

    console.log('API Request:', url.replace(API_BASE_URL, ''), {
      hasToken: !!accessToken,
      tokenPreview: accessToken?.substring(0, 50) + '...',
    });

    if (accessToken) {
      requestHeaders = {
        ...requestHeaders,
        Authorization: `Bearer ${accessToken}`,
      };
    } else if (requiresAuth) {
      console.warn('No access token found for authenticated request');
    }
  }

  // Hacer la petición
  let response = await executeWithRetry(
    () => executeRequestWithTimeout(url, { ...restOptions, headers: requestHeaders }, timeout),
    config
  );

  // Si obtenemos 401 y requiere autenticación, intentar refrescar el token
  if (response.status === 401 && requiresAuth) {
    console.log(`401 received for ${url}, attempting refresh...`);

    const refreshSuccess = await refreshAccessToken();

    if (refreshSuccess) {
      // Reintentar con el nuevo token
      const newAccessToken = getAccessToken();

      if (newAccessToken) {
        requestHeaders = {
          ...requestHeaders,
          Authorization: `Bearer ${newAccessToken}`,
        };

        response = await executeWithRetry(
          () => executeRequestWithTimeout(url, { ...restOptions, headers: requestHeaders }, timeout),
          config
        );
      }
    } else {
      // Si falla el refresh, limpiar sesión y redirigir
      console.log('Token refresh failed, redirecting to signin');
      clearSession();

      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      }

      throw new Error('Session expired');
    }
  }

  return response;
};

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  // Manejar respuestas vacías (204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  const json = await response.json();
  return (json.data ?? json) as T;
}

async function request<T>(
  method: HttpMethod,
  url: string,
  data?: unknown,
  config: RequestConfig = {}
): Promise<T> {
  const fullUrl = `${API_BASE_URL}${url}`;

  // Manejar solicitudes offline
  const isOffline = await handleOfflineRequest(method, url, data);

  if (isOffline) {
    return { success: true, offline: true, message: 'Guardado offline' } as T;
  }

  const requestInit: RequestInit & { requiresAuth?: boolean } = {
    method,
    requiresAuth: config.requiresAuth,
  };

  if (data !== undefined && method !== 'GET') {
    requestInit.body = JSON.stringify(data);
  }

  const response = await fetchWithAuth(fullUrl, requestInit, config);
  return parseResponse<T>(response);
}

// ============================================================================
// API Client Export
// ============================================================================

const apiClient = {
  /**
   * Realiza una petición GET
   */
  get<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    return request('GET', url, undefined, config);
  },

  /**
   * Realiza una petición POST
   */
  post<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return request('POST', url, data, config);
  },

  /**
   * Realiza una petición PUT
   */
  put<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return request('PUT', url, data, config);
  },

  /**
   * Realiza una petición PATCH
   */
  patch<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return request('PATCH', url, data, config);
  },

  /**
   * Realiza una petición DELETE
   */
  delete<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    return request('DELETE', url, undefined, config);
  },
};

export default apiClient;
export type { RequestConfig, ApiError };
