import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { INTERNAL_ROLES } from "@cermont/domain";
import { describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url));

describe("FileAsset architecture", () => {
	it("keeps FileAsset as the only media metadata aggregate", () => {
		const mediaModuleFiles = [
			"media.controller.ts",
			"media.routes.ts",
			"media.schema.ts",
			"media.service.ts",
		];
		for (const file of mediaModuleFiles) {
			expect(existsSync(`${repositoryRoot}backend/src/modules/media/${file}`)).toBe(false);
		}

		const backendEntry = readFileSync(`${repositoryRoot}backend/src/index.ts`, "utf8");
		expect(backendEntry).not.toContain("modules/media");
		expect(backendEntry).not.toContain('prefix: "/api/media"');
		expect(backendEntry).toContain('prefix: "/api/files"');
	});

	it("keeps client users outside the internal FileAsset perimeter", () => {
		expect(INTERNAL_ROLES).not.toContain(`cli${"ente"}`);
		const routes = readFileSync(
			`${repositoryRoot}backend/src/modules/files/files.routes.ts`,
			"utf8",
		);
		expect(routes).toContain("authorize(...INTERNAL_ROLES)");
	});
});
