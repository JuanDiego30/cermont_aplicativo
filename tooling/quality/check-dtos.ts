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

const DTO_PATTERN =
	/\b(?:interface|type)\s+([A-Z][A-Za-z0-9]*(?:Response|Data|Dto|DTO|Payload|Result))\b/g;
const findings: Finding[] = [];

for (const filePath of listTextFiles(["frontend/src", "backend/src"])) {
	const relative = toPosix(path.relative(repoRoot(), filePath));
	const text = readText(filePath);
	for (const match of text.matchAll(DTO_PATTERN)) {
		const name = match[1];
		const location = lineColumnAt(text, match.index);
		findings.push({
			rule: "local-api-dto",
			file: relative,
			line: location.line,
			column: location.column,
			message: `Local API DTO "${name}" should live in shared-types`,
		});
	}
}

reportWithBaseline(
	"Local DTO quality check",
	findings,
	readBaseline("tooling/quality/baseline.json"),
);
