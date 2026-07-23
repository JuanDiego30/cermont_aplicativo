import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		env: {
			MONGODB_URI: "mongodb://127.0.0.1:27017/cermont_test",
			JWT_SECRET: "test-jwt-secret-for-testing-only",
			REFRESH_TOKEN_SECRET: "test-refresh-secret-for-testing-only",
			FRONTEND_URL: "http://localhost:3000",
			NODE_ENV: "test",
			PORT: "4000",
			BCRYPT_ROUNDS: "4",
		},
		setupFiles: ["./tests/setup.ts"],
		include: ["tests/**/*.test.ts"],
		exclude: [
			"tests/integration/**",
			"node_modules/",
			".claude/**",
			".kilo/**",
			".codex/**",
			".worktrees/**",
		],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: [
				"src/common/errors/AppError.ts",
				"src/common/middlewares/request-id.middleware.ts",
				"src/common/observability/**/*.ts",
				"src/common/security/**/*.ts",
				"src/middlewares/auth.middleware.ts",
				"src/middlewares/idempotency.middleware.ts",
				"src/middlewares/rate-limiter.ts",
				"src/middlewares/uploadMiddleware.ts",
				"src/models/plugins/**/*.ts",
				"src/modules/audit/audit.service.ts",
				"src/modules/proposal/proposal.service.ts",
				"src/services/case-closure-lock.service.ts",
				"src/services/evidence-reference-integrity.service.ts",
				"src/services/invoice-integrity.service.ts",
				"src/services/reminder-checks/**/*.ts",
				"src/services/reminder-worker.service.ts",
				"src/services/workflow-audit.service.ts",
			],
			exclude: ["node_modules/", "tests/", "src/scripts/**", "src/**/*.d.ts"],
			thresholds: {
				lines: 60,
				functions: 60,
				branches: 60,
				statements: 60,
				"src/common/security/**/*.ts": {
					lines: 80,
					functions: 80,
					branches: 80,
					statements: 80,
				},
				"src/middlewares/auth.middleware.ts": {
					lines: 80,
					functions: 80,
					branches: 80,
					statements: 80,
				},
				"src/middlewares/uploadMiddleware.ts": {
					lines: 80,
					functions: 80,
					branches: 70,
					statements: 80,
				},
				"src/models/plugins/tenant-isolation.ts": {
					lines: 80,
					functions: 80,
					branches: 80,
					statements: 80,
				},
			},
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
