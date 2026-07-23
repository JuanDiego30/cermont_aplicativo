/**
 * @packageDocumentation
 * Environment validation with Zod - Single Source of Truth
 *
 * This package is shared between frontend and backend, so variables that are
 * specific to one runtime are modeled as optional here. Use {@link validateEnv}
 * at application startup to ensure all required variables are present.
 */

import { z } from "zod";

const emptyStringToUndefined = (value: unknown): unknown =>
	typeof value === "string" && value.trim().length === 0 ? undefined : value;

const optionalString = (schema: z.ZodString) =>
	z.preprocess(emptyStringToUndefined, schema.optional());

const emailProviderSchema = z.enum(["smtp", "mailpit", "log"]).default("log");

/**
 * Environment variable schema for the entire monorepo.
 */
const envSchema = z.object({
	NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
	CI: z.coerce.boolean().default(false),
	PORT: z.coerce.number().int().positive().default(4000),
	MONGODB_URI: optionalString(z.string().min(1, "MONGODB_URI is required")),
	JWT_SECRET: optionalString(z.string().min(32, "JWT_SECRET must be at least 32 characters")),
	JWT_EXPIRES_IN: z.string().default("15m"),
	REFRESH_TOKEN_SECRET: optionalString(
		z.string().min(32, "REFRESH_TOKEN_SECRET must be at least 32 characters"),
	),
	REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
	FRONTEND_URL: optionalString(z.string().url("FRONTEND_URL must be a valid URL")),
	BACKEND_URL: optionalString(z.string().url("BACKEND_URL must be a valid URL")),
	NEXT_PUBLIC_API_URL: optionalString(z.string().url("NEXT_PUBLIC_API_URL must be a valid URL")),
	NEXT_PUBLIC_APP_URL: optionalString(z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL")),
	TEST_BASE_URL: optionalString(z.string().url("TEST_BASE_URL must be a valid URL")),
	AUTH_SECRET: optionalString(z.string().min(1)),
	BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),
	SENTRY_DSN: optionalString(z.string()),
	REPORT_ARCHIVE_ENABLED: z.coerce.boolean().default(false),
	SEED_DEFAULT_PASSWORD: optionalString(
		z.string().min(16, "SEED_DEFAULT_PASSWORD must be at least 16 characters"),
	),
	LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
	UPLOAD_DIR: z.string().default("./uploads"),
	MAX_FILE_SIZE: z.coerce
		.number()
		.positive()
		.default(10 * 1024 * 1024),
	CLAMAV_ENABLED: z.coerce.boolean().default(false),
	CLAMAV_HOST: z.string().default("localhost"),
	CLAMAV_PORT: z.string().default("3310"),

	// Email configuration — shared vars
	EMAIL_PROVIDER: emailProviderSchema,
	EMAIL_FROM: z.string().default("noreply@cermont.com.co"),
	EMAIL_HOST: optionalString(z.string().min(1)),
	EMAIL_PORT: z.preprocess((v) => (v === "" || v === undefined ? undefined : Number(v)), z.number().int().positive().optional()),
	EMAIL_SECURE: z.coerce.boolean().default(false),
	EMAIL_USER: optionalString(z.string().min(1)),
	EMAIL_PASS: optionalString(z.string().min(1)),
});

export type Env = z.infer<typeof envSchema>;

function formatIssues(issues: z.ZodIssue[]): string {
	return issues
		.map((issue) => {
			const path = issue.path.join(".");
			const prefix = path ? `${path}: ` : "";
			return `- ${prefix}${issue.message}`;
		})
		.join("\n");
}

export function validateEnv(input: Record<string, string | undefined> = process.env): Env {
	const result = envSchema.safeParse(input);
	if (!result.success) {
		throw new Error(`Environment validation failed:\n${formatIssues(result.error.issues)}`);
	}
	return result.data;
}

export function getEnv(input: Record<string, string | undefined> = process.env): Env {
	return validateEnv(input);
}

export function isProduction(input: Record<string, string | undefined> = process.env): boolean {
	return (input.NODE_ENV ?? "development") === "production";
}

export function getEnvVar(key: string, fallback = ""): string {
	const value = process.env[key];
	return value ?? fallback;
}

export const env = Object.freeze({
	NODE_ENV: (process.env.NODE_ENV ?? "development") as Env["NODE_ENV"],
	PORT: Number(process.env.PORT ?? 4000),
	MONGODB_URI: process.env.MONGODB_URI,
	JWT_SECRET: process.env.JWT_SECRET,
	JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "15m",
	REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
	REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d",
	FRONTEND_URL: process.env.FRONTEND_URL,
	BACKEND_URL: process.env.BACKEND_URL,
	NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
	SENTRY_DSN: process.env.SENTRY_DSN,
	REPORT_ARCHIVE_ENABLED: process.env.REPORT_ARCHIVE_ENABLED === "true",
	SEED_DEFAULT_PASSWORD: process.env.SEED_DEFAULT_PASSWORD,
	LOG_LEVEL: (process.env.LOG_LEVEL ?? "info") as Env["LOG_LEVEL"],
	UPLOAD_DIR: process.env.UPLOAD_DIR ?? "./uploads",
	MAX_FILE_SIZE: Number(process.env.MAX_FILE_SIZE ?? 10 * 1024 * 1024),
	CLAMAV_ENABLED: process.env.CLAMAV_ENABLED === "true",
	EMAIL_PROVIDER: (process.env.EMAIL_PROVIDER ?? "log") as Env["EMAIL_PROVIDER"],
	EMAIL_FROM: process.env.EMAIL_FROM ?? "noreply@cermont.com.co",
	EMAIL_HOST: process.env.EMAIL_HOST,
	EMAIL_PORT: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined,
	EMAIL_SECURE: process.env.EMAIL_SECURE === "true",
	EMAIL_USER: process.env.EMAIL_USER,
	EMAIL_PASS: process.env.EMAIL_PASS,
} satisfies Partial<Env>);

export default {
	validateEnv,
	getEnv,
	isProduction,
	getEnvVar,
	env,
} as const;

