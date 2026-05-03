/**
 * Environment Variable Validation
 *
 * Compatibility wrapper around the validated backend env export.
 * The actual parsing lives in `@cermont/shared-types/config` and `./env`.
 */

import { createLogger } from "../common/utils";
import { type Env, env } from "./env";

const log = createLogger("validate-env");

export function validateEnv(): Env {
	return env;
}

if (require.main === module) {
	log.info("Validating environment variables...");
	const currentEnv = validateEnv();
	log.info("Environment validation passed!", {
		NODE_ENV: currentEnv.NODE_ENV,
		PORT: currentEnv.PORT,
		MONGODB_URI: currentEnv.MONGODB_URI.replace(/\/\/([^:]+):/g, "//***:"),
		FRONTEND_URL: currentEnv.FRONTEND_URL,
		LOG_LEVEL: currentEnv.LOG_LEVEL,
	});
}

export default validateEnv;
