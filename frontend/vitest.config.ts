import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: "jsdom",
		include: ["tests/**/*.test.{ts,tsx}", "lib/**/*.test.{ts,tsx}"],
		setupFiles: ["./vitest.setup.ts"],
		env: {
			AUTH_SECRET: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
			NODE_ENV: "test",
			NEXT_PUBLIC_API_URL: "http://localhost:3000/api/proxy",
			NEXT_PUBLIC_APP_NAME: "Cermont S.A.S.",
			NEXT_PUBLIC_APP_URL: "http://localhost:3000",
		},
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			include: ["lib/**", "app/api/**"],
			exclude: ["**/*.patch"],
			thresholds: {
				lines: 40,
				branches: 30,
				functions: 35,
				statements: 40,
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
			"@/modules": path.resolve(__dirname, "src/modules"),
			"@/lib": path.resolve(__dirname, "src/lib"),
			"@/app": path.resolve(__dirname, "app"),
			"@/src": path.resolve(__dirname, "src"),
		},
	},
});
