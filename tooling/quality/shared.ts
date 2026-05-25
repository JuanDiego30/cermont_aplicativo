import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export type Finding = {
	rule: string;
	file: string;
	line: number;
	column: number;
	message: string;
};

export type Baseline = Record<string, number>;

const TEXT_EXTENSIONS = new Set([
	".cjs",
	".css",
	".cts",
	".js",
	".json",
	".jsonc",
	".jsx",
	".md",
	".mjs",
	".mts",
	".ts",
	".tsx",
	".yml",
	".yaml",
]);

const SKIPPED_PARTS = new Set([
	".git",
	".next",
	".turbo",
	"coverage",
	"dist",
	"node_modules",
	"playwright-report",
	"test-results",
	"uploads",
]);

export function repoRoot(): string {
	return process.cwd();
}

export function toPosix(filePath: string): string {
	return filePath.split(path.sep).join("/");
}

export function readText(filePath: string): string {
	return readFileSync(filePath, "utf8");
}

export function listTextFiles(roots: string[]): string[] {
	const files: string[] = [];
	for (const root of roots) {
		walk(path.resolve(repoRoot(), root), files);
	}
	return files.sort();
}

function walk(directory: string, files: string[]): void {
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		if (SKIPPED_PARTS.has(entry.name)) {
			continue;
		}

		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			walk(fullPath, files);
			continue;
		}

		if (!entry.isFile() || !TEXT_EXTENSIONS.has(path.extname(entry.name))) {
			continue;
		}

		const stats = statSync(fullPath);
		if (stats.size > 1024 * 1024) {
			continue;
		}

		files.push(fullPath);
	}
}

export function lineColumnAt(text: string, index: number): { line: number; column: number } {
	let line = 1;
	let column = 1;
	for (let cursor = 0; cursor < index; cursor += 1) {
		if (text[cursor] === "\n") {
			line += 1;
			column = 1;
		} else {
			column += 1;
		}
	}
	return { line, column };
}

export function countByRule(findings: Finding[]): Baseline {
	const counts: Baseline = {};
	for (const finding of findings) {
		counts[finding.rule] = (counts[finding.rule] ?? 0) + 1;
	}
	return counts;
}

export function readBaseline(filePath: string): Baseline {
	const content = JSON.parse(readText(path.resolve(repoRoot(), filePath)));
	if (!isBaseline(content)) {
		throw new Error(`Invalid quality baseline: ${filePath}`);
	}
	return content;
}

function isBaseline(value: object): value is Baseline {
	return Object.values(value).every((entry) => typeof entry === "number");
}

export function reportWithBaseline(title: string, findings: Finding[], baseline: Baseline): void {
	const counts = countByRule(findings);
	const failures = Object.entries(counts).filter(([rule, count]) => count > (baseline[rule] ?? 0));

	console.log(`${title}: ${findings.length} findings`);
	for (const [rule, count] of Object.entries(counts).sort(([left], [right]) =>
		left.localeCompare(right),
	)) {
		const allowed = baseline[rule] ?? 0;
		const status = count <= allowed ? "within baseline" : "above baseline";
		console.log(`- ${rule}: ${count}/${allowed} ${status}`);
	}

	if (failures.length === 0) {
		return;
	}

	console.error(`\n${title} failed: new findings exceed the baseline.`);
	for (const finding of findings.slice(0, 50)) {
		console.error(
			`${finding.file}:${finding.line}:${finding.column} ${finding.rule} ${finding.message}`,
		);
	}
	process.exit(1);
}
