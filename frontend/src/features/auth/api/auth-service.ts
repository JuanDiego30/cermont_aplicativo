/**
 * Auth API Service
 */

import apiClient from '@/core/api/client';
import type { AuthResponse, LoginCredentials, RefreshTokenResponse, User } from '../types';

export const authApi = {
  /**
   * Login
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  },

  /**
   * Refresh token
   */
  refresh: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    return apiClient.post<RefreshTokenResponse>('/auth/refresh', { refreshToken });
  },

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  /**
   * Get profile
   */
  getProfile: async (): Promise<{ user: User }> => {
    return apiClient.get<{ user: User }>('/auth/profile');
  },

  /**
   * Logout all sessions
   */
  logoutAll: async (): Promise<void> => {
    await apiClient.post('/auth/logout-all');
  },
};
