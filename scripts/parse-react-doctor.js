const fs = require("node:fs");

const raw = fs.readFileSync("react-doctor-report-utf8.json");
let jsonStr = raw.toString("utf8");
while (
	jsonStr.length > 0 &&
	(jsonStr.charCodeAt(0) === 0xfeff ||
		jsonStr.charCodeAt(0) === 0xfffe ||
		jsonStr.charCodeAt(0) === 0xef ||
		(jsonStr.charCodeAt(0) < 0x20 &&
			jsonStr.charCodeAt(0) !== 0x09 &&
			jsonStr.charCodeAt(0) !== 0x0a &&
			jsonStr.charCodeAt(0) !== 0x0d))
) {
	jsonStr = jsonStr.slice(1);
}

const report = JSON.parse(jsonStr);
const projectData = report.projects ? report.projects[Object.keys(report.projects)[0]] : report;
const issues = Object.values(projectData.diagnostics || {});
const score = projectData.score?.score ?? "N/A";

// Categorize
const byCategory = {};
issues.forEach((i) => {
	byCategory[i.category] = byCategory[i.category] || [];
	byCategory[i.category].push(i);
});

const deadCode = byCategory["Dead Code"] || [];
const architecture = byCategory.Architecture || [];
const correctness = byCategory.Correctness || [];
const performance = byCategory.Performance || [];
const stateEffects = byCategory["State & Effects"] || [];
const bundleSize = byCategory["Bundle Size"] || [];
const nextjs = byCategory["Next.js"] || [];
const tanstack = byCategory["TanStack Query"] || [];
const accessibility = byCategory.Accessibility || [];

// Dead Code sub-categories (knip plugin rules)
const unusedFiles = deadCode.filter((i) => i.rule === "files");
const unusedExports = deadCode.filter((i) => i.rule === "exports");
const unusedTypes = deadCode.filter((i) => i.rule === "types");
const duplicates = deadCode.filter((i) => i.rule === "duplicates");

// Helper: group by rule
function groupByRule(items) {
	const rules = {};
	items.forEach((i) => {
		rules[i.rule] = (rules[i.rule] || 0) + 1;
	});
	return Object.entries(rules).sort((a, b) => b[1] - a[1]);
}

console.log("=== REACT-DOCTOR CATALOG ===");
console.log(`Total diagnostics: ${issues.length}`);
console.log(`Score: ${score}/100`);
console.log("");
console.log(
	`Dead Code: ${deadCode.length} (files:${unusedFiles.length}, exports:${unusedExports.length}, types:${unusedTypes.length}, duplicates:${duplicates.length})`,
);
console.log(`Architecture: ${architecture.length}`);
console.log(`Correctness: ${correctness.length}`);
console.log(`Performance: ${performance.length}`);
console.log(`State & Effects: ${stateEffects.length}`);
console.log(`Bundle Size: ${bundleSize.length}`);
console.log(`Next.js: ${nextjs.length}`);
console.log(`TanStack Query: ${tanstack.length}`);
console.log(`Accessibility: ${accessibility.length}`);

// Build catalog markdown
const catalogLines = [
	"# React-Doctor Catalog — Full Audit",
	`Generated: ${new Date().toISOString()}`,
	`Score: ${score}/100 (${projectData.score?.label || "N/A"})`,
	`Total diagnostics: ${issues.length} across all categories`,
	"",
	"## Summary by Category",
	"",
	"| Category | Count | Rules |",
	"|----------|-------|-------|",
	`| Dead Code | ${deadCode.length} | files, exports, types, duplicates |`,
	`| Architecture | ${architecture.length} | ellipsis, padding-axes, tailwind-palette, giant-components, bold-heading, ... |`,
	`| Correctness | ${correctness.length} | hydration-mismatch-time, prevent-default |`,
	`| Performance | ${performance.length} | hoist-intl, rerender-state, set-map-lookups, ... |`,
	`| State & Effects | ${stateEffects.length} | useReducer, effect-event-handler, cascading-set-state, ... |`,
	`| Bundle Size | ${bundleSize.length} | dynamic-import |`,
	`| Next.js | ${nextjs.length} | use-search-params, a-element |`,
	`| TanStack Query | ${tanstack.length} | mutation-invalidation |`,
	`| Accessibility | ${accessibility.length} | label-control, heading-content, ... |`,
	"",
	"---",
	"",
	`## 1. Unused Files (${unusedFiles.length})`,
	"",
	...unusedFiles.map((i) => `- \`safe-to-delete\` | \`${i.filePath.replace(/\\/g, "/")}\``),
	"",
	`## 2. Unused Exports (${unusedExports.length})`,
	"",
	...unusedExports.map((i) => {
		const name = i.message?.replace("Unused export: ", "") || "unknown";
		return `- \`safe-to-delete\` | \`${name}\` | \`${i.filePath.replace(/\\/g, "/")}\``;
	}),
	"",
	`## 3. Unused Types (${unusedTypes.length})`,
	"",
	...unusedTypes.map((i) => {
		const name = i.message?.replace("Unused type: ", "") || "unknown";
		return `- \`safe-to-delete\` | \`${name}\` | \`${i.filePath.replace(/\\/g, "/")}\``;
	}),
	"",
	`## 4. Duplicates (${duplicates.length})`,
	"",
	...duplicates.map(
		(i) => `- \`verify-before-delete\` | \`${i.filePath.replace(/\\/g, "/")}\` | ${i.message}`,
	),
	"",
	"---",
	"",
	"## Architecture Issues (Wave 2)",
	...groupByRule(architecture).map(([rule, count]) => `- \`${rule}\`: ${count}`),
	"",
	"## Correctness Issues (Wave 4)",
	...groupByRule(correctness).map(([rule, count]) => `- \`${rule}\`: ${count}`),
	"",
	"## Performance Issues (Wave 4)",
	...groupByRule(performance).map(([rule, count]) => `- \`${rule}\`: ${count}`),
	"",
	"## State & Effects Issues (Wave 3)",
	...groupByRule(stateEffects).map(([rule, count]) => `- \`${rule}\`: ${count}`),
	"",
	"## Bundle Size Issues (Wave 4)",
	...groupByRule(bundleSize).map(([rule, count]) => `- \`${rule}\`: ${count}`),
	"",
	"## Next.js Issues",
	...groupByRule(nextjs).map(([rule, count]) => `- \`${rule}\`: ${count}`),
	"",
	"## TanStack Query Issues",
	...groupByRule(tanstack).map(([rule, count]) => `- \`${rule}\`: ${count}`),
	"",
	"## Accessibility Issues",
	...groupByRule(accessibility).map(([rule, count]) => `- \`${rule}\`: ${count}`),
];

fs.writeFileSync("frontend/dead-code-catalog.md", catalogLines.join("\n"), "utf8");
console.log("\nCatalog written to: frontend/dead-code-catalog.md");

// Write detailed JSON extracts for each wave
const extract = {
	score,
	label: projectData.score?.label,
	totalIssues: issues.length,
	deadCode: {
		unusedFiles: unusedFiles.map((i) => i.filePath),
		unusedExports: unusedExports.map((i) => ({ filePath: i.filePath, message: i.message })),
		unusedTypes: unusedTypes.map((i) => ({ filePath: i.filePath, message: i.message })),
		duplicates: duplicates.map((i) => ({ filePath: i.filePath, message: i.message })),
	},
	architecture: architecture.map((i) => ({
		rule: i.rule,
		filePath: i.filePath,
		line: i.line,
		column: i.column,
		message: i.message,
		help: i.help,
	})),
	correctness: correctness.map((i) => ({
		rule: i.rule,
		filePath: i.filePath,
		line: i.line,
		column: i.column,
		message: i.message,
		help: i.help,
	})),
	performance: performance.map((i) => ({
		rule: i.rule,
		filePath: i.filePath,
		line: i.line,
		column: i.column,
		message: i.message,
		help: i.help,
	})),
	stateEffects: stateEffects.map((i) => ({
		rule: i.rule,
		filePath: i.filePath,
		line: i.line,
		column: i.column,
		message: i.message,
		help: i.help,
	})),
	bundleSize: bundleSize.map((i) => ({
		rule: i.rule,
		filePath: i.filePath,
		line: i.line,
		column: i.column,
		message: i.message,
		help: i.help,
	})),
	nextjs: nextjs.map((i) => ({
		rule: i.rule,
		filePath: i.filePath,
		line: i.line,
		column: i.column,
		message: i.message,
		help: i.help,
	})),
	tanstack: tanstack.map((i) => ({
		rule: i.rule,
		filePath: i.filePath,
		line: i.line,
		column: i.column,
		message: i.message,
		help: i.help,
	})),
	accessibility: accessibility.map((i) => ({
		rule: i.rule,
		filePath: i.filePath,
		line: i.line,
		column: i.column,
		message: i.message,
		help: i.help,
	})),
};

fs.writeFileSync("frontend/.react-doctor-extract.json", JSON.stringify(extract, null, 2), "utf8");
console.log("Extract written to: frontend/.react-doctor-extract.json");
