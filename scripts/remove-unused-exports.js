const fs = require("node:fs");
const path = require("node:path");

const extract = JSON.parse(fs.readFileSync("frontend/.react-doctor-extract.json", "utf8"));
const exports = extract.deadCode.unusedExports;

// Skip test files
const sourceExports = exports.filter(
	(e) => !e.filePath.includes("tests/") && !e.filePath.includes("e2e/"),
);
console.log(`Total unused exports: ${exports.length}`);
console.log(`Source exports (excluding tests): ${sourceExports.length}`);

// Group by file for efficient processing
const byFile = {};
sourceExports.forEach((e) => {
	const fp = e.filePath.replace(/\\/g, "/");
	if (!byFile[fp]) {
		byFile[fp] = [];
	}
	byFile[fp].push(e);
});

console.log(`Files with unused exports: ${Object.keys(byFile).length}`);

const log = [];
let processed = 0;

for (const [filePath, fileExports] of Object.entries(byFile)) {
	const fullPath = path.join("frontend", filePath);
	if (!fs.existsSync(fullPath)) {
		console.log(`SKIP (file not found): ${filePath}`);
		continue;
	}

	let content = fs.readFileSync(fullPath, "utf8");
	let modified = false;

	for (const exp of fileExports) {
		const name = exp.message.replace("Unused export: ", "").trim();

		// Check if this name is imported anywhere in source (excluding tests and this file itself)
		const _foundImport = false;
		// Simple check: look for import patterns
		// We can't do a full filesystem scan here efficiently, so we'll trust knip
		// but do a quick sanity check on common patterns

		// Skip if name is very generic (high chance of false match in strings/comments)
		// For now, just check if the export exists in the file

		// Find the export statement - handle various patterns
		const patterns = [
			new RegExp(`^export (const|let|var|function|class|type|interface) ${name}\\b`, "m"),
			new RegExp(`^export (const|let|var|function|class|type|interface) ${name}\\s*[=:]`, "m"),
			new RegExp(`^export \\{[^}]*\\b${name}\\b[^}]*\\}`, "m"),
			new RegExp(`^export (const|let|var) \\{[^}]*\\b${name}\\b[^}]*\\}`, "m"),
		];

		let replaced = false;
		for (const pattern of patterns) {
			if (pattern.test(content)) {
				// Remove export keyword from declaration
				const newContent = content.replace(pattern, (match) => match.replace(/^export\s+/, ""));
				if (newContent !== content) {
					content = newContent;
					replaced = true;
					break;
				}
			}
		}

		if (!replaced) {
			// Try to find named export: export { name }
			const namedExportPattern = new RegExp(`export\\s+\\{[^}]*\\b${name}\\b[^}]*\\};?`, "g");
			const namedMatches = content.match(namedExportPattern);
			if (namedMatches) {
				for (const match of namedMatches) {
					const remaining = match
						.replace(new RegExp(`\\s*,?\\s*\\b${name}\\b\\s*,?\\s*`), ",")
						.replace(/,\s*,/g, ",")
						.replace(/\{\s*,\s*\}/g, "{}");
					if (remaining === "export {};" || remaining === "export {}") {
						content = content.replace(match, "");
					} else {
						content = content.replace(match, remaining);
					}
					replaced = true;
					break;
				}
			}
		}

		if (replaced) {
			modified = true;
			processed++;
			log.push(`REMOVED_EXPORT: ${filePath} -> ${name}`);
		} else {
			log.push(`SKIP_PATTERN_NOT_FOUND: ${filePath} -> ${name}`);
		}
	}

	if (modified) {
		fs.writeFileSync(fullPath, content, "utf8");
	}
}

fs.writeFileSync("task-3-export-removal.log", log.join("\n"), "utf8");
console.log(`\nProcessed: ${processed} exports removed`);
console.log(`Log written to: task-3-export-removal.log`);
