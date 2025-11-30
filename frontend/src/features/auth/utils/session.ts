/**
 * Session Management Utilities
 * 
 * Security considerations:
 * - Tokens stored in localStorage for SPA functionality
 * - Cookies used for Next.js middleware route protection
 * - Secure flag added in production (HTTPS)
 * - SameSite=Strict to prevent CSRF
 */

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_ROLE_KEY = 'userRole';
const SESSION_COOKIE_NAME = 'cermont_atg_token';

const isBrowser = typeof window !== 'undefined';
const isSecure = isBrowser && window.location.protocol === 'https:';

export interface SessionPayload {
  accessToken: string;
  refreshToken: string;
  userRole?: string;
}

/**
 * Validates token format (basic JWT structure check)
 */
function isValidTokenFormat(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
}

/**
 * Sets a cookie with security options
 */
function setCookie(name: string, value: string, maxAge: number): void {
  const cookieParts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    `Max-Age=${maxAge}`,
    'SameSite=Strict',
  ];
  
  if (isSecure) {
    cookieParts.push('Secure');
  }
  
  document.cookie = cookieParts.join('; ');
}

/**
 * Clears a cookie
 */
function clearCookie(name: string): void {
  const cookieParts = [
    `${name}=`,
    'Path=/',
    'Max-Age=0',
    'SameSite=Strict',
  ];
  
  if (isSecure) {
    cookieParts.push('Secure');
  }
  
  document.cookie = cookieParts.join('; ');
}

export function setSession({ accessToken, refreshToken, userRole }: SessionPayload) {
  if (!isBrowser) return;

  console.log('🔒 setSession called with:', {
    accessTokenLength: accessToken?.length,
    refreshTokenLength: refreshToken?.length,
    userRole
  });

  // Validate token format before storing
  if (!isValidTokenFormat(accessToken)) {
    console.error('❌ Invalid accessToken format:', accessToken?.substring(0, 50));
    console.error('Token parts:', accessToken?.split('.').length);
    // No return - still try to save
  }
  
  if (!isValidTokenFormat(refreshToken)) {
    console.error('❌ Invalid refreshToken format:', refreshToken?.substring(0, 50));
    console.error('Token parts:', refreshToken?.split('.').length);
    // No return - still try to save
  }

  // Guardar tokens aunque la validación falle (el backend puede usar otro formato)
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (userRole) {
    localStorage.setItem(USER_ROLE_KEY, userRole);
  }
  
  // Set accessToken cookie (24 hours)
  setCookie(SESSION_COOKIE_NAME, accessToken, 60 * 60 * 24);

  // Set userRole cookie for middleware
  if (userRole) {
    setCookie(USER_ROLE_KEY, userRole, 60 * 60 * 24);
  }

  console.log('✅ Session stored in localStorage');
}

export function clearSession() {
  if (!isBrowser) return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY);

  // Clear cookies
  clearCookie(SESSION_COOKIE_NAME);
  clearCookie(USER_ROLE_KEY);
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
