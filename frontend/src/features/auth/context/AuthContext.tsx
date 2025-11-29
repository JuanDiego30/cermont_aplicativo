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

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      setIsInitialized(true);
      return;
    }

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
        }
      } catch {
        clearSession();
        setIsAuthenticated(false);
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
          data?: {
            accessToken: string;
            refreshToken: string;
            user: User;
          };
          accessToken?: string;
          refreshToken?: string;
          user?: User;
        }
        const response = await apiClient.post<LoginResponse>('/auth/login', {
          email: email.toLowerCase().trim(),
          password,
        });

        const payload = response.data ?? response;
        const accessToken: string | undefined = payload?.accessToken;
        const refreshToken: string | undefined = payload?.refreshToken;
        const loggedUser: User | undefined = payload?.user;

        if (!accessToken || !refreshToken || !loggedUser) {
          throw new Error('Respuesta incompleta del servidor');
        }

        setSession({
          accessToken,
          refreshToken,
          userRole: loggedUser.role
        });
        setUser(loggedUser);
        setIsAuthenticated(true);

        router.push('/dashboard');
      } catch (error: unknown) {
        clearSession();
        setUser(null);
        setIsAuthenticated(false);

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
      router.push('/signin');
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, isInitialized, login, logout }}>
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
