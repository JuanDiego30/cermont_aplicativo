/**
 * Hardcoded Roles Checker
 *
 * Fails if any route, controller, or frontend file contains hardcoded
 * role strings in patterns like:
 *   - authorize("gerente")
 *   - roles: ["gerente"]
 *   - allowedRoles: ["gerente"]
 *
 * Exemptions:
 *   - packages/domain/* (SSOT)
 *   - packages/shared-types/* (contract definitions)
 *   - tests (test data)
 *
 * Usage: tsx tooling/quality/check-hardcoded-roles.ts
 */

import path from "node:path";
import type { Finding } from "./shared";
import { lineColumnAt, readText, repoRoot, toPosix } from "./shared";

const ALLOWED_PATHS = ["packages/domain", "packages/shared-types", "packages/config"];

const SKIPPED_PARTS = [
	"node_modules",
	"dist",
	".next",
	".turbo",
	"coverage",
	"playwright-report",
	"test-results",
];

const AUTHORIZE_PATTERN =
	/authorize\(\s*"(gerente|residente|hes|supervisor|operador|tecnico|administrativo|cliente|coord_administrativo|auxiliar_contable|auxiliar_hes|supervisor_electricista|tecnico_electricista|oficial_construccion|pasante)"/g;

const ROLES_ARRAY_PATTERN =
	/(?:roles|allowedRoles)\s*:\s*\[\s*"(gerente|residente|hes|supervisor|operador|tecnico|administrativo|cliente|coord_administrativo|auxiliar_contable|auxiliar_hes|supervisor_electricista|tecnico_electricista|oficial_construccion|pasante)"/g;

function isAllowed(fileRelative: string): boolean {
	return ALLOWED_PATHS.some((prefix) => fileRelative.startsWith(prefix));
}

function findHardcodedRoles(filePath: string): Finding[] {
	const relative = toPosix(path.relative(repoRoot(), filePath));

	if (isAllowed(relative)) {
		return [];
	}

	if (SKIPPED_PARTS.some((part) => relative.includes(part))) {
		return [];
	}

	const ext = path.extname(filePath);
	if (![".ts", ".tsx", ".js", ".jsx"].includes(ext)) {
		return [];
	}

	const text = readText(filePath);
	const findings: Finding[] = [];

	// Check authorize("role") pattern
	for (const match of text.matchAll(AUTHORIZE_PATTERN)) {
		const location = lineColumnAt(text, match.index);
		findings.push({
			rule: "hardcoded-authorize-role",
			file: relative,
			line: location.line,
			column: location.column,
			message: `Hardcoded role "${match[1]}" in authorize() call. Use CERMONT_ROLES.${match[1].toUpperCase()} instead`,
		});
	}

	// Check roles/allowedRoles array pattern
	for (const match of text.matchAll(ROLES_ARRAY_PATTERN)) {
		const location = lineColumnAt(text, match.index);
		findings.push({
			rule: "hardcoded-roles-array",
			file: relative,
			line: location.line,
			column: location.column,
			message: `Hardcoded role "${match[1]}" in roles list. Use domain constants instead`,
		});
	}

	return findings;
}

function walkDirectory(dir: string, findings: Finding[]): void {
	const entries = readFileSystem(dir);
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			if (!SKIPPED_PARTS.includes(entry.name)) {
				walkDirectory(fullPath, findings);
			}
		} else if (entry.isFile()) {
			findings.push(...findHardcodedRoles(fullPath));
		}
	}
}

interface DirEntry {
	name: string;
	isDirectory(): boolean;
	isFile(): boolean;
}

function readFileSystem(dir: string): DirEntry[] {
	// Minimal filesystem reader compatible with tsx
	const fs = require("node:fs");
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	return entries.map((e: { name: string; isDirectory: () => boolean; isFile: () => boolean }) => ({
		name: e.name,
		isDirectory: e.isDirectory.bind(e),
		isFile: e.isFile.bind(e),
	}));
}

function main(): void {
	const findings: Finding[] = [];
	const root = repoRoot();

	for (const scanDir of ["backend/src", "frontend/src"]) {
		const fullPath = path.join(root, scanDir);
		try {
			walkDirectory(fullPath, findings);
		} catch {
			// Directory might not exist
		}
	}

	if (findings.length === 0) {
		console.log("Hardcoded roles checker: 0 violations found ✅");
		process.exit(0);
	}

	console.error(`Hardcoded roles checker: ${findings.length} violation(s) found ❌`);
	for (const f of findings) {
		console.error(`  ${f.file}:${f.line}:${f.column} ${f.rule} - ${f.message}`);
	}
	process.exit(1);
}

main();
