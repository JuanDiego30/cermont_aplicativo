/**
 * Environment configuration
 * Typed environment variables for the application
 */

export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const;
