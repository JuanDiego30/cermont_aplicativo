const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const SESSION_COOKIE_NAME = 'cermont_atg_token';

const isBrowser = typeof window !== 'undefined';

export interface SessionPayload {
  accessToken: string;
  refreshToken: string;
}

export function setSession({ accessToken, refreshToken }: SessionPayload) {
  if (!isBrowser) return;

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

  document.cookie = [
    `${SESSION_COOKIE_NAME}=${accessToken}`,
    'Path=/',
    `Max-Age=${60 * 60 * 24}`,
    'SameSite=Lax',
  ].join('; ');
}

export function clearSession() {
  if (!isBrowser) return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);

  document.cookie = [
    `${SESSION_COOKIE_NAME}=`,
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