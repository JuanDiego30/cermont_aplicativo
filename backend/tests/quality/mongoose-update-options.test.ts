import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const sourceRoot = path.resolve(import.meta.dirname, "../../src");

function collectTypeScriptFiles(directory: string): string[] {
	const files: string[] = [];

	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const entryPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...collectTypeScriptFiles(entryPath));
		} else if (entry.isFile() && entry.name.endsWith(".ts")) {
			files.push(entryPath);
		}
	}

	return files;
}

describe("Mongoose update options", () => {
	it("uses returnDocument instead of the deprecated new option", () => {
		const offenders = collectTypeScriptFiles(sourceRoot)
			.filter((filePath) => /\bnew\s*:\s*true\b/.test(readFileSync(filePath, "utf8")))
			.map((filePath) => path.relative(sourceRoot, filePath).replaceAll("\\", "/"));

		expect(offenders).toEqual([]);
	});
});
