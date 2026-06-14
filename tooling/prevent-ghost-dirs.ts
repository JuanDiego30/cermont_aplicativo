#!/usr/bin/env node
/**
 * scripts/prevent-ghost-dirs.ts
 *
 * Prevents recreation of legacy directories that reaparece due to:
 * 1. Google Drive sync artifacts
 * 2. npm workspace misconfiguration
 * 3. Incorrect path references in scripts
 *
 * Run with: npm run ops:prevent:ghost-dirs
 * This should run as a post-install hook
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

// Directories that should NEVER exist at root
const FORBIDDEN_DIRS = [
	".tmp.drivedownload", // Google Drive sync
	".tmp.driveupload", // Google Drive sync
	".tmp.drive", // Google Drive sync pattern
];

// Files that should NEVER exist at root
const FORBIDDEN_FILES = ["nul", "cleanup.js", "delete_items.bat"];

console.log("🔒 Verificando y previniendo directorios fantasma...\n");

let removed = 0;

// Check directories
for (const dir of FORBIDDEN_DIRS) {
	// Handle patterns like .tmp.drive*
	if (dir.includes("*")) {
		const pattern = dir.replace("*", "");
		const contents = fs.readdirSync(ROOT);
		const matching = contents.filter(
			(item) => item.startsWith(pattern) && fs.statSync(path.join(ROOT, item)).isDirectory(),
		);

		for (const match of matching) {
			const fullPath = path.join(ROOT, match);
			try {
				fs.rmSync(fullPath, { recursive: true, force: true });
				console.log(`  🗑️  Eliminado (patrón): ${match}/`);
				removed++;
			} catch (err) {
				console.error(`  ⚠️  No se pudo eliminar ${match}: ${(err as Error).message}`);
			}
		}
	} else {
		const fullPath = path.join(ROOT, dir);
		if (fs.existsSync(fullPath)) {
			try {
				fs.rmSync(fullPath, { recursive: true, force: true });
				console.log(`  🗑️  Eliminado: ${dir}/`);
				removed++;
			} catch (err) {
				console.error(`  ⚠️  No se pudo eliminar ${dir}: ${(err as Error).message}`);
			}
		}
	}
}

// Check files
for (const file of FORBIDDEN_FILES) {
	const fullPath = path.join(ROOT, file);
	if (fs.existsSync(fullPath)) {
		try {
			fs.unlinkSync(fullPath);
			console.log(`  🗑️  Eliminado: ${file}`);
			removed++;
		} catch (err) {
			console.error(`  ⚠️  No se pudo eliminar ${file}: ${(err as Error).message}`);
		}
	}
}

// Verify critical configuration
console.log("\n📋 Verificando configuración de monorepo...\n");

// Check package.json workspaces
const pkgFile = path.join(ROOT, "package.json");
if (fs.existsSync(pkgFile)) {
	const pkg = JSON.parse(fs.readFileSync(pkgFile, "utf-8"));
	const workspaces = pkg.workspaces || [];
	const hasBadRef = workspaces.some(
		(w: string) =>
			w === "apps/backend" ||
			w === "apps/frontend" ||
			w === "'apps/backend'" ||
			w === "'apps/frontend'",
	);
	if (hasBadRef) {
		console.warn(
			"  ⚠️  package.json workspaces contiene referencias a /apps/backend o /apps/frontend!",
		);
		console.warn("     Esto causará que las carpetas fantasma se recreen.");
	} else {
		console.log("  ✅ package.json workspaces correctamente configurado");
	}
}

// Check turbo.json
const turboFile = path.join(ROOT, "turbo.json");
if (fs.existsSync(turboFile)) {
	const turboConfig = JSON.parse(fs.readFileSync(turboFile, "utf-8"));
	const tasks = turboConfig.tasks || {};

	let hasInvalidOutputs = false;
	for (const [taskName, task] of Object.entries(tasks)) {
		const outputs = Array.isArray(task?.outputs) ? task.outputs : [];
		for (const output of outputs) {
			if (typeof output === "string" && output.includes("apps/")) {
				console.warn(`  ⚠️  Task "${taskName}" tiene output inválido: ${output}`);
				hasInvalidOutputs = true;
			}
		}
	}

	if (!hasInvalidOutputs) {
		console.log("  ✅ turbo.json correctamente configurado");
	}
}

if (removed > 0) {
	console.log(`\n✨ ${removed} items limpiados exitosamente`);
} else {
	console.log("\n✅ No se encontraron directorios fantasma. Monorepo limpio!");
}

console.log("\n💡 Si estas carpetas reaparecen continuamente:");
console.log("   1. Pausa Google Drive Sync o saca este proyecto de Drive");
console.log("   2. Ejecuta: npm run clean");
console.log("   3. Ejecuta: rm -rf node_modules && npm install");
