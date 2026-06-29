import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("fleet photo upload route", () => {
	it("uses the image-only upload boundary", () => {
		const source = readFileSync(
			new URL("../../src/modules/fleet/fleet.routes.ts", import.meta.url),
			"utf8",
		);
		const uploadRoute = source.slice(source.indexOf('router.post(\n\t"/:id/photos"'));

		expect(uploadRoute).toContain('evidenceUpload.single("file")');
		expect(uploadRoute).not.toContain('upload.single("file")');
	});
});
