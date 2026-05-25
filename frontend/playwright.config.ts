import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";
const isCI = (process.env.CI ?? "") === "true";
const repoRoot =
	path.basename(process.cwd()) === "frontend" ? path.resolve(process.cwd(), "..") : process.cwd();

export default defineConfig({
	testDir: "./tests/e2e",
	globalSetup: "./tests/e2e/global-setup.ts",
	globalTeardown: "./tests/e2e/global-teardown.ts",

	workers: 2,
	timeout: 90_000,
	expect: { timeout: 15_000 },
	retries: isCI ? 1 : 0,
	reporter: [["html", { open: "never" }], ["list"]],

	use: {
		baseURL: baseUrl,
		trace: "on-first-retry",
		screenshot: "only-on-failure",
		navigationTimeout: 60_000,
		actionTimeout: 20_000,
	},

	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "mobile",
			testMatch: /.*\/smoke\/.*\.spec\.ts$/,
			use: { ...devices["iPhone 13"] },
		},
	],

	webServer: {
		command: `cross-env NODE_ENV=test MONGODB_URI=mongodb://127.0.0.1:27017/cermont_test JWT_SECRET=test-secret-not-for-production REFRESH_TOKEN_SECRET=test-refresh-secret FRONTEND_URL=${baseUrl} BACKEND_URL=${backendUrl} NEXT_PUBLIC_APP_URL=${baseUrl} TEST_BASE_URL=${baseUrl} npm run dev`,
		cwd: repoRoot,
		url: `${baseUrl}/login`,
		reuseExistingServer: !isCI,
		timeout: 180_000,
		stdout: "pipe",
		stderr: "pipe",
	},
});
