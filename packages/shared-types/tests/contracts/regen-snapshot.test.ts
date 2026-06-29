import { describe, expect, it } from "vitest";
import {
	buildApiContractSnapshot,
	createSnapshotHash,
	stringifyApiContractSnapshot,
} from "../../contracts/contractSnapshot";

describe("API contract snapshot generation", () => {
	it("is deterministic without mutating committed artifacts", () => {
		const firstSnapshot = stringifyApiContractSnapshot(buildApiContractSnapshot());
		const secondSnapshot = stringifyApiContractSnapshot(buildApiContractSnapshot());

		expect(secondSnapshot).toBe(firstSnapshot);
		expect(createSnapshotHash(secondSnapshot)).toBe(createSnapshotHash(firstSnapshot));
	});
});
