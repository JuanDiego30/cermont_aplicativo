import { type Env as SharedEnv, validateEnv as validateSharedEnv } from "@cermont/config";
import { z } from "zod";

const BackendRequiredEnvSchema = z
	.object({
		MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
		JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
		REFRESH_TOKEN_SECRET: z.string().min(32, "REFRESH_TOKEN_SECRET must be at least 32 characters"),
		FRONTEND_URL: z.string().url("FRONTEND_URL must be a valid URL"),
	})
	.strict();

type BackendRequiredEnv = z.infer<typeof BackendRequiredEnvSchema>;

function validateEmailConfig(env: SharedEnv): void {
	const provider = env.EMAIL_PROVIDER ?? "log";

	if (provider !== "smtp") {
		// Production forbids "log" provider
		if (provider === "log" && env.NODE_ENV === "production") {
			throw new Error(
				"EMAIL_PROVIDER='log' is not allowed in production. Configure EMAIL_PROVIDER=smtp or EMAIL_PROVIDER=mailpit.",
			);
		}
		return;
	}

	// SMTP provider: validate required vars
	const required = [
		["EMAIL_HOST", env.EMAIL_HOST],
		["EMAIL_PORT", env.EMAIL_PORT],
		["EMAIL_USER", env.EMAIL_USER],
		["EMAIL_PASS", env.EMAIL_PASS],
	] as const;
	const missing = required.filter(([, v]) => !v).map(([k]) => k);
	if (missing.length > 0) {
		throw new Error(
			`EMAIL_PROVIDER is 'smtp' but required variables are missing: ${missing.join(", ")}`,
		);
	}
}

function validateProductionUrl(env: SharedEnv): void {
	if (env.NODE_ENV === "production" && env.FRONTEND_URL?.includes("localhost")) {
		throw new Error("FRONTEND_URL must not point to localhost in production");
	}
}

export function validateBackendEnv(
	input: Record<string, string | undefined> = process.env,
): SharedEnv & BackendRequiredEnv {
	const sharedEnv = validateSharedEnv(input);
	const requiredEnv = BackendRequiredEnvSchema.parse({
		MONGODB_URI: sharedEnv.MONGODB_URI,
		JWT_SECRET: sharedEnv.JWT_SECRET,
		REFRESH_TOKEN_SECRET: sharedEnv.REFRESH_TOKEN_SECRET,
		FRONTEND_URL: sharedEnv.FRONTEND_URL,
	});

	validateEmailConfig(sharedEnv);
	validateProductionUrl(sharedEnv);

	return {
		...sharedEnv,
		...requiredEnv,
	};
}

export const env = Object.freeze(validateBackendEnv());

export type Env = typeof env;

export type BackendEnv = SharedEnv & Env;
