import {
	type Env as SharedEnv,
	validateEnv as validateSharedEnv,
} from "@cermont/shared-types/config";

function requireValue(value: string | undefined, name: string): string {
	if (!value) {
		throw new Error(`${name} is required`);
	}
	return value;
}

const sharedEnv = validateSharedEnv();

export const env = Object.freeze({
	...sharedEnv,
	MONGODB_URI: requireValue(sharedEnv.MONGODB_URI, "MONGODB_URI"),
	JWT_SECRET: requireValue(sharedEnv.JWT_SECRET, "JWT_SECRET"),
	REFRESH_TOKEN_SECRET: requireValue(sharedEnv.REFRESH_TOKEN_SECRET, "REFRESH_TOKEN_SECRET"),
	FRONTEND_URL: requireValue(sharedEnv.FRONTEND_URL, "FRONTEND_URL"),
} as const);

export type Env = typeof env;

export type BackendEnv = SharedEnv & Env;
