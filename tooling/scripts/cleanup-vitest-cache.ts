#!/usr/bin/env node
/**
 * tooling/scripts/cleanup-vitest-cache.ts
 *
 * Cross-platform vitest cache cleanup script.
 * Replaces Windows-only force-cleanup-vitest.ps1 for broader compatibility.
 *
 * Usage: node tooling/scripts/cleanup-vitest-cache.ts
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PROJECT_ROOT = path.join(ROOT, "apps/frontend");

// Vitest cache location (varies by OS)
const VITEST_CACHE_PATHS = [
	// Linux/Mac
	path.join(ROOT, "node_modules", ".vitest"),
	// Windows
	path.join(ROOT, "node_modules", ".cache", "vitest"),
	// Alternative location
	path.join(PROJECT_ROOT, "node_modules", ".vitest"),
];

/**
 * Force delete directory with error handling
 */
function forceDelete(dirPath: string): boolean {
	try {
		if (!fs.existsSync(dirPath)) {
			console.log(`✓ Directory does not exist (already cleaned): ${dirPath}`);
			return false;
		}

		console.log(`🗑️  Deleting vitest cache: ${dirPath}`);

		// Windows: Handle locked files gracefully
		if (process.platform === "win32") {
			const { execSync } = await import('node:child_process');
			try {
				execSync(`rmdir /s /q "${dirPath}"`, { stdio: "inherit" });
				console.log("✓ Windows cleanup successful");
				return true;
			} catch (_err) {
				console.log("⚠️  Windows rmdir failed, trying Node.js method...");
			}
		}

		// Fallback: Node.js recursive delete (cross-platform)
		fs.rmSync(dirPath, { recursive: true, force: true, maxRetries: 3 });
		console.log("✓ Successfully deleted vitest cache");
		return true;
	} catch (error) {
		console.error(`✗ Failed to delete: ${error}`);
		console.log("\n💡 Try manually:");
		console.log("1. Close all VS Code windows and terminal sessions");
		console.log("2. Stop any running Node.js processes:");
		console.log(
			'   - Windows: Get-Process | Where-Object { $_.ProcessName -match "node|Code" } | Stop-Process -Force',
		);
		console.log("   - Linux/Mac: pkill -f node");
		console.log("3. Re-run this script\n");
		return false;
	}
}

async function main() {
	console.log("🧹 Vitest Cache Cleanup (Cross-Platform)\n");

	let deleted = false;

	for (const cachePath of VITEST_CACHE_PATHS) {
		if (forceDelete(cachePath)) {
			deleted = true;
		}
	}

	if (!deleted) {
		console.log("\n✓ No vitest cache directories found (already clean)");
	}

	console.log("\n💡 Now run: npm install");
	console.log("   This will rebuild the cache cleanly.");
}

// Run
main().catch((error) => {
	console.error("Fatal error:", error);
	process.exit(1);
});
