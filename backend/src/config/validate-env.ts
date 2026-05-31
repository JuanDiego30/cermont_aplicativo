/**
 * Environment Variable Validation
 *
 * Compatibility wrapper around the validated backend env export.
 * The actual parsing lives in `@cermont/config` and `./env`.
 */

import { createLogger } from "../common/utils/logger";
import { type Env, env } from "./env";

const logger = createLogger("validate-env");

export function validateEnv(): Env {
	return env;
}

if (require.main === module) {
	logger.info("🔍 Validating environment variables...");
	const currentEnv = validateEnv();
	logger.info("✅ Environment validation passed!");
	logger.info(`   NODE_ENV: ${currentEnv.NODE_ENV}`);
	logger.info(`   PORT: ${currentEnv.PORT}`);
	logger.info(`   MONGODB_URI: ${currentEnv.MONGODB_URI.replace(/\/\/([^:]+):/g, "//***:")}`);
	logger.info(`   FRONTEND_URL: ${currentEnv.FRONTEND_URL}`);
	logger.info(`   LOG_LEVEL: ${currentEnv.LOG_LEVEL}`);
}

export default validateEnv;
