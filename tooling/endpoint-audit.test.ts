import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

interface AuditFinding {
	category: string;
	title: string;
	details: {
		path?: string;
	};
}

interface AuditReport {
	findings: AuditFinding[];
}

const repoRoot = path.resolve(import.meta.dirname, "..");
const auditDir = path.join(repoRoot, "scripts", "audit");

function runScript(name: string) {
	return spawnSync(process.execPath, [path.join(auditDir, name)], {
		cwd: repoRoot,
		encoding: "utf8",
	});
}

describe("endpoint audit", () => {
	it("does not report malformed or missing frontend routes", () => {
		const extraction = runScript("extract-frontend-calls.mjs");
		expect(extraction.status, extraction.stderr).toBe(0);

		runScript("run-endpoint-audit.mjs");

		const report = JSON.parse(
			readFileSync(path.join(auditDir, "output", "audit-report.json"), "utf8"),
		) as AuditReport;
		const missingRoutes = report.findings.filter((finding) => finding.category === "B");

		expect(missingRoutes.map((finding) => finding.details.path)).toEqual([]);
		expect(missingRoutes.map((finding) => finding.title).join("\n")).not.toContain("${");
	});
});
