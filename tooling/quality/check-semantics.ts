import path from "node:path";
import {
	type Finding,
	listTextFiles,
	readBaseline,
	readText,
	repoRoot,
	reportWithBaseline,
	toPosix,
} from "./shared";

const findings: Finding[] = [];

for (const filePath of listTextFiles(["frontend/src/app"])) {
	const relative = toPosix(path.relative(repoRoot(), filePath));
	if (!/(page|layout)\.tsx$/.test(relative)) {
		continue;
	}

	const text = readText(filePath);
	const redirectsWithoutRenderedMarkup =
		/from "next\/navigation"/.test(text) &&
		/\bredirect\(/.test(text) &&
		!/return\s*(\(|<)/.test(text);
	if (redirectsWithoutRenderedMarkup) {
		continue;
	}

	const hasLandmark = /<(main|section|article|nav|header|footer)\b/.test(text);
	if (!hasLandmark) {
		findings.push({
			rule: "missing-semantic-landmark",
			file: relative,
			line: 1,
			column: 1,
			message: "Page or layout has no semantic landmark",
		});
	}
}

reportWithBaseline(
	"Semantic markup quality check",
	findings,
	readBaseline("tooling/quality/baseline.json"),
);
