import apiClient from './client';
import type { AuthResponse, LoginCredentials, RefreshTokenResponse, User } from '@/lib/types/auth';

export const authApi = {
  /**
   * Login
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/login', credentials);
    return data.data;
  },

  /**
   * Refresh token
   */
  refresh: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const { data } = await apiClient.post<{ success: boolean; data: RefreshTokenResponse }>('/auth/refresh', {
      refreshToken,
    });
    return data.data;
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
    const { data } = await apiClient.get<{ success: boolean; data: { user: User } }>('/auth/profile');
    return data.data;
  },
};
