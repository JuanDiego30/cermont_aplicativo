import path from "node:path";
import { type Finding, listTextFiles, readText, repoRoot, toPosix } from "./shared";

const DASHBOARD_MAX_LINES = 300;
const BILLING_MAX_LINES = 500;
const DASHBOARD_ROOT = "backend/src/dashboard/application";
const BILLING_SERVICE = "backend/src/orders/application/billing.service.ts";

const findings: Finding[] = [];

for (const filePath of listTextFiles([DASHBOARD_ROOT])) {
	if (!filePath.endsWith(".ts")) {
		continue;
	}

	addFindingWhenTooLarge(filePath, DASHBOARD_MAX_LINES, "dashboard-service-size");
}

addFindingWhenTooLarge(
	path.resolve(repoRoot(), BILLING_SERVICE),
	BILLING_MAX_LINES,
	"billing-service-size",
);

console.log(`Application service size quality check: ${findings.length} findings`);

if (findings.length === 0) {
	process.exit(0);
}

for (const finding of findings) {
	console.error(
		`${finding.file}:${finding.line}:${finding.column} ${finding.rule} ${finding.message}`,
	);
}

process.exit(1);

function addFindingWhenTooLarge(filePath: string, maxLines: number, rule: string): void {
	const relative = toPosix(path.relative(repoRoot(), filePath));
	const text = readText(filePath).replace(/\r?\n$/, "");
	const lineCount = text.length === 0 ? 0 : text.split(/\r?\n/).length;

	if (lineCount <= maxLines) {
		return;
	}

	findings.push({
		rule,
		file: relative,
		line: maxLines + 1,
		column: 1,
		message: `Application service file has ${lineCount} lines; maximum allowed is ${maxLines}.`,
	});
}
