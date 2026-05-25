/**
 * @packageDocumentation
 * Config package - Environment configuration and validation
 *
 * Centralized Zod-based validation for backend and frontend environments.
 * Exports utilities for type-safe environment variable access.
 *
 * @example
 * ```typescript
 * // Startup validation (backend)
 * import { validateEnv } from '@cermont/config';
 * const env = validateEnv(); // Throws on missing/invalid vars
 *
 * // Read-only access
 * import { env } from '@cermont/config';
 * const port = env.PORT; // number
 * ```
 */

export * from "./env";

// Re-export for convenience
export { env, getEnv, getEnvVar, isProduction, validateEnv } from "./env";
