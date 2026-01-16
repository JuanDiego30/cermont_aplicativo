export const AUTH_CONSTANTS = {
  JWT_SECRET_ENV: 'JWT_SECRET',
  JWT_PRIVATE_KEY_ENV: 'JWT_PRIVATE_KEY',
  JWT_PUBLIC_KEY_ENV: 'JWT_PUBLIC_KEY',
  JWT_ALGORITHM_ENV: 'JWT_ALGORITHM',
  JWT_EXPIRES_IN_ENV: 'JWT_EXPIRES_IN',
  JWT_DEFAULT_EXPIRES_IN: '15m',

  // Refresh tokens
  REFRESH_TOKEN_DAYS_DEFAULT: 7,
  // Regla 9: Refresh 7 días (aunque exista rememberMe)
  REFRESH_TOKEN_DAYS_REMEMBER: 7,

  // CSRF (double submit cookie)
  CSRF_COOKIE_NAME: 'csrfToken',
  CSRF_HEADER_NAME: 'x-csrf-token',

  // Blacklist de access tokens (jti)
  JWT_REVOKED_JTI_CACHE_KEY_PREFIX: 'auth:jwt:revoked:',

  // Cache
  JWT_USER_CACHE_TTL_MS_ENV: 'JWT_USER_CACHE_TTL_MS',
  JWT_USER_CACHE_TTL_MS_DEFAULT: 30_000,
  JWT_USER_CACHE_KEY_PREFIX: 'auth:jwt:user:',
} as const;
