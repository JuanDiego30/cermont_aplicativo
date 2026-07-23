/**
 * Global test setup — runs in main process before workers.
 * Sets env vars that are inherited by all worker processes,
 * ensuring modules that validate env at import time work correctly.
 */
export function setup(): void {
	process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/cermont_test";
	process.env.JWT_SECRET = "test-jwt-secret-for-testing-only";
	process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-for-testing-only";
	process.env.BCRYPT_ROUNDS = "4";
	process.env.FRONTEND_URL = "http://localhost:3000";
	process.env.NODE_ENV = "test";
	process.env.PORT = "4000";
}
