import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const ROOTS = [
	"backend/src", "backend/tests",
	"frontend/src", "frontend/tests",
	"packages/shared-types/src", "packages/shared-types/tests",
	"packages/domain/src",
	"tooling", "scripts",
];

const SKIP = new Set([".git", ".next", ".turbo", "coverage", "dist", "node_modules", "playwright-report", "test-results", "uploads"]);
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".css", ".md", ".yml", ".yaml", ".cjs", ".mjs", ".mts", ".cts"]);

function walk(dir: string, files: string[]) {
	for (const e of readdirSync(dir, { withFileTypes: true })) {
		if (SKIP.has(e.name)) continue;
		const p = path.join(dir, e.name);
		if (e.isDirectory()) walk(p, files);
		else if (e.isFile() && EXTS.has(path.extname(e.name)) && statSync(p).size <= 1048576) files.push(p);
	}
}

const TERMS = ["administrativo", "arnes", "cargando", "configuracion", "costos", "ejecucion", "evidencia", "evidencias", "mantenimiento", "observaciones", "orden", "propuesta", "validacion"];

function stripAccents(s: string) { return s.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

const counts: Record<string, Array<{ file: string; line: number; snippet: string; category: string }>> = {};
for (const t of TERMS) counts[t] = [];

const files: string[] = [];
for (const r of ROOTS) walk(path.resolve(r), files);

for (const f of files) {
	const rel = path.relative(process.cwd(), f).replace(/\\/g, "/");
	if (rel === "tooling/quality/baseline.json" || rel === "tooling/quality/analyze-language.ts") continue;
	const content = readFileSync(f, "utf8");
	const lower = stripAccents(content.toLowerCase());
	for (const term of TERMS) {
		const re = new RegExp("\\b" + term + "\\b", "g");
		let m: RegExpExecArray | null;
		while ((m = re.exec(lower)) !== null) {
			const lineNum = content.slice(0, m.index).split("\n").length;
			const lineStart = content.lastIndexOf("\n", m.index) + 1;
			const lineEnd = content.indexOf("\n", m.index);
			const snippet = content.slice(lineStart, lineEnd !== -1 ? lineEnd : content.length).trim().slice(0, 100);
			let category = "unknown";
			if (snippet.startsWith("//") || snippet.startsWith("/*") || snippet.startsWith("*")) category = "comment";
			else if (snippet.includes("mongoose.model(") || snippet.includes("mongoose.model<") || snippet.includes('"Orden') || snippet.includes("'Orden") || snippet.includes("collection:")) category = "model_name";
			else if (snippet.includes('"gerente"') || snippet.includes("'gerente'") || snippet.includes("authorize(") || snippet.includes("userRole")) category = "role_check";
			else if (snippet.includes("import ") || snippet.includes("from ")) category = "import";
			else if (snippet.includes(".routes.") || snippet.includes("router.") || snippet.includes("app.")) category = "route";
			else if (snippet.includes("enum ") || snippet.includes("type ") || snippet.includes("interface ")) category = "type_def";
			else if (snippet.includes("Model.") || snippet.includes("model(") || snippet.includes("Schema(")) category = "schema_field";
			else if (snippet.match(/['"][a-z_]+['":,}]/)) category = "string_literal";
			else category = "other";
			counts[term].push({ file: rel, line: lineNum, snippet, category });
		}
	}
}

console.log("=== SPANISH TOKEN ANALYSIS ===\n");

let total = 0;
const byCategory: Record<string, number> = {};
for (const term of TERMS) {
	const items = counts[term];
	total += items.length;
	console.log(`\n--- ${term}: ${items.length} ---`);
	const byFile: Record<string, number> = {};
	for (const f of items) {
		byFile[f.file] = (byFile[f.file] ?? 0) + 1;
		if (f.category === "string_literal" || f.category === "comment" || f.category === "other") {
			console.log(`  ${f.file}:${f.line} ${f.snippet}`);
		}
		byCategory[f.category] = (byCategory[f.category] ?? 0) + 1;
	}
}

console.log(`\n\n=== TOTAL: ${total} ===`);
console.log("\n=== BY CATEGORY ===");
for (const [cat, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
	console.log(`  ${cat}: ${count}`);
}
