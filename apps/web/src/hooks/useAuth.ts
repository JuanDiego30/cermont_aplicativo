'use client';

import { useSWRConfig } from 'swr';
import { useMutation } from './use-mutation';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/lib/api-client';
import type { LoginCredentials, RegisterData, User } from '@/types/user';

// Tipo interno para la respuesta del login que incluye el user completo
interface LoginResponse {
  token: string;
  user: User;
  message?: string;
}

export function useAuth() {
  const { mutate } = useSWRConfig();
  const { user, token, isAuthenticated, setAuth, logout: clearAuth } = useAuthStore();

  const login = useMutation<LoginResponse, LoginCredentials>({
    mutationFn: async (credentials) => {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      return response;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
    },
  });

  const register = useMutation<LoginResponse, RegisterData>({
    mutationFn: async (data) => {
      const response = await apiClient.post<LoginResponse>('/auth/register', data);
      return response;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
    },
  });

  const logout = useMutation<void, void>({
    mutationFn: async () => {
      await apiClient.post('/auth/logout', {});
    },
    onSuccess: () => {
      clearAuth();
      // Limpiar toda la caché de SWR
      mutate(() => true, undefined, { revalidate: false });
    },
  });

  return { user, token, isAuthenticated, login, register, logout };
}
