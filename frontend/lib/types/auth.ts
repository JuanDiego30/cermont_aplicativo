export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Alias para compatibilidad con API de auth
export type AuthResponse = LoginResponse;

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface DashboardMetrics {
  totalOrders: number;
  ordersByState: Record<string, number>;
  recentOrders: any[];
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}
