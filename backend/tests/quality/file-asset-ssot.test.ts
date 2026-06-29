import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url));

describe("FileAsset architecture", () => {
	it("keeps FileAsset as the only media metadata aggregate", () => {
		// MediaEngine module is allowed as a thin wrapper around FileAsset.
		// The forbidden pattern is a SECOND Mongoose model for media metadata.
		const forbiddenModelPath = "backend/src/modules/media/models/MediaAsset.ts";
		expect(existsSync(`${repositoryRoot}${forbiddenModelPath}`)).toBe(false);

		// The media module must NOT define its own Mongoose model.
		const mediaService = readFileSync(
			`${repositoryRoot}backend/src/modules/media/media.service.ts`,
			"utf8",
		);
		expect(mediaService).not.toContain("new MediaAsset");
		expect(mediaService).not.toContain("MediaAsset.create");
		expect(mediaService).not.toContain("MediaAssetModel");

		// The media module must delegate to FileAsset service.
		expect(mediaService).toContain("files.service");
		expect(mediaService).toContain("listFileAssetsByEntity");
		expect(mediaService).toContain("createFileAssetFromUpload");
	});
});
