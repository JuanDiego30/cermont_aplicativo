/**
 * Context de Autenticación
 * Implementación basada en API propia con JWT
 */

'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api } from '@/lib/api/client';
import {
  clearToken,
  getToken,
  setToken,
  subscribeToken,
  TOKEN_STORAGE_KEY,
} from '@/lib/auth/tokenStorage';
import { Role, roleRoutes, type User } from '@/lib/types/roles';
import { ROUTES } from '@/lib/constants';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string; redirectTo?: string }>;
  signUp: (
    email: string,
    password: string,
    nombre: string
  ) => Promise<{ error?: string; redirectTo?: string; requiresConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

interface AuthUserDTO {
  id: string;
  correo: string;
  rol: string;
}

interface LoginResponse {
  token?: string;
  user?: AuthUserDTO;
  error?: string;
  message?: string;
}

interface RegisterResponse {
  id?: string;
  correo?: string;
  rol?: string;
  error?: string;
  message?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function deriveRole(value: string | Role): Role {
  const parsed = value as Role;
  if (Object.values(Role).includes(parsed)) {
    return parsed;
  }
  return Role.CLIENTE;
}

function buildDisplayName(email: string | null | undefined, fallbackId: string) {
  if (!email) {
    return `Usuario ${fallbackId.slice(0, 6)}`;
  }

  const base = email.split('@')[0] ?? '';
  const cleaned = base.replace(/[._-]+/g, ' ').trim();
  if (!cleaned) {
    return email;
  }

  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function mapAuthUser(dto: AuthUserDTO): User {
  const email = dto.correo;
  const role = deriveRole(dto.rol);

  return {
    id: dto.id,
    email,
    nombre: buildDisplayName(email, dto.id),
    rol: role,
    activo: true,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const storedToken = getToken();
    if (!storedToken) {
      setTokenState(null);
      setUser(null);
      return;
    }

    try {
      setTokenState(storedToken);
      const response = await api.get<AuthUserDTO>('/auth/users/me');

      if (response.error) {
        clearToken();
        setTokenState(null);
        setUser(null);
        return;
      }

      setUser(mapAuthUser(response));
    } catch (error) {
      console.error('Error al cargar el usuario autenticado', error);
      clearToken();
      setTokenState(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      setIsLoading(true);
      try {
        if (isMounted) {
          await loadUser();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [loadUser]);

  useEffect(() => {
    const unsubscribe = subscribeToken((nextToken) => {
      setTokenState(nextToken);
      if (!nextToken) {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== TOKEN_STORAGE_KEY) {
        return;
      }

      const nextToken = event.newValue;
      setTokenState(nextToken);

      if (!nextToken) {
        setUser(null);
        return;
      }

      loadUser();
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [loadUser]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const response = await api.post<LoginResponse>('/auth/login', {
          correo: email,
          password,
        });

        if (response.error || !response.token || !response.user) {
          return {
            error: response.error || response.message || 'No se pudo iniciar sesión',
          };
        }

  setToken(response.token);
  setTokenState(response.token);
        const profile = mapAuthUser(response.user);
        setUser(profile);

        const redirectTo = roleRoutes[profile.rol] ?? ROUTES.DASHBOARD;
        return { redirectTo };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signUp = useCallback(
    async (email: string, password: string, nombre: string) => {
      const response = await api.post<RegisterResponse>('/auth/register', {
        correo: email,
        password,
        rol: Role.CLIENTE,
      });

      if (response.error) {
        return { error: response.error || response.message };
      }

      const loginResult = await signIn(email, password);
      if (loginResult.error) {
        return { error: loginResult.error };
      }

      const trimmedName = nombre.trim();
      if (trimmedName) {
        setUser((current) => (current ? { ...current, nombre: trimmedName } : current));
      }

      return {
        redirectTo: loginResult.redirectTo,
        requiresConfirmation: false,
      };
    },
    [signIn]
  );

  const signOut = useCallback(async () => {
    clearToken();
    setTokenState(null);
    setUser(null);
  }, []);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    try {
      await loadUser();
    } finally {
      setIsLoading(false);
    }
  }, [loadUser]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      signIn,
      signUp,
      signOut,
      refreshSession,
    }),
    [isLoading, token, signIn, signOut, signUp, refreshSession, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para acceder al contexto de autenticación
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}

/**
 * Hook para obtener el rol del usuario
 */
export function useRole(): Role | null {
  const { user } = useAuth();
  return user?.rol ?? null;
}

/**
 * Hook para verificar si el usuario tiene un rol específico
 */
export function useHasRole(roles: Role | Role[]): boolean {
  const userRole = useRole();
  if (!userRole) return false;

  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.includes(userRole);
}
