/**
 * Auth Types
 */

import type { User } from '@/features/users/types';

// Re-export User from users module
export type { User };

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export type AuthResponse = LoginResponse;

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  /**
   * Indicates when auth is ready for API calls
   * True when token is stored and state is synchronized
   * Prevents premature API calls that would result in 401
   */
  isReady: boolean;
  login: (params: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}
