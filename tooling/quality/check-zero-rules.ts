import path from "node:path";
import { type Finding, lineColumnAt, listTextFiles, readText, repoRoot, toPosix } from "./shared";

const TYPE_ANY_PATTERN =
	/(?::\s*any\b|as\s+any\b|<\s*any\s*>|\b(?:Array|Promise|Record|Map|Set)<[^>\n]*\bany\b[^>\n]*>)/g;
const API_NULL_PATTERN = /\bres\.json\s*\([^;\n]*\bnull\b/g;
const SOURCE_ROOTS = ["backend/src", "frontend/src", "packages/shared-types/src"];

function stripComments(text: string): string {
	return text
		.replace(/\/\*[\s\S]*?\*\//g, (match) => " ".repeat(match.length))
		.replace(/\/\/.*$/gm, (match) => " ".repeat(match.length));
}

function pushMatches(args: {
	findings: Finding[];
	filePath: string;
	text: string;
	pattern: RegExp;
	rule: string;
	message: string;
}): void {
	for (const match of args.text.matchAll(args.pattern)) {
		const location = lineColumnAt(args.text, match.index);
		args.findings.push({
			rule: args.rule,
			file: toPosix(path.relative(repoRoot(), args.filePath)),
			line: location.line,
			column: location.column,
			message: args.message,
		});
	}
}

const findings: Finding[] = [];

for (const filePath of listTextFiles(SOURCE_ROOTS)) {
	const relative = toPosix(path.relative(repoRoot(), filePath));
	if (/\.(test|spec)\.[tj]sx?$/.test(relative) || relative.endsWith(".d.ts")) {
		continue;
	}

	const text = readText(filePath);
	const uncommented = stripComments(text);
	pushMatches({
		findings,
		filePath,
		text: uncommented,
		pattern: TYPE_ANY_PATTERN,
		rule: "zero-any-production",
		message: "Production TypeScript must not use explicit any.",
	});
	pushMatches({
		findings,
		filePath,
		text: uncommented,
		pattern: API_NULL_PATTERN,
		rule: "zero-null-api-response",
		message: "API responses must omit optional fields instead of serializing null.",
	});
}

console.log(`Zero rules quality check: ${findings.length} findings`);

if (findings.length === 0) {
	process.exit(0);
}

for (const finding of findings.slice(0, 50)) {
	console.error(
		`${finding.file}:${finding.line}:${finding.column} ${finding.rule} ${finding.message}`,
	);
}

process.exit(1);
