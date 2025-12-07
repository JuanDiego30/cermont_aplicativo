'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/lib/api';
import type { LoginCredentials, RegisterData, AuthResponse, User } from '@/types/user';

// Tipo interno para la respuesta del login que incluye el user completo
interface LoginResponse {
  token: string;
  user: User;
  message?: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { setAuth, logout: clearAuth } = useAuthStore();

  const login = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      return response;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
    },
  });

  const register = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await apiClient.post<LoginResponse>('/auth/register', data);
      return response;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout', {});
    },
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
    },
  });

  return { login, register, logout };
}
