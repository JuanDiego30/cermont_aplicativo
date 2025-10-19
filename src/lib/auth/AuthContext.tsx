/**
 * Context de Autenticación
 * Maneja el estado de autenticación global de la aplicación
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
// Autenticación local sin Supabase
import { Role, type User } from '@/lib/types/roles';
type Session = null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, nombre: string) => Promise<{ error?: string; requiresConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const AUTH_USER_KEY = 'auth_user';

  // Cargar usuario desde la sesión
  const loadUser = useCallback(async (_userId: string) => {
    // En local, no hay carga remota de usuario
    return null;
  }, []);

  // Inicializar sesión
  useEffect(() => {
    // Cargar usuario fake desde localStorage
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(AUTH_USER_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as User;
        setUser(parsed);
      }
    } catch {}
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, _password: string) => {
    // Derivar rol por conveniencia a partir del correo: admin@local, tecnico@local, coordinador@local, gerente@local, cliente@local
    const name = email.split('@')[0]?.toLowerCase() || 'admin';
    const map: Record<string, Role> = {
      admin: Role.ADMIN,
      tecnico: Role.TECNICO,
      coordinador: Role.COORDINADOR,
      gerente: Role.GERENTE,
      cliente: Role.CLIENTE,
    };
    const role = map[name] || Role.ADMIN;
    const now = new Date().toISOString();
    const fakeUser: User = {
      id: 'local-' + role,
      email,
      nombre: name.charAt(0).toUpperCase() + name.slice(1),
      rol: role,
      empresa: 'Cermont',
      telefono: undefined,
      avatar_url: undefined,
      activo: true,
      created_at: now,
      updated_at: now,
    };
    setUser(fakeUser);
    try { localStorage.setItem(AUTH_USER_KEY, JSON.stringify(fakeUser)); } catch {}
    return {};
  };

  const signUp = async (_email: string, _password: string, _nombre: string) => {
    return { error: 'Registro deshabilitado en modo local' };
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
  };

  const refreshSession = async () => {
    // No-op en local
  };

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };

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
