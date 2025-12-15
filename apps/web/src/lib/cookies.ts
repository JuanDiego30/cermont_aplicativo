/**
 * ARCHIVO: cookies.ts
 * FUNCION: Utilidades para gestión de cookies en Edge y Client
 * IMPLEMENTACION: Basado en vercel/examples/edge-middleware/cookies
 * DEPENDENCIAS: next/headers (server), js-cookie (client)
 * EXPORTS: serverCookies, clientCookies, COOKIE_OPTIONS
 */

import { cookies } from 'next/headers';

/**
 * Nombres de cookies utilizadas en la aplicación
 */
export const COOKIE_NAMES = {
  AUTH_TOKEN: 'cermont-auth',
  REFRESH_TOKEN: 'cermont-refresh',
  THEME: 'cermont-theme',
  LOCALE: 'cermont-locale',
  SIDEBAR_STATE: 'cermont-sidebar',
  COOKIE_CONSENT: 'cermont-consent',
} as const;

/**
 * Opciones por defecto para cookies
 */
export const COOKIE_OPTIONS = {
  // Cookie de autenticación
  auth: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  },
  // Cookie de refresh token
  refresh: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 días
  },
  // Cookie de preferencias (accesible desde JS)
  preferences: {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 año
  },
  // Cookie de sesión (expira al cerrar navegador)
  session: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
  },
};

/**
 * Utilidades para cookies en Server Components y Route Handlers
 */
export const serverCookies = {
  /**
   * Obtiene el valor de una cookie
   */
  get: async (name: string): Promise<string | undefined> => {
    const cookieStore = await cookies();
    return cookieStore.get(name)?.value;
  },

  /**
   * Establece una cookie
   */
  set: async (
    name: string,
    value: string,
    options?: Partial<typeof COOKIE_OPTIONS.preferences>
  ): Promise<void> => {
    const cookieStore = await cookies();
    cookieStore.set(name, value, {
      ...COOKIE_OPTIONS.preferences,
      ...options,
    });
  },

  /**
   * Elimina una cookie
   */
  delete: async (name: string): Promise<void> => {
    const cookieStore = await cookies();
    cookieStore.delete(name);
  },

  /**
   * Verifica si existe una cookie
   */
  has: async (name: string): Promise<boolean> => {
    const cookieStore = await cookies();
    return cookieStore.has(name);
  },

  /**
   * Obtiene todas las cookies
   */
  getAll: async (): Promise<Array<{ name: string; value: string }>> => {
    const cookieStore = await cookies();
    return cookieStore.getAll();
  },

  // Helpers específicos
  auth: {
    getToken: async (): Promise<string | undefined> => {
      return serverCookies.get(COOKIE_NAMES.AUTH_TOKEN);
    },
    setToken: async (token: string): Promise<void> => {
      const cookieStore = await cookies();
      cookieStore.set(COOKIE_NAMES.AUTH_TOKEN, token, COOKIE_OPTIONS.auth);
    },
    clearToken: async (): Promise<void> => {
      return serverCookies.delete(COOKIE_NAMES.AUTH_TOKEN);
    },
    isAuthenticated: async (): Promise<boolean> => {
      return serverCookies.has(COOKIE_NAMES.AUTH_TOKEN);
    },
  },

  preferences: {
    getTheme: async (): Promise<'light' | 'dark'> => {
      const theme = await serverCookies.get(COOKIE_NAMES.THEME);
      return theme === 'dark' ? 'dark' : 'light';
    },
    setTheme: async (theme: 'light' | 'dark'): Promise<void> => {
      return serverCookies.set(COOKIE_NAMES.THEME, theme, COOKIE_OPTIONS.preferences);
    },
    getLocale: async (): Promise<string> => {
      return (await serverCookies.get(COOKIE_NAMES.LOCALE)) || 'es';
    },
    setLocale: async (locale: string): Promise<void> => {
      return serverCookies.set(COOKIE_NAMES.LOCALE, locale, COOKIE_OPTIONS.preferences);
    },
  },
};

/**
 * Utilidades para cookies en Client Components
 * Usar con js-cookie o document.cookie
 */
export const clientCookieUtils = {
  /**
   * Obtiene el valor de una cookie desde el navegador
   */
  get: (name: string): string | undefined => {
    if (typeof document === 'undefined') return undefined;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift();
    }
    
    return undefined;
  },

  /**
   * Establece una cookie en el navegador
   */
  set: (
    name: string,
    value: string,
    options: {
      maxAge?: number;
      path?: string;
      secure?: boolean;
      sameSite?: 'strict' | 'lax' | 'none';
    } = {}
  ): void => {
    if (typeof document === 'undefined') return;
    
    const {
      maxAge = 60 * 60 * 24 * 365,
      path = '/',
      secure = process.env.NODE_ENV === 'production',
      sameSite = 'lax',
    } = options;
    
    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    cookie += `; path=${path}`;
    cookie += `; max-age=${maxAge}`;
    cookie += `; samesite=${sameSite}`;
    
    if (secure) {
      cookie += '; secure';
    }
    
    document.cookie = cookie;
  },

  /**
   * Elimina una cookie del navegador
   */
  delete: (name: string, path: string = '/'): void => {
    if (typeof document === 'undefined') return;
    
    document.cookie = `${encodeURIComponent(name)}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  },

  /**
   * Verifica si las cookies están habilitadas
   */
  isEnabled: (): boolean => {
    if (typeof navigator === 'undefined') return false;
    return navigator.cookieEnabled;
  },
};

/**
 * Parser de cookies para Edge Middleware
 */
export function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  
  return cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, ...valueParts] = cookie.trim().split('=');
    if (key) {
      acc[decodeURIComponent(key)] = decodeURIComponent(valueParts.join('='));
    }
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Serializa una cookie para headers
 */
export function serializeCookie(
  name: string,
  value: string,
  options: {
    maxAge?: number;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}
): string {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
  
  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`);
  }
  if (options.path) {
    parts.push(`Path=${options.path}`);
  }
  if (options.secure) {
    parts.push('Secure');
  }
  if (options.httpOnly) {
    parts.push('HttpOnly');
  }
  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }
  
  return parts.join('; ');
}
