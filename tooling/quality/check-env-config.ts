/**
 * Environment Configuration Verification
 *
 * Validates that environment configurations are consistent.
 * - .env.example (local dev) must NOT contain http://backend:4000
 * - Source code must use BACKEND_URL env var, not hardcoded service names
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
	"Must NOT reference 'http://backend:4000' (production hostname). This file documents local development.",
);

// 2. next.config.ts must use BACKEND_URL as SSOT, not NODE_ENV-based fallback
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

// 3. Proxy route must not have NODE_ENV-dependent fallback
checkFile(
	"frontend/src/app/api/backend/[...path]/route.ts",
	(content) => {
		const hasHardcodedProdHost = /isProduction.*backend:4000/.test(content);
		const hasEnvFallback = content.includes("env.BACKEND_URL");
		return !hasHardcodedProdHost && hasEnvFallback;
	},
	"Must NOT hardcode 'http://backend:4000' based on isProduction(). Must read BACKEND_URL from env.",
);

// 4. Backend .env.example should use PORT=4000 (matching frontend proxy default)
checkFile(
	"backend/.env.example",
	(content) => content.includes("PORT=4000"),
	"Should use PORT=4000 to match frontend proxy default.",
);

// 5. frontend/.env.example should have BACKEND_URL for local dev
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
