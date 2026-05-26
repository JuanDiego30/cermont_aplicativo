#!/usr/bin/env node
/**
 * scripts/cleanup-repo.ts
 *
 * Automated repository cleanup based on the CERMONT audit.
 * Run with: npm run ops:cleanup:repo
 *
 * Phase 1: Delete obsolete directories and files
 * Phase 2: Reorganise loose files in docs/ into subdirectories
 * Phase 3: Ensure .gitkeep in required directories
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

// ── Phase 1: Delete obsolete items ──────────────────────────────────

const DIRS_TO_REMOVE = ["scripts/legacy-fixes", ".tmp.drivedownload", ".tmp.driveupload"];

const FILES_TO_REMOVE = ["nul", "cleanup.js", "delete_items.bat"];

console.log("🧹 Fase 1: Eliminando archivos y carpetas obsoletas...\n");

for (const dir of DIRS_TO_REMOVE) {
	const fullPath = path.join(ROOT, dir);
	if (fs.existsSync(fullPath)) {
		fs.rmSync(fullPath, { recursive: true, force: true });
		console.log(`  ✅ Eliminado: ${dir}/`);
	}
}

for (const file of FILES_TO_REMOVE) {
	const fullPath = path.join(ROOT, file);
	if (fs.existsSync(fullPath)) {
		fs.unlinkSync(fullPath);
		console.log(`  ✅ Eliminado: ${file}`);
	}
}

// ── Phase 2: Organise docs/ ─────────────────────────────────────────

console.log("\n📁 Fase 2: Reorganizando docs/...\n");

// Directories to ensure exist
const docsDirs = [
	"docs/01-architecture",
	"docs/02-deployment",
	"docs/03-development",
	"docs/audit",
	"docs/archive",
];

for (const dir of docsDirs) {
	const fullPath = path.join(ROOT, dir);
	if (!fs.existsSync(fullPath)) {
		fs.mkdirSync(fullPath, { recursive: true });
	}
}

// Move loose docs/ root files into categorised subdirectories
const MOVES: Array<{ from: string; to: string }> = [
	// Architecture
	{ from: "docs/ARCHITECTURE.md", to: "docs/01-architecture/ARCHITECTURE.md" },
	{ from: "docs/STRUCTURE.md", to: "docs/01-architecture/STRUCTURE.md" },
	// Deployment
	{ from: "docs/DEPLOYMENT.md", to: "docs/02-deployment/DEPLOYMENT.md" },
	// Testing / Development
	{ from: "docs/E2E_TESTING.md", to: "docs/03-development/E2E_TESTING.md" },
	// Audit
	{ from: "docs/CRITICAL_FINDINGS_SUMMARY.md", to: "docs/audit/CRITICAL_FINDINGS_SUMMARY.md" },
	{
		from: "docs/RESOLUTION_REPORT_2026_03_05.md",
		to: "docs/audit/RESOLUTION_REPORT_2026_03_05.md",
	},
	// Archive (status reports, completion summaries)
	{ from: "docs/STATUS_FINAL_ACTUALIZADO.md", to: "docs/archive/STATUS_FINAL_ACTUALIZADO.md" },
	{ from: "docs/STATUS_FINAL.txt", to: "docs/archive/STATUS_FINAL.txt" },
	{ from: "docs/RESUMEN_FINAL_EJECUCION.md", to: "docs/archive/RESUMEN_FINAL_EJECUCION.md" },
	{
		from: "docs/resumen_documentacion_completa.md",
		to: "docs/archive/resumen_documentacion_completa.md",
	},
	{ from: "docs/PROJECT_COMPLETION_SUMMARY.md", to: "docs/archive/PROJECT_COMPLETION_SUMMARY.md" },
	{ from: "docs/PHASE_3_4_COMPLETION.md", to: "docs/archive/PHASE_3_4_COMPLETION.md" },
	{ from: "docs/EXECUTIVE_SUMMARY_FINAL.md", to: "docs/archive/EXECUTIVE_SUMMARY_FINAL.md" },
	{ from: "docs/DELIVERABLES_INVENTORY.md", to: "docs/archive/DELIVERABLES_INVENTORY.md" },
	// Implementation plans
	{
		from: "docs/PLAN_IMPLEMENTACION_MAESTRO.md",
		to: "docs/archive/PLAN_IMPLEMENTACION_MAESTRO.md",
	},
	{ from: "docs/REMEDIATION_PLAN.md", to: "docs/archive/REMEDIATION_PLAN.md" },
	{ from: "docs/IMPLEMENTACION_EN_PROGRESO.md", to: "docs/archive/IMPLEMENTACION_EN_PROGRESO.md" },
];

for (const { from, to } of MOVES) {
	const src = path.join(ROOT, from);
	const dest = path.join(ROOT, to);
	if (fs.existsSync(src)) {
		// Don't overwrite existing files in destination
		if (fs.existsSync(dest)) {
			console.log(`  ⏭️  Destino ya existe, omitiendo: ${to}`);
			continue;
		}
		fs.renameSync(src, dest);
		console.log(`  ✅ ${from} → ${to}`);
	}
}

// ── Phase 3: Ensure .gitkeep in required directories ────────────────

console.log("\n📌 Fase 3: Verificando .gitkeep...\n");

const GITKEEP_DIRS = ["uploads", "public/icons"];

for (const dir of GITKEEP_DIRS) {
	const dirPath = path.join(ROOT, dir);
	const keepPath = path.join(dirPath, ".gitkeep");
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
	if (!fs.existsSync(keepPath)) {
		fs.writeFileSync(keepPath, "");
		console.log(`  ✅ .gitkeep creado en: ${dir}`);
	}
}

console.log("\n✨ Limpieza completada!");
