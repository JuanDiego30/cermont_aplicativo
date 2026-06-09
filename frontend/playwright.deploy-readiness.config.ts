import { defineConfig, devices } from "@playwright/test";

/**
 * Configuración ligera para la prueba deploy-readiness.
 * Sin globalSetup ni webServer — asume backend y frontend YA corriendo.
 */
const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default defineConfig({
	testDir: "./tests/e2e",
	testMatch: /deploy-readiness\.spec\.ts$/,
	workers: 1,
	timeout: 120_000,
	expect: { timeout: 15_000 },
	retries: 0,
	reporter: [
		["html", { open: "never" }],
		["list"],
		["json", { outputFile: "test-results/deploy-readiness-result.json" }],
	],

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
});
