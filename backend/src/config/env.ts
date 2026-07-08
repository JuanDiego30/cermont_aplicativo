import { type Env as SharedEnv, validateEnv as validateSharedEnv } from "@cermont/config";
import { z } from "zod";

const BackendRequiredEnvSchema = z
	.object({
		MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
		JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
		REFRESH_TOKEN_SECRET: z.string().min(32, "REFRESH_TOKEN_SECRET must be at least 32 characters"),
		FRONTEND_URL: z.url("FRONTEND_URL must be a valid URL"),
	})
	.strict();

type BackendRequiredEnv = z.infer<typeof BackendRequiredEnvSchema>;

export function validateBackendEnv(
	input: Partial<Record<string, string>> = process.env,
): SharedEnv & BackendRequiredEnv {
	const sharedEnv = validateSharedEnv(input);
	const requiredEnv = BackendRequiredEnvSchema.parse({
		MONGODB_URI: sharedEnv.MONGODB_URI,
		JWT_SECRET: sharedEnv.JWT_SECRET,
		REFRESH_TOKEN_SECRET: sharedEnv.REFRESH_TOKEN_SECRET,
		FRONTEND_URL: sharedEnv.FRONTEND_URL,
	});

	return {
		...sharedEnv,
		...requiredEnv,
	};
}

export const env = Object.freeze(validateBackendEnv());

export type Env = typeof env;

export type BackendEnv = SharedEnv & Env;
