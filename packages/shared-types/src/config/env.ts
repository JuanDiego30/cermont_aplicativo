/**
 * @packageDocumentation
 * Environment validation with Zod - Single Source of Truth
 *
 * This package is shared between frontend and backend, so variables that are
 * specific to one runtime are modeled as optional here. Use {@link validateEnv}
 * at application startup to ensure all required variables are present.
 *
 * @example
 * ```typescript
 * // Backend startup validation
 * import { validateEnv } from '@cermont/shared-types/config';
 *
 * const env = validateEnv(); // Throws on missing/invalid vars
 * await mongoose.connect(env.MONGODB_URI!);
 * ```
 *
 * @example
 * ```typescript
 * // Frontend safe access
 * import { env } from '@cermont/shared-types/config';
 *
 * const backendUrl = env.BACKEND_URL; // Typed as string | undefined
 * ```
 */

import { z } from "zod";

const emptyStringToUndefined = (value: unknown): unknown =>
	typeof value === "string" && value.trim().length === 0 ? undefined : value;

const optionalString = (schema: z.ZodString) =>
	z.preprocess(emptyStringToUndefined, schema.optional());

/**
 * Environment variable schema for the entire monorepo.
 *
 * Variables are optional by default to support both frontend and backend.
 * Each application should validate the subset of variables it requires.
 *
 * @remarks
 * - Use `.min(1)` for required strings to catch empty values
 * - Use `.coerce.number()` for numeric vars (e.g., PORT)
 * - Use `.url()` for URL validation with protocol check
 * - Backend-only vars: MONGODB_URI, JWT_SECRET, REFRESH_TOKEN_SECRET, FRONTEND_URL
 *
 * @see {@link validateEnv} for runtime validation
 */
const envSchema = z.object({
	NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
	CI: z.coerce.boolean().default(false),
	PORT: z.coerce.number().int().positive().default(5000),
	MONGODB_URI: optionalString(z.string().min(1, "MONGODB_URI is required")),
	JWT_SECRET: optionalString(z.string().min(32, "JWT_SECRET must be at least 32 characters")),
	JWT_EXPIRES_IN: z.string().default("15m"),
	REFRESH_TOKEN_SECRET: optionalString(
		z.string().min(32, "REFRESH_TOKEN_SECRET must be at least 32 characters"),
	),
	REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
	FRONTEND_URL: optionalString(z.string().url("FRONTEND_URL must be a valid URL")),
	BACKEND_URL: optionalString(z.string().url("BACKEND_URL must be a valid URL")),
	NEXT_PUBLIC_APP_URL: optionalString(z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL")),
	TEST_BASE_URL: optionalString(z.string().url("TEST_BASE_URL must be a valid URL")),
	AUTH_SECRET: optionalString(z.string().min(1)),
	BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),
	SENTRY_DSN: optionalString(z.string()),
	REPORT_ARCHIVE_ENABLED: z.coerce.boolean().default(false),
	SEED_DEFAULT_PASSWORD: optionalString(z.string().min(1)),
	LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
	UPLOAD_DIR: z.string().default("./uploads"),
	MAX_FILE_SIZE: z.coerce
		.number()
		.positive()
		.default(10 * 1024 * 1024),
	CLAMAV_ENABLED: z.coerce.boolean().default(false),
	CLAMAV_HOST: z.string().default("localhost"),
	CLAMAV_PORT: z.string().default("3310"),
});

/**
 * Inferred TypeScript type for validated environment variables.
 *
 * @example
 * ```typescript
 * const env: Env = validateEnv();
 * const port: number = env.PORT; // Typed correctly
 * const dbUri: string | undefined = env.MONGODB_URI; // Optional
 * ```
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Format Zod validation issues into human-readable error messages.
 *
 * @param issues - Array of Zod validation errors
 * @returns Multi-line formatted string with each issue on a separate line
 *
 * @internal
 *
 * @example
 * ```typescript
 * // Output example:
 * // - JWT_SECRET: JWT_SECRET must be at least 32 characters
 * // - MONGODB_URI: MONGODB_URI is required
 * ```
 */
function formatIssues(issues: z.ZodIssue[]): string {
	return issues
		.map((issue) => {
			const path = issue.path.join(".");
			const prefix = path ? `${path}: ` : "";
			return `- ${prefix}${issue.message}`;
		})
		.join("\n");
}

/**
 * Validate environment variables and return a typed object.
 *
 * Throws an error with formatted validation issues if validation fails.
 * Use this function at application startup to fail fast on misconfiguration.
 *
 * @param input - Environment variables to validate (defaults to `process.env`)
 * @returns Validated and typed environment object
 * @throws {Error} If validation fails, with detailed error messages
 *
 * @example
 * ```typescript
 * // Backend app.ts - validate at startup
 * import { validateEnv } from '@cermont/shared-types/config';
 *
 * try {
 *   const env = validateEnv();
 *   console.log(`Starting server on port ${env.PORT}`);
 * } catch (error) {
 *   console.error('Environment validation failed:', error.message);
 *   process.exit(1);
 * }
 * ```
 */
export function validateEnv(input: Record<string, string | undefined> = process.env): Env {
	const result = envSchema.safeParse(input);
	if (!result.success) {
		throw new Error(`Environment validation failed:\n${formatIssues(result.error.issues)}`);
	}
	return result.data;
}

/**
 * Get validated environment variables (alias for {@link validateEnv}).
 *
 * @param input - Environment variables to validate
 * @returns Validated environment object
 * @throws {Error} If validation fails
 *
 * @example
 * ```typescript
 * const env = getEnv();
 * const port = env.PORT; // number
 * ```
 */
export function getEnv(input: Record<string, string | undefined> = process.env): Env {
	return validateEnv(input);
}

/**
 * Check if the application is running in production mode.
 *
 * @param input - Environment variables (defaults to `process.env`)
 * @returns `true` if NODE_ENV is 'production', `false` otherwise
 *
 * @example
 * ```typescript
 * if (isProduction()) {
 *   // Enable production optimizations
 *   app.use(compression());
 * }
 * ```
 */
export function isProduction(input: Record<string, string | undefined> = process.env): boolean {
	return (input.NODE_ENV ?? "development") === "production";
}

/**
 * Get a single environment variable with optional fallback.
 *
 * @param key - Environment variable name
 * @param fallback - Default value if the variable is undefined (default: '')
 * @returns The variable value or fallback
 *
 * @deprecated Prefer using {@link validateEnv} for type-safe access
 *
 * @example
 * ```typescript
 * const logLevel = getEnvVar('LOG_LEVEL', 'info');
 * ```
 */
export function getEnvVar(key: string, fallback = ""): string {
	const value = process.env[key];
	return value ?? fallback;
}

/**
 * Non-throwing snapshot for read-only access to environment variables.
 *
 * **WARNING**: This object does NOT validate the environment at runtime.
 * Values may be `undefined` if not set. Use {@link validateEnv} when strict
 * validation is required (e.g., at application startup).
 *
 * @remarks
 * - Frozen object with type-safe access
 * - Useful for configuration that has fallback defaults
 * - Backend should call `validateEnv()` before using this
 *
 * @example
 * ```typescript
 * // Safe read-only access
 * const logLevel = env.LOG_LEVEL; // 'error' | 'warn' | 'info' | 'debug'
 * const port = env.PORT; // number
 *
 * // Optional values may be undefined
 * const dbUri = env.MONGODB_URI; // string | undefined
 * ```
 */
export const env = Object.freeze({
	NODE_ENV: (process.env.NODE_ENV ?? "development") as Env["NODE_ENV"],
	PORT: Number(process.env.PORT ?? 5000),
	MONGODB_URI: process.env.MONGODB_URI,
	JWT_SECRET: process.env.JWT_SECRET,
	JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "15m",
	REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
	REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d",
	FRONTEND_URL: process.env.FRONTEND_URL,
	BACKEND_URL: process.env.BACKEND_URL,
	SENTRY_DSN: process.env.SENTRY_DSN,
	REPORT_ARCHIVE_ENABLED: process.env.REPORT_ARCHIVE_ENABLED === "true",
	SEED_DEFAULT_PASSWORD: process.env.SEED_DEFAULT_PASSWORD,
	LOG_LEVEL: (process.env.LOG_LEVEL ?? "info") as Env["LOG_LEVEL"],
	UPLOAD_DIR: process.env.UPLOAD_DIR ?? "./uploads",
	MAX_FILE_SIZE: Number(process.env.MAX_FILE_SIZE ?? 10 * 1024 * 1024),
	CLAMAV_ENABLED: process.env.CLAMAV_ENABLED === "true",
} satisfies Partial<Env>);

/**
 * Default export for convenience imports.
 *
 * @example
 * ```typescript
 * import config from '@cermont/shared-types/config';
 *
 * const env = config.validateEnv();
 * const isProd = config.isProduction();
 * ```
 */
export default {
	validateEnv,
	getEnv,
	isProduction,
	getEnvVar,
	env,
} as const;
