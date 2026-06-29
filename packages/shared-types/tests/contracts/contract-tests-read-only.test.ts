import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("contract test isolation", () => {
	it("keeps contract tests read-only", () => {
		const regenerationTest = readFileSync(resolve(__dirname, "regen-snapshot.test.ts"), "utf8");

		expect(regenerationTest).not.toContain("writeFileSync");
	});
});
