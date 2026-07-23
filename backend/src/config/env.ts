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

	// Validate email config when provider is smtp
	const provider = sharedEnv.EMAIL_PROVIDER ?? "log";
	if (provider === "smtp") {
		const missing: string[] = [];
		if (!sharedEnv.EMAIL_HOST) missing.push("EMAIL_HOST");
		if (!sharedEnv.EMAIL_PORT) missing.push("EMAIL_PORT");
		if (!sharedEnv.EMAIL_USER) missing.push("EMAIL_USER");
		if (!sharedEnv.EMAIL_PASS) missing.push("EMAIL_PASS");
		if (missing.length > 0) {
			throw new Error(
				`EMAIL_PROVIDER is 'smtp' but required variables are missing: ${missing.join(", ")}`,
			);
		}
	}

	// In production, "log" provider is not allowed
	if (provider === "log" && sharedEnv.NODE_ENV === "production") {
		throw new Error(
			"EMAIL_PROVIDER='log' is not allowed in production. Configure EMAIL_PROVIDER=smtp or EMAIL_PROVIDER=mailpit.",
		);
	}

	// FRONTEND_URL must not be localhost in production
	if (sharedEnv.NODE_ENV === "production" && sharedEnv.FRONTEND_URL?.includes("localhost")) {
		throw new Error("FRONTEND_URL must not point to localhost in production");
	}

	return {
		...sharedEnv,
		...requiredEnv,
	};
}

export const env = Object.freeze(validateBackendEnv());

export type Env = typeof env;

export type BackendEnv = SharedEnv & Env;
