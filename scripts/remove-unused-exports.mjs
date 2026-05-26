import fs from "node:fs";
import path from "node:path";

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
		let replaced = false;

		// Pattern 1: export const/let/var/function/class/type/interface name
		const declPattern = new RegExp(
			`^(export\\s+)(const|let|var|function|class|type|interface)\\s+${name}\\b`,
			"m",
		);
		if (declPattern.test(content)) {
			content = content.replace(declPattern, "$2 $3");
			replaced = true;
		}

		// Pattern 2: export { name } or export { a, name, b }
		if (!replaced) {
			const namedPattern = new RegExp(`export\\s+\\{([^}]*)\\b${name}\\b([^}]*)\\};?`, "g");
			let match;
			while ((match = namedPattern.exec(content)) !== null) {
				const before = match[1];
				const after = match[2];
				const remaining = `{${before}${after}}`
					.replace(/,\s*,/g, ",")
					.replace(/\{\s*,\s*\}/g, "{}");
				if (remaining === "{}" || remaining === "{ }") {
					content = content.replace(match[0], "");
				} else {
					content = content.replace(match[0], `export ${remaining};`);
				}
				replaced = true;
				break;
			}
		}

		// Pattern 3: export default function name
		if (!replaced) {
			const defaultPattern = new RegExp(
				`^export\\s+default\\s+(function|class)\\s+${name}\\b`,
				"m",
			);
			if (defaultPattern.test(content)) {
				content = content.replace(defaultPattern, "$1 $2");
				replaced = true;
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
