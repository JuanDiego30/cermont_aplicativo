/**
 * Frontend Environment Variable Validator
 *
 * Validates critical environment variables are set before the app runs.
 * Fails fast with clear error messages.
 */

import { isProduction, validateEnv as validateSharedEnv } from "@cermont/shared-types/config";

type PublicEnv = {
	NEXT_PUBLIC_APP_URL: string;
};

function getPublicEnv(): Partial<PublicEnv> {
	const env = validateSharedEnv();
	return {
		NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
	};
}

export function validateEnv(): PublicEnv {
	const env = getPublicEnv();

	if (!env.NEXT_PUBLIC_APP_URL) {
		console.error("\n❌ Frontend environment validation failed:\n");
		console.error("  - NEXT_PUBLIC_APP_URL is required");
		console.error("\nPlease ensure NEXT_PUBLIC_APP_URL is set in your environment.\n");
		throw new Error("NEXT_PUBLIC_APP_URL is required");
	}

	return {
		NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
	};
}

export function getEnv(): Partial<PublicEnv> {
	return getPublicEnv();
}

if (typeof window === "undefined" && isProduction()) {
	validateEnv();
}
