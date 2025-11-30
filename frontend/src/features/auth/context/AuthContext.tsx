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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      setIsInitialized(true);
      setIsReady(true);
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
          setIsReady(true);
        } else {
          clearSession();
          setIsAuthenticated(false);
          setIsReady(true);
        }
      } catch {
        clearSession();
        setIsAuthenticated(false);
        setIsReady(true);
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

        const accessToken = response.accessToken;
        const refreshToken = response.refreshToken;
        const loggedUser = response.user;

        if (!accessToken || !refreshToken || !loggedUser) {
          throw new Error('Respuesta incompleta del servidor');
        }

        // 🔧 CRITICAL FIX: Store session FIRST, before any state updates
        setSession({
          accessToken,
          refreshToken,
          userRole: loggedUser.role
        });

        // Update state after token is in localStorage
        setUser(loggedUser);
        setIsAuthenticated(true);
        
        // ✅ Set isReady AFTER all state updates
        // This tells dashboard it's safe to make API calls
        setIsReady(true);

        // Navigate - token is now available for immediate API calls
        router.replace('/dashboard');
      } catch (error: unknown) {
        clearSession();
        setUser(null);
        setIsAuthenticated(false);
        // 👁️ Copilot fix: Don't set isReady to false on login error
        // The auth system is still fully initialized and ready,
        // just the credentials were incorrect

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
      // 👁️ Copilot fix: Don't set isReady to false on logout
      // The auth system remains initialized and ready,
      // just the user is no longer authenticated
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
