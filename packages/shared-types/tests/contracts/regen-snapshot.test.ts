import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
	buildApiContractSnapshot,
	createSnapshotHash,
	stringifyApiContractSnapshot,
} from "../../contracts/contractSnapshot";

describe("Regenerate snapshot (one-time)", () => {
	it("writes the current snapshot to disk and reports hash", () => {
		const snapshotPath = resolve(__dirname, "../../contracts/api-contract.snapshot.json");
		const generatedSnapshot = stringifyApiContractSnapshot(buildApiContractSnapshot());

		writeFileSync(snapshotPath, generatedSnapshot, "utf8");

		const hash = createSnapshotHash(generatedSnapshot);
		process.stdout.write(`NEW_SNAPSHOT_HASH=${hash}\n`);

		// Verify round-trip
		const committedSnapshot = readFileSync(snapshotPath, "utf8");
		expect(generatedSnapshot).toBe(committedSnapshot);
	});
});
