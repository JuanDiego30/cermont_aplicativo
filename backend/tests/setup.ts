/**
 * Vitest Test Setup
 *
 * Sets up test environment with required environment variables
 * and global mocks for all tests
 */

import { vi } from "vitest";

// Set required environment variables directly (process.env bypasses vi.stubEnv timing issues)
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/cermont_test";
process.env.JWT_SECRET = "test-jwt-secret-for-testing-only";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-for-testing-only";
process.env.BCRYPT_ROUNDS = "4";
process.env.FRONTEND_URL = "http://localhost:3000";
process.env.NODE_ENV = "test";
process.env.PORT = "4000";

// Mock env module to prevent import-time env validation from killing tests
vi.mock("../src/config/env", () => ({
	env: {
		LOG_LEVEL: "info",
		NODE_ENV: "test",
		MONGODB_URI: "mongodb://127.0.0.1:27017/cermont_test",
		JWT_SECRET: "test-jwt-secret-for-testing-only",
		REFRESH_TOKEN_SECRET: "test-refresh-secret-for-testing-only",
		FRONTEND_URL: "http://localhost:3000",
		PORT: 4000,
		BCRYPT_ROUNDS: 4,
		JWT_EXPIRES_IN: "15m",
		REFRESH_TOKEN_EXPIRES_IN: "7d",
		ENABLE_CERMONT_AI: false,
		AI_RATE_LIMIT_RPM: 10,
		AI_RATE_LIMIT_BURST: 20,
		UPLOAD_DIR: "./uploads",
		MAX_FILE_SIZE: 10485760,
		CLAMAV_ENABLED: false,
		REPORT_ARCHIVE_ENABLED: false,
	},
	validateBackendEnv: () => ({
		LOG_LEVEL: "info" as const,
		NODE_ENV: "test" as const,
		MONGODB_URI: "mongodb://127.0.0.1:27017/cermont_test",
		JWT_SECRET: "test-jwt-secret-for-testing-only",
		REFRESH_TOKEN_SECRET: "test-refresh-secret-for-testing-only",
		FRONTEND_URL: "http://localhost:3000",
		PORT: 4000,
		BCRYPT_ROUNDS: 4,
		JWT_EXPIRES_IN: "15m",
		REFRESH_TOKEN_EXPIRES_IN: "7d",
		BACKEND_URL: undefined,
		ENABLE_CERMONT_AI: false,
		AI_RATE_LIMIT_RPM: 10,
		AI_RATE_LIMIT_BURST: 20,
		CI: false,
		NEXT_PUBLIC_API_URL: undefined,
		NEXT_PUBLIC_APP_URL: undefined,
		TEST_BASE_URL: undefined,
		AUTH_SECRET: undefined,
		SENTRY_DSN: undefined,
		SEED_DEFAULT_PASSWORD: undefined,
		UPLOAD_DIR: "./uploads",
		MAX_FILE_SIZE: 10485760,
		CLAMAV_ENABLED: false,
		CLAMAV_HOST: "localhost",
		CLAMAV_PORT: "3310",
		REPORT_ARCHIVE_ENABLED: false,
	}),
}));

// Mock logger to avoid console noise during tests
vi.mock("../src/common/utils/logger", () => ({
	createLogger: () => ({
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
		debug: vi.fn(),
	}),
}));

// Global test hooks
beforeEach(() => {
	vi.clearAllMocks();
});
