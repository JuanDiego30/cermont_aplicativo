/**
 * API Client
 * HTTP client with authentication and offline support
 */

import { env } from '../config';

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Lazy load session functions to avoid circular dependency
let sessionModule: typeof import('@/features/auth/utils/session') | null = null;

async function getSessionFunctions() {
  if (!sessionModule) {
    sessionModule = await import('@/features/auth/utils/session');
  }
  return sessionModule;
}

// Helper to make authenticated requests
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const { getAccessToken } = await getSessionFunctions();
  const token = getAccessToken();

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${env.API_URL}${url}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Handle 401 unauthorized
  if (response.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/refresh')) {
    const newToken = await handleTokenRefresh();

    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
      return fetch(`${env.API_URL}${url}`, {
        ...options,
        headers,
        credentials: 'include',
      });
    } else {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/signin')) {
        window.location.href = '/signin';
      }
    }
  }

  return response;
}

// Handle token refresh
async function handleTokenRefresh(): Promise<string | null> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = (async () => {
      const { getRefreshToken, setSession, clearSession } = await getSessionFunctions();
      const refreshToken = getRefreshToken();
      if (!refreshToken) return null;

      try {
        const response = await fetch(`${env.API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
          credentials: 'include',
        });

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
      } catch {
        clearSession();
        return null;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

// Lazy load sync service
let syncServiceModule: typeof import('../offline/sync-service') | null = null;

async function getSyncService() {
  if (!syncServiceModule) {
    syncServiceModule = await import('../offline/sync-service');
  }
  return syncServiceModule.syncService;
}

// API Client object with methods similar to axios
const apiClient = {
  async get<T = unknown>(url: string, config?: RequestInit): Promise<T> {
    const response = await fetchWithAuth(url, { ...config, method: 'GET' });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    // Support both { data: ... } and direct response formats
    return json.data ?? json;
  },

  async post<T = unknown>(url: string, data?: unknown, config?: RequestInit): Promise<T> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const syncService = await getSyncService();
      await syncService.savePendingAction({
        type: 'CREATE',
        endpoint: url,
        data,
      });
      return { success: true, offline: true, message: 'Guardado offline' } as T;
    }

    const response = await fetchWithAuth(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: Error & { response?: unknown; config?: unknown } = new Error(`HTTP error! status: ${response.status}`);
      error.response = { status: response.status, statusText: response.statusText, data: errorData };
      error.config = { url };
      throw error;
    }
    const json = await response.json();
    return json.data ?? json;
  },

  async put<T = unknown>(url: string, data?: unknown, config?: RequestInit): Promise<T> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const syncService = await getSyncService();
      await syncService.savePendingAction({
        type: 'UPDATE',
        endpoint: url,
        data,
      });
      return { success: true, offline: true, message: 'Guardado offline' } as T;
    }

    const response = await fetchWithAuth(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    return json.data ?? json;
  },

  async patch<T = unknown>(url: string, data?: unknown, config?: RequestInit): Promise<T> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const syncService = await getSyncService();
      await syncService.savePendingAction({
        type: 'UPDATE',
        endpoint: url,
        data,
      });
      return { success: true, offline: true, message: 'Guardado offline' } as T;
    }

    const response = await fetchWithAuth(url, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    return json.data ?? json;
  },

  async delete<T = unknown>(url: string, config?: RequestInit): Promise<T> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const syncService = await getSyncService();
      await syncService.savePendingAction({
        type: 'DELETE',
        endpoint: url,
        data: {},
      });
      return { success: true, offline: true, message: 'Guardado offline' } as T;
    }

    const response = await fetchWithAuth(url, { ...config, method: 'DELETE' });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    return json.data ?? json;
  },
};

export default apiClient;
