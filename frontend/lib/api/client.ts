import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  setSession,
  clearSession,
} from '@/lib/auth/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

async function performTokenRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post(
      `${API_URL}/auth/refresh`,
      { refreshToken },
      { withCredentials: true },
    );

    const payload = data?.data ?? data;
    const newAccessToken: string | undefined = payload?.accessToken;
    const newRefreshToken: string | undefined = payload?.refreshToken ?? refreshToken;

    if (!newAccessToken) {
      return null;
    }

    setSession({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken || refreshToken,
    });

    return newAccessToken;
  } catch (refreshError) {
    clearSession();
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;
    const url = originalRequest?.url as string | undefined;
    const isAuthRoute = url?.includes('/auth/login') || url?.includes('/auth/refresh');

    if (status !== 401 || isAuthRoute) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = (async () => {
        const newToken = await performTokenRefresh();
        isRefreshing = false;
        return newToken;
      })();
    }

    const newToken = await refreshPromise!;

    if (!newToken) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    originalRequest.headers = originalRequest.headers ?? {};
    originalRequest.headers.Authorization = `Bearer ${newToken}`;

    return apiClient(originalRequest);
  },
);

export default apiClient;

// Export api as alias for backward compatibility
export const api = apiClient;
