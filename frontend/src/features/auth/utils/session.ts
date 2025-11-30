import type { User, SessionData } from '@/features/auth/types';

const SESSION_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
} as const;

// Helper para verificar si estamos en el cliente
function isClient(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Guarda la sesión en localStorage
 */
export function setSession(session: SessionData | null): void {
  if (!isClient()) {
    console.warn('setSession called on server side');
    return;
  }

  if (session) {
    const { accessToken, refreshToken, user } = session;

    console.log('setSession called with:', {
      accessTokenLength: accessToken?.length,
      refreshTokenLength: refreshToken?.length,
      userRole: user?.role,
    });

    // Validar que los tokens son strings válidos
    if (typeof accessToken !== 'string' || accessToken.trim().length === 0) {
      console.error('Invalid accessToken format:', accessToken?.substring(0, 50));
      throw new Error('Invalid accessToken format');
    }

    if (typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
      console.error('Invalid refreshToken format:', refreshToken?.substring(0, 50));
      const parts = refreshToken?.split('.') || [];
      console.error('Token parts:', parts.length);
      throw new Error('Invalid refreshToken format');
    }

    // Validar que accessToken tiene formato JWT (3 partes separadas por punto)
    const accessTokenParts = accessToken.split('.');
    if (accessTokenParts.length !== 3) {
      console.error('AccessToken does not have JWT format. Parts:', accessTokenParts.length);
      throw new Error('AccessToken does not have JWT format');
    }

    // Guardar en localStorage
    try {
      localStorage.setItem(SESSION_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(SESSION_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(SESSION_KEYS.USER, JSON.stringify(user));
      console.log('Session stored in localStorage');
    } catch (error) {
      console.error('Error storing session in localStorage:', error);
      throw error;
    }
  } else {
    clearSession();
  }
}

/**
 * Obtiene la sesión desde localStorage
 */
export function getSession(): SessionData | null {
  if (!isClient()) {
    return null;
  }

  try {
    const accessToken = localStorage.getItem(SESSION_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(SESSION_KEYS.REFRESH_TOKEN);
    const userStr = localStorage.getItem(SESSION_KEYS.USER);

    if (!accessToken || !refreshToken || !userStr) {
      return null;
    }

    const user = JSON.parse(userStr) as User;

    return {
      user,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error('Error getting session:', error);
    clearSession();
    return null;
  }
}

/**
 * Obtiene solo el access token
 */
export function getAccessToken(): string | null {
  if (!isClient()) {
    return null;
  }

  return localStorage.getItem(SESSION_KEYS.ACCESS_TOKEN);
}

/**
 * Obtiene solo el refresh token
 */
export function getRefreshToken(): string | null {
  if (!isClient()) {
    return null;
  }

  return localStorage.getItem(SESSION_KEYS.REFRESH_TOKEN);
}

/**
 * Actualiza solo el access token
 */
export function updateAccessToken(accessToken: string): void {
  if (!isClient()) {
    console.warn('updateAccessToken called on server side');
    return;
  }

  if (!accessToken || typeof accessToken !== 'string') {
    throw new Error('Invalid access token');
  }

  localStorage.setItem(SESSION_KEYS.ACCESS_TOKEN, accessToken);
}

/**
 * Limpia la sesión
 */
export function clearSession(): void {
  if (!isClient()) {
    console.warn('clearSession called on server side');
    return;
  }

  localStorage.removeItem(SESSION_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(SESSION_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(SESSION_KEYS.USER);
  console.log('Session cleared');
}

/**
 * Verifica si hay una sesión activa
 */
export function hasActiveSession(): boolean {
  if (!isClient()) {
    return false;
  }

  const accessToken = getAccessToken();
  return !!accessToken;
}
