import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
	buildApiContractSnapshot,
	createSnapshotHash,
	stringifyApiContractSnapshot,
} from "../../contracts/contractSnapshot";

describe("API contract snapshot", () => {
	it("matches the committed snapshot artifact", () => {
		const snapshotPath = resolve(__dirname, "../../contracts/api-contract.snapshot.json");
		const committedSnapshot = readFileSync(snapshotPath, "utf8");
		const generatedSnapshot = stringifyApiContractSnapshot(buildApiContractSnapshot());

		expect(generatedSnapshot).toBe(committedSnapshot);
	});

	it("keeps migration manifest aligned with current snapshot hash", () => {
		const snapshotPath = resolve(__dirname, "../../contracts/api-contract.snapshot.json");
		const migrationManifestPath = resolve(__dirname, "../../contracts/contract-migrations.json");

		const committedSnapshot = readFileSync(snapshotPath, "utf8");
		const migrationManifest = JSON.parse(readFileSync(migrationManifestPath, "utf8")) as {
			currentSnapshotHash: string;
			migrations: Array<{ toHash: string }>;
		};

		const snapshotHash = createSnapshotHash(committedSnapshot);
		const latestMigration = migrationManifest.migrations[migrationManifest.migrations.length - 1];

		expect(migrationManifest.currentSnapshotHash).toBe(snapshotHash);
		expect(latestMigration?.toHash).toBe(snapshotHash);
	});
});
