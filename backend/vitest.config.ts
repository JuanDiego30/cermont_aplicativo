import path from "node:path";
import { defineConfig } from "vitest/config";

const src = path.resolve(__dirname, "./src");
const shared = path.resolve(__dirname, "./src/_shared");

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		setupFiles: ["./tests/setup.ts"],
		include: ["tests/**/*.test.ts", "tests/integration/**/*.test.ts"],
		fileParallelism: false,
		hookTimeout: 600000,
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: ["node_modules/", "tests/", "src/scripts/**", "src/**/*.d.ts"],
			thresholds: {
				lines: 25,
				functions: 20,
				branches: 15,
			},
		},
	},
	resolve: {
		alias: [
			// ── Old shared paths → new _shared paths ──────────────────────
			{
				find: /src\/middlewares\/authorize\.middleware$/,
				replacement: path.resolve(__dirname, "./src/_shared/middlewares/authorize.middleware"),
			},
			{
				find: /src\/middlewares\/uploadMiddleware$/,
				replacement: path.resolve(__dirname, "./src/_shared/middlewares/uploadMiddleware"),
			},
			{
				find: /src\/config\/kit-templates$/,
				replacement: path.resolve(__dirname, "./src/_shared/config/kit-templates"),
			},

			// src/common/* → src/_shared/common/* (directory was renamed)
			{ find: /src\/common\/(.*)$/, replacement: `${shared}/common/$1` },
			// src/middlewares/* → src/_shared/middlewares/*
			{ find: /src\/middlewares\/(.*)$/, replacement: `${shared}/middlewares/$1` },
			// src/config/* → src/_shared/config/*
			{ find: /src\/config\/(.*)$/, replacement: `${shared}/config/$1` },

			// @ alias
			{ find: /^@\/(.*)$/, replacement: `${src}/$1` },
		],
	},
});
