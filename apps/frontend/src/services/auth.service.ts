// src/services/auth.service.ts
import apiClient from '@/lib/api/client';
import { LoginCredentials, LoginResponse, User, ApiResponse } from '@/types/user.types';

export const authService = {
async login(credentials: LoginCredentials): Promise<LoginResponse> {
const response = await apiClient.post<ApiResponse<LoginResponse>>(
'/auth/login',
credentials
);
return response.data.data;
},

async forgotPassword(email: string): Promise<null | { resetToken?: string }> {
const response = await apiClient.post<ApiResponse<null | { resetToken?: string }>>(
'/auth/forgot-password',
{ email }
);
return response.data.data;
},

async logout(): Promise<void> {
try {
await apiClient.post('/auth/logout');
} catch (error) {
console.error('Error en logout:', error);
} finally {
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
}
},

async getCurrentUser(): Promise<User> {
const response = await apiClient.get<ApiResponse<User>>('/auth/me');
return response.data.data;
},

async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
const response = await apiClient.post<ApiResponse<{ accessToken: string }>>(
'/auth/refresh',
{ refreshToken }
);
return response.data.data;
},
};