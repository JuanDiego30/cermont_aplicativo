import path from "node:path";
import {
	type Finding,
	lineColumnAt,
	listTextFiles,
	readBaseline,
	readText,
	repoRoot,
	reportWithBaseline,
	toPosix,
} from "./shared";

const RULE_TERMS = [
	{ rule: "weak-token-a", text: "any" },
	{ rule: "weak-token-u", text: "unknown" },
	{ rule: "weak-token-n", text: "null" },
	{ rule: "weak-token-ud", text: "undefined" },
];

const SOURCE_ROOTS = [
	"backend/src",
	"backend/tests",
	"frontend/src",
	"frontend/tests",
	"packages/shared-types/src",
	"packages/shared-types/tests",
	"tooling",
	"scripts",
];

const SKIPPED_FILES = new Set([
	"tooling/quality/baseline.json",
	"tooling/quality/check-zero-rules.ts",
]);

const IDENTIFIER_CHARACTERS = "A-Za-z0-9_";

const findings: Finding[] = [];

for (const filePath of listTextFiles(SOURCE_ROOTS)) {
	const relative = toPosix(path.relative(repoRoot(), filePath));
	if (SKIPPED_FILES.has(relative)) {
		continue;
	}

	const text = readText(filePath);
	for (const term of RULE_TERMS) {
		const pattern = new RegExp(
			`(^|[^${IDENTIFIER_CHARACTERS}])(${term.text})(?=[^${IDENTIFIER_CHARACTERS}]|$)`,
			"gi",
		);
		for (const match of text.matchAll(pattern)) {
			const index = match.index + match[1].length;
			const location = lineColumnAt(text, index);
			findings.push({
				rule: term.rule,
				file: relative,
				line: location.line,
				column: location.column,
				message: `Forbidden weak token "${term.text}"`,
			});
		}
	}
}

reportWithBaseline(
	"Weak token quality check",
	findings,
	readBaseline("tooling/quality/baseline.json"),
);
