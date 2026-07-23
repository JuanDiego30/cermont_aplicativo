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

const BackendAiEnvSchema = z
	.object({
		ENABLE_CERMONT_AI: z.coerce.boolean().default(false),
		AI_RATE_LIMIT_RPM: z.coerce.number().int().positive().default(10),
		AI_RATE_LIMIT_BURST: z.coerce.number().int().positive().default(20),
		AI_API_KEY: z.string().optional(),
		AI_ENDPOINT: z.url().optional(),
		OPENAI_API_KEY: z.string().optional(),
		GEMINI_API_KEY: z.string().optional(),
		OLLAMA_BASE_URL: z.string().optional(),
		OLLAMA_MODEL: z.string().optional(),
	});

type BackendRequiredEnv = z.infer<typeof BackendRequiredEnvSchema>;
type BackendAiEnv = z.infer<typeof BackendAiEnvSchema>;

export function validateBackendEnv(
	input: Record<string, string | undefined> = process.env,
): SharedEnv & BackendRequiredEnv & BackendAiEnv {
	const sharedEnv = validateSharedEnv(input);
	const requiredEnv = BackendRequiredEnvSchema.parse({
		MONGODB_URI: sharedEnv.MONGODB_URI,
		JWT_SECRET: sharedEnv.JWT_SECRET,
		REFRESH_TOKEN_SECRET: sharedEnv.REFRESH_TOKEN_SECRET,
		FRONTEND_URL: sharedEnv.FRONTEND_URL,
	});
	const aiEnv = BackendAiEnvSchema.parse(input);

	return {
		...sharedEnv,
		...requiredEnv,
		...aiEnv,
	};
}

let _env: ReturnType<typeof validateBackendEnv> | undefined;
export const env: Readonly<ReturnType<typeof validateBackendEnv>> = new Proxy(
	{} as ReturnType<typeof validateBackendEnv>,
	{
		get(_, p) {
			if (_env === undefined) {
				_env = validateBackendEnv();
			}
			return _env[p as keyof ReturnType<typeof validateBackendEnv>];
		},
	},
);

export type Env = typeof env;

export type BackendEnv = SharedEnv & Env;
