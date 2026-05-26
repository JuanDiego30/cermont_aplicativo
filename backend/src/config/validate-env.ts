/**
 * Environment Variable Validation
 *
 * Compatibility wrapper around the validated backend env export.
 * The actual parsing lives in `@cermont/config` and `./env`.
 */

import { type Env, env } from "./env";

export function validateEnv(): Env {
	return env;
}

if (require.main === module) {
	console.log("🔍 Validating environment variables...");
	const currentEnv = validateEnv();
	console.log("✅ Environment validation passed!");
	console.log(`   NODE_ENV: ${currentEnv.NODE_ENV}`);
	console.log(`   PORT: ${currentEnv.PORT}`);
	console.log(`   MONGODB_URI: ${currentEnv.MONGODB_URI.replace(/\/\/([^:]+):/g, "//***:")}`);
	console.log(`   FRONTEND_URL: ${currentEnv.FRONTEND_URL}`);
	console.log(`   LOG_LEVEL: ${currentEnv.LOG_LEVEL}`);
}

export default validateEnv;
