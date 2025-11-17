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
import apiClient from '@/lib/api/client';
import { clearSession, getAccessToken, setSession } from './session';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (params: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const { data } = await apiClient.get('/auth/profile');
        const profile = data?.data?.user ?? data?.user;
        if (profile) {
          setUser(profile);
          setIsAuthenticated(true);
        } else {
          clearSession();
          setIsAuthenticated(false);
        }
      } catch (error) {
        clearSession();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      try {
        console.log('🔐 Intentando login con email:', email);
        console.log('🔐 API URL:', process.env.NEXT_PUBLIC_API_URL);

        const { data } = await apiClient.post('/auth/login', {
          email: email.toLowerCase().trim(),
          password,
        });
        console.log('✅ Respuesta login:', data);

        const payload = data?.data ?? data;
        const accessToken: string = payload?.accessToken;
        const refreshToken: string = payload?.refreshToken;
        const loggedUser: AuthUser = payload?.user;

        if (!accessToken || !refreshToken || !loggedUser) {
          throw new Error('Respuesta incompleta del servidor');
        }

        console.log('✅ Tokens recibidos, guardando sesión...');
        setSession({ accessToken, refreshToken });
        setUser(loggedUser);
        setIsAuthenticated(true);

        console.log('✅ Redirigiendo a dashboard...');
        router.push('/dashboard');
      } catch (error: any) {
        console.error('❌ Error en login:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          url: error.config?.url,
        });
        clearSession();
        setUser(null);
        setIsAuthenticated(false);

        const errorMessage =
          error.response?.data?.detail ||
          error.message ||
          'Error al iniciar sesión - verifica que el backend esté corriendo';
        throw new Error(errorMessage);
      }
    },
    [router],
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch {
      // Ignorar errores y limpiar sesión
    } finally {
      clearSession();
      setUser(null);
      setIsAuthenticated(false);
      router.push('/login');
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}
