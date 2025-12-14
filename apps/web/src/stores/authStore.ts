/**
 * ARCHIVO: authStore.ts
 * FUNCION: Store global para estado de autenticación
 * IMPLEMENTACION: Zustand con persist middleware, integración con authApi
 * DEPENDENCIAS: zustand, @/types/user, @/lib/api-client, @/features/auth/api/auth-api
 * EXPORTS: useAuthStore, useAuth
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/user';
import { authApi } from '@/features/auth/api/auth-api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Acciones
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setAuth: (user, token) => set({ user, token, isAuthenticated: true, error: null }),

      setUser: (user) => set({ user, isAuthenticated: true }),

      setToken: (token) => set({ token, isAuthenticated: !!token }),

      setIsLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      logout: async () => {
        try {
          // Intentar llamar al endpoint de logout en el backend
          await authApi.logout();
        } catch {
          // Ignorar errores del backend, limpiar estado de todas formas
        } finally {
          get().clearAuth();
          // Redirigir al login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      },
    }),
    {
      name: 'cermont-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Hook personalizado para usar auth
export const useAuth = () => useAuthStore((state) => state);
