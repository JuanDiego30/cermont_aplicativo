'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/client';
import { clearSession, getAccessToken, setSession } from '../utils/session';
import type { User, AuthContextValue } from '../types';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Verificar sesión al montar el componente
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAccessToken();
      
      if (!token) {
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }

      try {
        const response = await apiClient.get('/auth/profile');
        const profile = response.user || response.data?.user;
        
        if (profile) {
          setUser(profile);
          setIsAuthenticated(true);
        } else {
          clearSession();
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        clearSession();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      try {
        const response = await apiClient.post('/auth/login', {
          email: email.toLowerCase().trim(),
          password,
        });

        console.log('🔐 Login response:', JSON.stringify(response, null, 2));

        // Extraer tokens - soportar ambos formatos:
        // Formato 1: { user, accessToken, refreshToken } (tokens en raíz)
        // Formato 2: { user, tokens: { accessToken, refreshToken } } (tokens anidados)
        let accessToken: string;
        let refreshToken: string;
        const loggedUser = response.user;

        if (response.tokens && typeof response.tokens === 'object') {
          // Formato 2: tokens anidados
          accessToken = response.tokens.accessToken;
          refreshToken = response.tokens.refreshToken;
          console.log('📦 Usando formato tokens anidados');
        } else {
          // Formato 1: tokens en raíz
          accessToken = response.accessToken;
          refreshToken = response.refreshToken;
          console.log('📦 Usando formato tokens en raíz');
        }

        console.log('🔑 Tokens extraídos:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken,
          accessTokenPreview: accessToken?.substring(0, 50) + '...',
          hasUser: !!loggedUser 
        });

        if (!accessToken || !refreshToken || !loggedUser) {
          console.error('❌ Respuesta incompleta:', { accessToken: !!accessToken, refreshToken: !!refreshToken, user: !!loggedUser });
          throw new Error('Respuesta incompleta del servidor');
        }

        // Guardar sesión en localStorage
        setSession({
          accessToken,
          refreshToken,
          userRole: loggedUser.role
        });

        console.log('✅ Session saved, updating state...');

        // Actualizar estado React
        setUser(loggedUser);
        setIsAuthenticated(true);

        console.log('✅ State updated, navigating to dashboard...');

        // Navegar al dashboard
        router.replace('/dashboard');
      } catch (error: unknown) {
        console.error('❌ Login error:', error);
        // Limpiar sesión en caso de error
        clearSession();
        setUser(null);
        setIsAuthenticated(false);

        // Propagar error
        const err = error as { response?: { data?: { detail?: string } }; message?: string };
        const errorMessage = err?.response?.data?.detail || err?.message || 'Error al iniciar sesión';
        throw new Error(errorMessage);
      }
    },
    [router],
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearSession();
      setUser(null);
      setIsAuthenticated(false);
      router.push('/signin');
    }
  }, [router]);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated,
    isInitialized,
    isReady: isInitialized && !isLoading, // Simplificado
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
}
