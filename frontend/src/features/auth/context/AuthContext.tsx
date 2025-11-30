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

        // El apiClient ya extrae json.data, response contiene directamente los datos
        const accessToken = response.accessToken;
        const refreshToken = response.refreshToken;
        const loggedUser = response.user;

        console.log('🔑 Tokens:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken,
          accessTokenPreview: accessToken?.substring(0, 50) + '...',
          hasUser: !!loggedUser 
        });

        if (!accessToken || !refreshToken || !loggedUser) {
          throw new Error('Respuesta incompleta del servidor');
        }

        // Guardar sesión
        setSession({
          accessToken,
          refreshToken,
          userRole: loggedUser.role
        });

        console.log('✅ Session saved successfully');

        // Actualizar estado
        setUser(loggedUser);
        setIsAuthenticated(true);

        // Navegar al dashboard
        router.replace('/dashboard');
      } catch (error: any) {
        console.error('❌ Login error:', error);
        // Limpiar sesión en caso de error
        clearSession();
        setUser(null);
        setIsAuthenticated(false);

        // Propagar error
        const errorMessage = error?.response?.data?.detail || error?.message || 'Error al iniciar sesión';
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
