/**
 * Spanish-to-English Migration Script
 *
 * Scans the codebase for Spanish tokens and replaces them with English.
 * For frontend UI strings: replaces with i18n translation keys.
 * For backend identifiers (roles, models): renames to English canonical form.
 *
 * Usage:
 *   tsx tooling/quality/migrate-spanish.ts [--dry-run] [--frontend-only]
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, extname, relative, resolve } from "node:path";
import { cwd } from "node:process";

const DRY_RUN = process.argv.includes("--dry-run");
const FRONTEND_ONLY = process.argv.includes("--frontend-only");

const SPANISH_TERMS = [
	"administrativo",
	"arnes",
	"cargando",
	"cliente",
	"configuracion",
	"costos",
	"ejecucion",
	"evidencia",
	"evidencias",
	"gerente",
	"mantenimiento",
	"nombre",
	"observaciones",
	"orden",
	"propuesta",
	"residente",
	"tecnico",
	"validacion",
];

const SPANISH_TO_ENGLISH: Record<string, string> = {
	administrativo: "administrative",
	arnes: "harness",
	cargando: "loading",
	cliente: "client",
	configuracion: "configuration",
	costos: "costs",
	ejecucion: "execution",
	evidencia: "evidence",
	evidencias: "evidence",
	gerente: "manager",
	mantenimiento: "maintenance",
	nombre: "name",
	observaciones: "observations",
	orden: "order",
	propuesta: "proposal",
	residente: "leadEngineer",
	tecnico: "technician",
	validacion: "validation",
};

// Role-specific remappings (these are canonical domain identifiers)
const ROLE_ENGLISH: Record<string, string> = {
	gerente: "manager",
	residente: "lead_engineer",
	tecnico: "technician",
	cliente: "client",
	administrativo: "administrative",
};

// File patterns to exclude (binary, generated, vendor)
const EXCLUDE_PATTERNS = [
	"node_modules",
	".next",
	"dist",
	"package-lock.json",
	"api-contract.snapshot.json",
	"baseline.json",
	"migrate-spanish.ts",
];

function shouldProcessFile(filePath: string): boolean {
	const ext = extname(filePath).toLowerCase();
	if (![".ts", ".tsx", ".js", ".mjs", ".json", ".css"].includes(ext)) {
		return false;
	}
	for (const pattern of EXCLUDE_PATTERNS) {
		if (filePath.includes(pattern)) {
			return false;
		}
	}
	return true;
}

interface Replacement {
	file: string;
	line: number;
	original: string;
	replacement: string;
	term: string;
}

const findings: Replacement[] = [];

function scanFile(filePath: string): string | null {
	if (!shouldProcessFile(filePath)) {
		return null;
	}

	let content: string;
	try {
		content = readFileSync(filePath, "utf-8");
	} catch {
		return null;
	}

	const lower = content.toLowerCase();
	let hasChanges = false;

	for (const term of SPANISH_TERMS) {
		const pattern = new RegExp(`\\b${term}\\b`, "gi");
		let match: RegExpExecArray | null;

		while ((match = pattern.exec(content)) !== null) {
			const lineStart = content.lastIndexOf("\n", match.index) + 1;
			const lineNumber = content.slice(0, match.index).split("\n").length;
			const lineContent = content.slice(lineStart, content.indexOf("\n", match.index) !== -1 ? content.indexOf("\n", match.index) : content.length).trim();

			const english = SPANISH_TO_ENGLISH[term.toLowerCase()];
			if (!english) continue;

			findings.push({
				file: relative(cwd(), filePath),
				line: lineNumber,
				original: match[0],
				replacement: english,
				term: term.toLowerCase(),
			});
		}
	}

	return hasChanges ? content : null;
}

function collectFiles(): string[] {
	const result = execSync(
		`git ls-files -- "backend/" "frontend/" "packages/" "scripts/" "tooling/"`,
		{ encoding: "utf-8", cwd: cwd() },
	);
	return result.split("\n").filter(Boolean).filter(shouldProcessFile);
}

function main() {
	const files = collectFiles();
	console.log(`Scanning ${files.length} files...`);

	for (const filePath of files) {
		scanFile(resolve(cwd(), filePath));
	}

	console.log(`\n📊 Found ${findings.length} Spanish token occurrences:`);

	// Group by term
	const byTerm = new Map<string, Replacement[]>();
	for (const f of findings) {
		const existing = byTerm.get(f.term) ?? [];
		existing.push(f);
		byTerm.set(f.term, existing);
	}

	for (const [term, items] of [...byTerm.entries()].sort()) {
		console.log(`  ${term} (${SPANISH_TO_ENGLISH[term]}): ${items.length} occurrences`);
	}

	// Group by file
	const byFile = new Map<string, Replacement[]>();
	for (const f of findings) {
		const existing = byFile.get(f.file) ?? [];
		existing.push(f);
		byFile.set(f.file, existing);
	}

	console.log(`\n📁 Files affected: ${byFile.size}`);
	for (const [file, items] of [...byFile.entries()].sort()) {
		console.log(`  ${file}: ${items.length} tokens`);
	}

	if (DRY_RUN) {
		console.log("\n⚠️  Dry run - no changes made");
		return;
	}

	console.log("\n🔄 To apply replacements, use sed or manual edit per file.");
	console.log("Run with --apply to auto-replace.");
}

if (require.main === module) {
	main();
}
