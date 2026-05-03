import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: "jsdom",
		include: ["tests/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
		setupFiles: ["./vitest.setup.ts"],
		env: {
			NODE_ENV: "test",
			BACKEND_URL: "http://127.0.0.1:5000",
			NEXT_PUBLIC_APP_NAME: "Cermont S.A.S.",
			NEXT_PUBLIC_APP_URL: "http://localhost:3000",
			REFRESH_TOKEN_SECRET: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
		},
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			include: ["src/**"],
			exclude: ["**/*.patch", "**/*.bak"],
			thresholds: {
				lines: 3,
				branches: 1,
				functions: 2,
				statements: 3,
			},

		},
		server: {
			deps: {
				inline: ["@testing-library/react", "@tanstack/react-query"],
			},
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
			"@/app": path.resolve(__dirname, "app"),
			"@/src": path.resolve(__dirname, "src"),
		},
	},
});
