/**
 * Vitest Test Setup
 *
 * Sets up test environment with required environment variables
 * and global mocks for all tests
 */

import { vi } from "vitest";

// Set required environment variables before any imports
vi.stubEnv("MONGODB_URI", "mongodb://127.0.0.1:27017/cermont_test");
vi.stubEnv("JWT_SECRET", "test-jwt-secret-for-testing-only");
vi.stubEnv("REFRESH_TOKEN_SECRET", "test-refresh-secret-for-testing-only");
vi.stubEnv("BCRYPT_ROUNDS", "4");
vi.stubEnv("FRONTEND_URL", "http://localhost:3000");
vi.stubEnv("BACKEND_URL", "http://127.0.0.1:5000");
vi.stubEnv("NODE_ENV", "test");
vi.stubEnv("PORT", "4000");

// Mock logger to avoid console noise during tests
vi.mock("../src/_shared/common/utils/logger", () => ({
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
