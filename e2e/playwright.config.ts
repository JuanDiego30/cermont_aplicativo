import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests",
	fullyParallel: false,
	retries: 1,
	workers: 1,
	reporter: [["html", { outputFolder: ".sisyphus/evidence/e2e-reports", open: "never" }]],
	use: {
		baseURL: process.env.FRONTEND_URL || "http://localhost:3000",
		trace: "on-first-retry",
		screenshot: "only-on-failure",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	webServer: [
		{
			command: "npm run dev",
			cwd: "backend",
			port: 3001,
			reuseExistingServer: true,
		},
		{
			command: "npm run dev",
			cwd: "frontend",
			port: 3000,
			reuseExistingServer: true,
		},
	],
});
