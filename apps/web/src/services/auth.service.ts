/**
 * Auth Service
 * Centraliza las llamadas a la API de autenticación
 */

import { apiClient } from '@/lib/api';
import type { LoginCredentials, RegisterData, User } from '@/types/user';

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: User;
  message?: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  /**
   * Iniciar sesión
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', credentials, { includeAuth: false });
  },

  /**
   * Registrar nuevo usuario
   */
  register: async (data: RegisterData): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/register', data, { includeAuth: false });
  },

  /**
   * Cerrar sesión
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout', {});
  },

  /**
   * Refrescar token de acceso
   */
  refresh: async (refreshToken?: string): Promise<RefreshResponse> => {
    return apiClient.post<RefreshResponse>('/auth/refresh', { refreshToken });
  },

  /**
   * Obtener perfil del usuario actual
   */
  getProfile: async (): Promise<User> => {
    return apiClient.get<User>('/auth/profile');
  },

  /**
   * Solicitar restablecimiento de contraseña
   */
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return apiClient.post('/auth/forgot-password', { email }, { includeAuth: false });
  },

  /**
   * Restablecer contraseña con token
   */
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    return apiClient.post('/auth/reset-password', { token, newPassword }, { includeAuth: false });
  },
};
