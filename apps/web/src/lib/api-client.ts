/**
 * @file api-client.ts
 * @description Cliente HTTP unificado para comunicación con el backend API
 * @implements Clase singleton ApiClient con patrón interceptor para refresh tokens,
 *             manejo automático de errores y soporte para uploads multipart
 * @dependencies fetch nativo, variables de entorno NEXT_PUBLIC_API_URL
 * @exports apiClient (singleton), ApiException (clase), ApiError (tipo)
 */

// ============================================
// TYPES
// ============================================
type TokenProvider = () => string | null;
type LogoutHandler = () => void;

// ============================================
// LAZY IMPORT para syncManager (solo cliente)
// Evita errores SSR con APIs del navegador
// ============================================
let syncManagerInstance: typeof import('@/lib/offline/sync-manager').syncManager | null = null;

async function getSyncManager() {
  if (typeof window === 'undefined') {
    return null; // No disponible en SSR
  }
  if (!syncManagerInstance) {
    const module = await import('@/lib/offline/sync-manager');
    syncManagerInstance = module.syncManager;
  }
  return syncManagerInstance;
}

// ============================================
// URL BUILDER
// ============================================
function buildApiBaseUrl(rawUrl: string): string {
  // En el navegador, detectar si estamos en un tunnel (devtunnels, ngrok, etc.)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Si estamos en un tunnel o dominio externo, usar el proxy de Next.js
    if (
      hostname.includes('devtunnels.ms') ||
      hostname.includes('ngrok') ||
      hostname.includes('vercel.app') ||
      (!hostname.includes('localhost') && !hostname.includes('127.0.0.1'))
    ) {
      return '/api/proxy'; // Usa el proxy de Next.js
    }
  }

  // Desarrollo local - usar URL directa
  const trimmed = rawUrl.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const API_BASE_URL = buildApiBaseUrl(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
);

// ============================================
// INTERFACES
// ============================================
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

// ============================================
// API EXCEPTION
// ============================================
export class ApiException extends Error {
  public readonly statusCode: number;
  public readonly errors?: Record<string, string[]>;
  public readonly data?: unknown;

  constructor(
    message: string,
    statusCode: number,
    errors?: Record<string, string[]>,
    data?: unknown
  ) {
    super(message);
    this.name = 'ApiException';
    this.statusCode = statusCode;
    this.errors = errors;
    this.data = data;
  }
}

// ============================================
// API CLIENT CLASS
// ============================================
class ApiClient {
  private baseUrl: string;
  private tokenProvider: TokenProvider;
  private tokenUpdater: (token: string) => void;
  private logoutHandler: LogoutHandler;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;

    // Default handlers (no-op or safe defaults)
    this.tokenProvider = () => null;
    this.tokenUpdater = () => { };
    this.logoutHandler = () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    };
  }

  /**
   * Configura los handlers de autenticación
   */
  public configure(
    getToken: TokenProvider,
    updateToken: (token: string) => void,
    onLogout: LogoutHandler
  ): void {
    this.tokenProvider = getToken;
    this.tokenUpdater = updateToken;
    this.logoutHandler = onLogout;
  }

  /**
   * Obtiene el header de autorización si hay token
   */
  private getAuthHeader(): Record<string, string> {
    const token = this.tokenProvider();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Método principal de request HTTP
   */
  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, includeAuth = true, ...fetchOptions } = options;

    // Build URL with query params
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    // Build headers - NO incluir Content-Type si no hay body
    const headers: Record<string, string> = {
      ...(fetchOptions.body ? { 'Content-Type': 'application/json' } : {}),
      ...(includeAuth ? this.getAuthHeader() : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    // Para requests con JSON body, asegurar Content-Type
    if (fetchOptions.body && typeof fetchOptions.body === 'string') {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        credentials: 'include', // Siempre incluir cookies para refresh tokens
      });

      // Manejo de 401 - Intentar refresh token
      // IMPORTANTE: NO intentar refresh si la petición original es a auth endpoints
      // para evitar bucles infinitos
      if (response.status === 401 && includeAuth) {
        const isAuthEndpoint = url.includes('/auth/login') ||
          url.includes('/auth/register') ||
          url.includes('/auth/refresh');
        if (!isAuthEndpoint) {
          return this.handleUnauthorized<T>(url, fetchOptions, headers);
        }
      }

      // Manejo de errores HTTP
      if (!response.ok) {
        return this.handleErrorResponse<T>(response);
      }

      // Handle no content response
      if (response.status === 204) {
        return undefined as T;
      }

      return response.json();
    } catch (error) {
      // Re-throw para mantener el stack trace
      throw error;
    }
  }

  /**
   * Maneja respuestas 401 intentando refresh token
   */
  private async handleUnauthorized<T>(
    url: string,
    fetchOptions: RequestInit,
    headers: Record<string, string>
  ): Promise<T> {
    try {
      const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (refreshResponse.ok) {
        const { token: newToken } = await refreshResponse.json();

        // Actualizar el token en la tienda
        this.tokenUpdater(newToken);

        // Reintentar la petición original con el nuevo token
        const retryHeaders = {
          ...headers,
          Authorization: `Bearer ${newToken}`,
        };

        const retryResponse = await fetch(url, {
          ...fetchOptions,
          headers: retryHeaders,
          credentials: 'include',
        });

        if (!retryResponse.ok) {
          return this.handleErrorResponse<T>(retryResponse);
        }

        if (retryResponse.status === 204) {
          return undefined as T;
        }

        return retryResponse.json();
      }

      // Si falla el refresh, logout
      this.logoutHandler();
      throw new ApiException('Sesión expirada', 401);
    } catch (error) {
      // Si es un error de red, NO cerrar sesión (modo offline)
      if (error instanceof ApiException) {
        throw error;
      }
      throw error;
    }
  }

  /**
   * Maneja respuestas de error HTTP
   */
  private async handleErrorResponse<T>(response: Response): Promise<T> {
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

  // ============================================
  // PUBLIC HTTP METHODS
  // ============================================

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: { includeAuth?: boolean }
  ): Promise<T> {
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

  // ============================================
  // UPLOAD METHODS (con soporte offline)
  // ============================================

  /**
   * Upload genérico con multipart/form-data.
   * Incluye soporte Offline (colas de sincronización)
   */
  async uploadForm<T>(
    endpoint: string,
    formData: FormData,
    options?: { includeAuth?: boolean }
  ): Promise<T> {
    const includeAuth = options?.includeAuth ?? true;
    const url = `${this.baseUrl}${endpoint}`;

    const buildHeaders = (tokenOverride?: string): Record<string, string> => {
      if (!includeAuth) return {};
      if (tokenOverride) return { Authorization: `Bearer ${tokenOverride}` };
      return this.getAuthHeader();
    };

    try {
      // Verificar si estamos offline (lazy import)
      const syncManager = await getSyncManager();
      if (syncManager && !syncManager.getOnlineStatus()) {
        throw new Error('Offline mode detected');
      }

      let response = await fetch(url, {
        method: 'POST',
        headers: buildHeaders(),
        body: formData,
        credentials: 'include',
      });

      // Manejo de 401 para uploads
      if (response.status === 401 && includeAuth) {
        const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          const { token: newToken } = await refreshResponse.json();
          this.tokenUpdater(newToken);

          response = await fetch(url, {
            method: 'POST',
            headers: buildHeaders(newToken),
            body: formData,
            credentials: 'include',
          });
        } else {
          this.logoutHandler();
          throw new ApiException('Sesión expirada', 401);
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
    } catch (error: unknown) {
      // Detectar si es error de red o modo offline
      const err = error as Error;
      const isNetworkError =
        err.message === 'Failed to fetch' ||
        err.message === 'Offline mode detected' ||
        err.name === 'TypeError';

      if (isNetworkError) {
        console.log('[ApiClient] Detectado error de red/offline, encolando upload:', endpoint);

        // Encolar para sincronización (lazy import)
        const syncManager = await getSyncManager();
        if (syncManager) {
          await syncManager.queueUpload({ endpoint, formData });
        }

        // Lanzar error especial que la UI puede manejar como "Guardado Offline"
        throw new ApiException('Guardado en cola offline', 0, undefined, { offline: true });
      }

      throw error;
    }
  }

  /**
   * Upload de archivo con multipart/form-data
   */
  async upload<T>(endpoint: string, file: File, fieldName = 'file'): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);
    return this.uploadForm<T>(endpoint, formData);
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================
export const apiClient = new ApiClient(API_BASE_URL);
