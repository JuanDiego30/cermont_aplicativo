import path from "node:path";
import { type Finding, lineColumnAt, listTextFiles, readText, repoRoot, toPosix } from "./shared";

const SOURCE_ROOTS = [
	"backend/src",
	"backend/tests",
	"frontend/src",
	"frontend/tests",
	"packages/shared-types/src",
	"packages/shared-types/tests",
	"tooling",
];
const LINT_DISABLE_MARKER = "eslint" + "-disable";
const IDE_INSPECTION_MARKER = "no" + "inspection";

const findings: Finding[] = [];

for (const filePath of listTextFiles(SOURCE_ROOTS)) {
	const relative = toPosix(path.relative(repoRoot(), filePath));
	if (relative === "tooling/quality/check-lint-residue.ts") {
		continue;
	}

	const text = readText(filePath);
	pushMarkerFindings(relative, text, LINT_DISABLE_MARKER, "lint-disable-residue");
	pushMarkerFindings(relative, text, IDE_INSPECTION_MARKER, "ide-inspection-residue");
}

console.log(`Lint residue quality check: ${findings.length} findings`);

if (findings.length === 0) {
	process.exit(0);
}

for (const finding of findings.slice(0, 50)) {
	console.error(
		`${finding.file}:${finding.line}:${finding.column} ${finding.rule} ${finding.message}`,
	);
}

process.exit(1);

function pushMarkerFindings(file: string, text: string, marker: string, rule: string): void {
	let index = text.indexOf(marker);
	while (index !== -1) {
		const location = lineColumnAt(text, index);
		findings.push({
			rule,
			file,
			line: location.line,
			column: location.column,
			message: "Use typed code or a focused refactor instead of suppressing lint tooling.",
		});
		index = text.indexOf(marker, index + marker.length);
	}
}
