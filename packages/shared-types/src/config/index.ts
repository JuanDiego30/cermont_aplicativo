/**
 * Config package - Environment configuration and validation
 *
 * Centralized Zod-based validation for backend and frontend environments.
 * Exports utilities for type-safe environment variable access.
 *
 * @example
 * ```typescript
 * // Startup validation (backend)
 * import { validateEnv } from '@cermont/shared-types/config';
 * const env = validateEnv(); // Throws on missing/invalid vars
 *
 * // Read-only access
 * import { env } from '@cermont/shared-types/config';
 * const port = env.PORT; // number
 * ```
 */

// Re-export for convenience
export { type Env, env, getEnv, getEnvVar, isProduction, validateEnv } from "./env";

/**
 * @deprecated Prefer using {@link validateEnv} for type-safe environment access.
 */
