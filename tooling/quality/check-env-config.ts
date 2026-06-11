/**
 * Environment Configuration Verification
 *
 * Validates that environment configurations don't mix local and Docker settings.
 * - .env.example (local dev) must NOT contain http://backend:4000
 * - .env.docker.example CAN contain http://backend:4000
 * - Source code must not force http://backend:4000 based on NODE_ENV alone
 * - docker-compose.yml must explicitly inject BACKEND_URL=http://backend:4000
 */

import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
let exitCode = 0;

function checkFile(
	relativePath: string,
	predicate: (content: string) => boolean,
	message: string,
): void {
	const filePath = path.resolve(repoRoot, relativePath);
	try {
		const content = readFileSync(filePath, "utf8");
		if (!predicate(content)) {
			console.error(`❌ ${relativePath}: ${message}`);
			exitCode = 1;
		} else {
			console.log(`✅ ${relativePath}: OK`);
		}
	} catch {
		console.error(`❌ ${relativePath}: File not found or unreadable`);
		exitCode = 1;
	}
}

console.log("\n🔍 Environment Configuration Verification\n");

// 1. .env.example must NOT contain http://backend:4000 (it's for local dev)
checkFile(
	".env.example",
	(content) => !content.includes("http://backend:4000"),
	"Must NOT reference 'http://backend:4000' (Docker hostname). This file documents local development.",
);

// 2. .env.docker.example SHOULD contain http://backend:4000 (it's for Docker)
checkFile(
	".env.docker.example",
	(content) => content.includes("http://backend:4000") || content.includes("mongodb://"),
	"Should reference Docker-internal hostnames (backend:4000, mongodb).",
);

// 3. next.config.ts must use BACKEND_URL as SSOT, not NODE_ENV-based fallback
checkFile(
	"frontend/next.config.ts",
	(content) => {
		// Allow localhost:4000 fallback but reject isProduction-based logic
		const hasHardcodedProdHost = /isProduction.*backend:4000/.test(content);
		const hasEnvOverride = content.includes("env.BACKEND_URL");
		return !hasHardcodedProdHost && hasEnvOverride;
	},
	"Must NOT hardcode 'http://backend:4000' based on isProduction(). Must read BACKEND_URL from env.",
);

// 4. Proxy route must not have NODE_ENV-dependent fallback
checkFile(
	"frontend/src/app/api/backend/[...path]/route.ts",
	(content) => {
		const hasHardcodedProdHost = /isProduction.*backend:4000/.test(content);
		const hasEnvFallback = content.includes("env.BACKEND_URL");
		return !hasHardcodedProdHost && hasEnvFallback;
	},
	"Must NOT hardcode 'http://backend:4000' based on isProduction(). Must read BACKEND_URL from env.",
);

// 5. docker-compose.yml must inject BACKEND_URL for the frontend service
checkFile(
	"docker-compose.yml",
	(content) => {
		const hasFrontendBackendUrl =
			/frontend:/.test(content) && /BACKEND_URL.*backend:4000/.test(content);
		return hasFrontendBackendUrl;
	},
	"Frontend service must have 'BACKEND_URL: http://backend:4000' environment variable.",
);

// 6. Backend .env.example should use PORT=4000 (matching docker-compose and frontend proxy)
checkFile(
	"backend/.env.example",
	(content) => content.includes("PORT=4000"),
	"Should use PORT=4000 to match docker-compose.yml and frontend proxy default.",
);

// 7. frontend/.env.example should have BACKEND_URL=http://127.0.0.1:4000 for local dev
checkFile(
	"frontend/.env.example",
	(content) => content.includes("BACKEND_URL="),
	"Should document BACKEND_URL for local development.",
);

console.log();

if (exitCode === 0) {
	console.log("✅ All environment configuration checks passed.\n");
} else {
	console.error("❌ Some environment configuration checks failed. See errors above.\n");
	process.exit(1);
}
