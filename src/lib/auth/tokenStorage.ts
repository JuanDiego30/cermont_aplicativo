/**
 * Utilidad para persistir el token JWT en cliente o durante renders SSR.
 */

export const TOKEN_STORAGE_KEY = 'cermont.auth.token';
let memoryToken: string | null = null;

type TokenMutation = (token: string | null) => void;
let listeners: TokenMutation[] = [];

function isBrowser() {
  return typeof window !== 'undefined';
}

function notify(token: string | null) {
  listeners.forEach((listener) => {
    try {
      listener(token);
    } catch (error) {
      console.error('tokenStorage listener error', error);
    }
  });
}

export function getToken(): string | null {
  if (isBrowser()) {
    try {
  const stored = window.localStorage.getItem(TOKEN_STORAGE_KEY);
      memoryToken = stored;
      return stored;
    } catch (error) {
      console.warn('No se pudo leer el token del almacenamiento', error);
    }
  }

  return memoryToken;
}

export function setToken(token: string) {
  memoryToken = token;

  if (isBrowser()) {
    try {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch (error) {
      console.warn('No se pudo persistir el token en localStorage', error);
    }
  }

  notify(token);
}

export function clearToken() {
  memoryToken = null;

  if (isBrowser()) {
    try {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.warn('No se pudo eliminar el token del almacenamiento', error);
    }
  }

  notify(null);
}

export function subscribeToken(listener: TokenMutation) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((current) => current !== listener);
  };
}
