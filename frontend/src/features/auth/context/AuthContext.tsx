'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/client';
import { setSession, clearSession, getSession } from '@/features/auth/utils/session';
import type { User } from '@/features/auth/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Cargar sesión al iniciar
  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = getSession();
        if (session && session.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error loading session:', error);
        clearSession();
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    loadSession();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        // Hacer petición de login
        const response = await apiClient.post<{
          user: User;
          accessToken: string;
          refreshToken: string;
        }>('/auth/login', {
          email,
          password,
        }, {
          requiresAuth: false,
        });

        console.log('Login response:', {
          accessToken: response.accessToken?.substring(0, 50) + '...',
          refreshToken: response.refreshToken?.substring(0, 50) + '...',
          user: {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            role: response.user.role,
          },
        });

        // Extraer datos
        const { user: userData, accessToken, refreshToken } = response;

        // Validar que tenemos tokens válidos
        console.log('Tokens:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          accessTokenPreview: accessToken?.substring(0, 50) + '...',
          hasUser: !!userData,
        });

        if (!accessToken || !refreshToken || !userData) {
          throw new Error('Invalid response from server');
        }

        // Guardar sesión
        try {
          setSession({
            user: userData,
            accessToken,
            refreshToken,
          });
          console.log('Session saved successfully');
        } catch (sessionError) {
          console.error('Error saving session:', sessionError);
          throw sessionError;
        }

        // Actualizar estado
        setUser(userData);
        setIsAuthenticated(true);

        // Redirigir al dashboard
        router.replace('/dashboard');
      } catch (error) {
        console.error('Login error:', error);
        clearSession();
        setUser(null);
        setIsAuthenticated(false);
        throw error;
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      // Intentar logout en el servidor
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Limpiar sesión local siempre
      clearSession();
      setUser(null);
      setIsAuthenticated(false);
      router.replace('/signin');
    }
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const response = await apiClient.get<{ user: User }>('/auth/profile');
      setUser(response.user);
    } catch (error) {
      console.error('Error refreshing user:', error);
      // Si falla, hacer logout
      await logout();
    }
  }, [logout]);

  // isReady = inicializado y no cargando
  const isReady = isInitialized && !isLoading;

  const value = {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    isReady,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
