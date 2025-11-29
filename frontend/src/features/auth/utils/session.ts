/**
 * Session Management Utilities
 */

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_ROLE_KEY = 'userRole';
const SESSION_COOKIE_NAME = 'cermont_atg_token';

const isBrowser = typeof window !== 'undefined';

export interface SessionPayload {
  accessToken: string;
  refreshToken: string;
  userRole?: string;
}

export function setSession({ accessToken, refreshToken, userRole }: SessionPayload) {
  if (!isBrowser) return;

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (userRole) {
    localStorage.setItem(USER_ROLE_KEY, userRole);
  }

  // Set accessToken cookie
  document.cookie = [
    `${SESSION_COOKIE_NAME}=${accessToken}`,
    'Path=/',
    `Max-Age=${60 * 60 * 24}`,
    'SameSite=Lax',
  ].join('; ');

  // Set userRole cookie for middleware
  if (userRole) {
    document.cookie = [
      `${USER_ROLE_KEY}=${userRole}`,
      'Path=/',
      `Max-Age=${60 * 60 * 24}`,
      'SameSite=Lax',
    ].join('; ');
  }
}

export function clearSession() {
  if (!isBrowser) return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY);

  // Clear accessToken cookie
  document.cookie = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'Max-Age=0',
    'SameSite=Lax',
  ].join('; ');

  // Clear userRole cookie
  document.cookie = [
    `${USER_ROLE_KEY}=`,
    'Path=/',
    'Max-Age=0',
    'SameSite=Lax',
  ].join('; ');
}

export function getAccessToken(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getUserRole(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(USER_ROLE_KEY);
}
