// src/lib/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import https from 'https';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// httpsAgent solo en Node (SSR) y en dev, nunca en el navegador
const nodeHttpsAgent =
  typeof window === 'undefined' && process.env.NODE_ENV !== 'production' && baseURL.startsWith('https')
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined;

const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: false,
  httpsAgent: nodeHttpsAgent,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log('Request:', config.method?.toUpperCase(), config.url, config.data);
    if (!config.url?.includes('/auth/login')) {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('accessToken') ?? localStorage.getItem('token')
          : null;
      if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    console.error('API Error:', error.response?.data);
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;