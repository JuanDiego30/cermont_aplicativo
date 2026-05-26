const fs = require("node:fs");
const path = require("node:path");
const { globSync } = require("glob");

// Read extract
const extract = JSON.parse(fs.readFileSync("frontend/.react-doctor-extract.json", "utf8"));
const unusedFiles = extract.deadCode.unusedFiles.map((f) => f.replace(/\\/g, "/"));

// Read all source files once
const srcFiles = globSync("frontend/src/**/*.{ts,tsx}", { absolute: false }).map((f) =>
	f.replace(/\\/g, "/"),
);
const allSourceCode = srcFiles.map((f) => ({ file: f, content: fs.readFileSync(f, "utf8") }));

// Also read test files
const testFiles = globSync("frontend/tests/**/*.{ts,tsx}", { absolute: false }).map((f) =>
	f.replace(/\\/g, "/"),
);
const allTestCode = testFiles.map((f) => ({ file: f, content: fs.readFileSync(f, "utf8") }));

// Check each unused file
const results = [];
const safe = [];
const check = [];

for (const unusedFile of unusedFiles) {
	const basename = path.basename(unusedFile, path.extname(unusedFile));
	const _namePatterns = [basename, basename.replace(/-/g, "_")];

	// Skip config files and test files (they have special handling)
	const isConfig = unusedFile.includes("vitest.config") || unusedFile.includes("vitest.setup");
	const isPublic = unusedFile.startsWith("public/");
	const isTest =
		unusedFile.includes("/tests/") ||
		unusedFile.endsWith(".test.tsx") ||
		unusedFile.endsWith(".test.ts");
	const isBarrel =
		path.basename(unusedFile) === "index.ts" || path.basename(unusedFile) === "index.tsx";

	// Search for imports/references in source
	let foundRefs = 0;
	let foundImports = 0;
	let foundDynamicImports = 0;

	const importRegex = new RegExp(
		`(from|import\\()\\s*['"]./[^'"]*${basename}['"]|(from|import\\()\\s*['"]./${basename}['"]|(from|import\\()\\s*['"][^'"]*/${basename}['"]`,
		"i",
	);
	const dynamicImportRegex = new RegExp(`import\\s*\\(\\s*['"][^'"]*${basename}['"]`, "i");

	for (const src of allSourceCode) {
		if (src.file === unusedFile) {
			continue; // skip self
		}
		if (importRegex.test(src.content)) {
			foundImports++;
		}
		if (dynamicImportRegex.test(src.content)) {
			foundDynamicImports++;
		}
		if (src.content.includes(basename)) {
			foundRefs++;
		}
	}

	// Check test files
	let foundTestRefs = 0;
	for (const test of allTestCode) {
		if (test.content.includes(basename)) {
			foundTestRefs++;
		}
	}

	let flag = "safe-to-delete";
	const reason = [];

	if (isConfig) {
		flag = "verify-before-delete";
		reason.push("config file - check package.json/scripts and vitest config");
	}
	if (isPublic) {
		flag = "verify-before-delete";
		reason.push("public file - check manifest.json and next.config");
	}
	if (isTest) {
		flag = "verify-before-delete";
		reason.push("test file - check if run by vitest config");
	}
	if (isBarrel) {
		flag = "verify-before-delete";
		reason.push("barrel export - check if re-exports are imported");
	}
	if (foundImports > 0 || foundDynamicImports > 0) {
		flag = "verify-before-delete";
		reason.push(`found ${foundImports} imports, ${foundDynamicImports} dynamic imports`);
	}
	if (foundTestRefs > 0) {
		flag = "verify-before-delete";
		reason.push(`found ${foundTestRefs} test references`);
	}

	const result = {
		file: unusedFile,
		flag,
		reason: reason.join("; "),
		foundImports,
		foundDynamicImports,
		foundRefs,
		foundTestRefs,
	};
	results.push(result);

	if (flag === "safe-to-delete") {
		safe.push(unusedFile);
	} else {
		check.push(result);
	}
}

console.log(`=== File Verification Results ===`);
console.log(`Total unused files: ${unusedFiles.length}`);
console.log(`SAFE to delete: ${safe.length}`);
console.log(`VERIFY before delete: ${check.length}`);
console.log("");

if (check.length > 0) {
	console.log("Files needing verification:");
	check.forEach((c) => {
		console.log(`  [${c.flag}] ${c.file}`);
		if (c.reason) {
			console.log(`    Reason: ${c.reason}`);
		}
	});
}

// Write verification report
fs.writeFileSync(
	"frontend/.file-verification-report.json",
	JSON.stringify(
		{ safe, check: check.map((c) => ({ file: c.file, flag: c.flag, reason: c.reason })) },
		null,
		2,
	),
	"utf8",
);
console.log("\nVerification report written to: frontend/.file-verification-report.json");
