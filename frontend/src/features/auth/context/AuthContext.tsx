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
  const [isReady, setIsReady] = useState(false); // Token is saved and ready

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      setIsInitialized(true);
      setIsReady(false);
      return;
    }

    // Token exists, mark as ready immediately
    setIsReady(true);

    (async () => {
      try {
        interface ProfileResponse {
          data?: { user?: User };
          user?: User;
        }
        const response = await apiClient.get<ProfileResponse>('/auth/profile');
        const profile = response.data?.user ?? response.user;
        if (profile) {
          setUser(profile);
          setIsAuthenticated(true);
        } else {
          clearSession();
          setIsAuthenticated(false);
          setIsReady(false);
        }
      } catch {
        clearSession();
        setIsAuthenticated(false);
        setIsReady(false);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    })();
  }, []);

  const login = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      try {
        interface LoginResponse {
          accessToken: string;
          refreshToken: string;
          user: User;
        }
        const response = await apiClient.post<LoginResponse>('/auth/login', {
          email: email.toLowerCase().trim(),
          password,
        });

        // El apiClient.post ya extrae json.data, así que response ya contiene los datos directamente
        const accessToken = response.accessToken;
        const refreshToken = response.refreshToken;
        const loggedUser = response.user;

        if (!accessToken || !refreshToken || !loggedUser) {
          throw new Error('Respuesta incompleta del servidor');
        }

        // 🔧 FIX: Guardar sesión ANTES de actualizar estado
        // Esto asegura que el token esté disponible inmediatamente en localStorage
        setSession({
          accessToken,
          refreshToken,
          userRole: loggedUser.role
        });

        // Marcar como listo - el token ya está en localStorage
        setIsReady(true);

        // Actualizar estado después de que el token esté en localStorage
        setUser(loggedUser);
        setIsAuthenticated(true);

        // ✅ Navegar inmediatamente - el token ya está disponible
        router.replace('/dashboard');
      } catch (error: unknown) {
        clearSession();
        setUser(null);
        setIsAuthenticated(false);
        // ✅ NO poner isReady = false - el sistema sigue inicializado, solo falló el login

        const err = error as { response?: { data?: { detail?: string } }; message?: string };
        const errorMessage =
          err.response?.data?.detail ||
          err.message ||
          'Error al iniciar sesión';
        throw new Error(errorMessage);
      }
    },
    [router],
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch {
      // Ignore errors and clear session
    } finally {
      clearSession();
      setUser(null);
      setIsAuthenticated(false);
      // ✅ NO poner isReady = false - el sistema sigue inicializado después del logout
      router.push('/signin');
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, isInitialized, isReady, login, logout }}>
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
