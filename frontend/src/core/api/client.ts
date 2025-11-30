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

// ============================================================================
// Types & Constants
// ============================================================================

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type OfflineActionType = 'CREATE' | 'UPDATE' | 'DELETE';

interface RequestConfig extends Omit<RequestInit, 'body' | 'method'> {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
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

// ============================================================================
// Token Refresh Management
// ============================================================================

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
let sessionModule: typeof import('@/features/auth/utils/session') | null = null;

async function getSessionFunctions() {
  if (!sessionModule) {
    sessionModule = await import('@/features/auth/utils/session');
  }
  return sessionModule;
}

async function refreshAccessToken(): Promise<string | null> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = executeTokenRefresh();
  }
  return refreshPromise;
}

async function executeTokenRefresh(): Promise<string | null> {
  try {
    const { getRefreshToken, setSession, clearSession } = await getSessionFunctions();
    const refreshToken = getRefreshToken();
    
    if (!refreshToken) return null;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${env.API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        clearSession();
        return null;
      }

      const data = await response.json();
      const payload = data?.data ?? data;
      const newAccessToken = payload?.accessToken;
      const newRefreshToken = payload?.refreshToken ?? refreshToken;

      if (newAccessToken) {
        setSession({ accessToken: newAccessToken, refreshToken: newRefreshToken });
        return newAccessToken;
      }

      return null;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch {
    const { clearSession } = await getSessionFunctions();
    clearSession();
    return null;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

function redirectToSignIn(): void {
  if (typeof window !== 'undefined' && !window.location.pathname.includes('/signin')) {
    window.location.href = '/signin';
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

async function buildHeaders(token: string | null): Promise<Headers> {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

async function executeRequestWithTimeout(
  url: string,
  options: RequestInit,
  headers: Headers,
  timeout: number
): Promise<Response> {
  const fullUrl = `${env.API_URL}${url}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
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
  url: string,
  options: RequestInit,
  headers: Headers,
  config: RequestConfig
): Promise<Response> {
  const maxRetries = config.retries ?? DEFAULT_RETRIES;
  const baseDelay = config.retryDelay ?? DEFAULT_RETRY_DELAY;
  const timeout = config.timeout ?? DEFAULT_TIMEOUT;

  let lastError: ApiError | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await executeRequestWithTimeout(url, options, headers, timeout);
      
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

async function handleUnauthorized(
  url: string,
  options: RequestInit,
  headers: Headers,
  config: RequestConfig
): Promise<Response | null> {
  // No intentar refresh en endpoints de autenticación
  if (url.includes('/auth/login') || url.includes('/auth/refresh')) {
    return null;
  }

  const newToken = await refreshAccessToken();

  if (newToken) {
    headers.set('Authorization', `Bearer ${newToken}`);
    return executeWithRetry(url, options, headers, config);
  }

  redirectToSignIn();
  return null;
}

async function fetchWithAuth(
  url: string, 
  options: RequestInit = {},
  config: RequestConfig = {}
): Promise<Response> {
  const { getAccessToken } = await getSessionFunctions();
  const token = getAccessToken();
  
  console.log(`🌐 API Request: ${url}`, {
    hasToken: !!token,
    tokenPreview: token?.substring(0, 30) + '...'
  });
  
  const headers = await buildHeaders(token);

  let response = await executeWithRetry(url, options, headers, config);

  if (response.status === 401) {
    console.log(`🔄 401 received for ${url}, attempting refresh...`);
    const retryResponse = await handleUnauthorized(url, options, headers, config);
    if (retryResponse) {
      response = retryResponse;
    }
  }

  return response;
}

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
  // Manejar solicitudes offline
  const isOffline = await handleOfflineRequest(method, url, data);

  if (isOffline) {
    return { success: true, offline: true, message: 'Guardado offline' } as T;
  }

  const requestInit: RequestInit = {
    method,
  };

  if (data !== undefined && method !== 'GET') {
    requestInit.body = JSON.stringify(data);
  }

  const response = await fetchWithAuth(url, requestInit, config);
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
