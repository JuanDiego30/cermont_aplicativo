import { defineConfig, devices } from "@playwright/test";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const isCI = (process.env.CI ?? "") === "true";

export default defineConfig({
	testDir: "./tests/e2e",
	testMatch: /post-hallazgos-continuidad\.spec\.ts$/,
	workers: 1,
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
	],
	webServer: [
		{
			command: "node tests/e2e/post-hallazgos-mock-backend.mjs",
			url: "http://localhost:4000/api/health",
			reuseExistingServer: !isCI,
			timeout: 30_000,
			stdout: "pipe",
			stderr: "pipe",
		},
		{
			command: `cross-env NODE_ENV=test BACKEND_URL=http://localhost:4000 NEXT_PUBLIC_APP_URL=${baseUrl} npm run dev`,
			url: `${baseUrl}/login`,
			reuseExistingServer: !isCI,
			timeout: 180_000,
			stdout: "pipe",
			stderr: "pipe",
		},
	],
});
