import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["tests/**/*.test.ts"],
		exclude: ["tests/contracts/regen-snapshot.test.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: ["src/**"],
			exclude: ["node_modules/", "tests/", "src/**/*.d.ts"],
		},
	},
});
