import { afterEach, describe, expect, it, vi } from "vitest";
import { offlineDb, openOfflineDb } from "../offline-db";

describe("openOfflineDb", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("reports recovery as required without deleting local data", async () => {
		vi.spyOn(offlineDb, "open").mockRejectedValue(new Error("missing object store"));
		const deleteSpy = vi.spyOn(offlineDb, "delete").mockResolvedValue();

		await expect(openOfflineDb()).resolves.toEqual({
			status: "recovery_required",
			reason: "missing object store",
		});
		expect(deleteSpy).not.toHaveBeenCalled();
	});
});
