import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type SyncQueueModule = typeof import("@/_shared/lib/offline/sync-queue");

const originalIndexedDb = globalThis.indexedDB;

function buildEntry(
	overrides: Partial<Awaited<ReturnType<SyncQueueModule["getAll"]>>[number]> = {},
) {
	return {
		id: "entry-1",
		endpoint: "/checklists",
		method: "POST" as const,
		payload: { checklistId: "cl-1" },
		createdAt: Date.now(),
		retryCount: 0,
		idempotencyKey: "idem-1",
		...overrides,
	};
}

async function loadQueueModule(): Promise<SyncQueueModule> {
	vi.resetModules();
	return await import("@/_shared/lib/offline/sync-queue");
}

describe("sync queue fallback storage", () => {
	beforeEach(() => {
		Object.defineProperty(globalThis, "indexedDB", {
			configurable: true,
			value: undefined,
		});
		window.localStorage.clear();
	});

	afterEach(() => {
		Object.defineProperty(globalThis, "indexedDB", {
			configurable: true,
			value: originalIndexedDb,
		});
		vi.restoreAllMocks();
	});

	it("uses in-memory storage when IndexedDB is unavailable", async () => {
		const localStorageGetSpy = vi.spyOn(Storage.prototype, "getItem");
		const localStorageSetSpy = vi.spyOn(Storage.prototype, "setItem");
		const syncQueue = await loadQueueModule();

		await syncQueue.enqueue(buildEntry());
		const entries = await syncQueue.getAll();

		expect(entries).toHaveLength(1);
		expect(entries[0]?.id).toBe("entry-1");
		expect(localStorageGetSpy).not.toHaveBeenCalled();
		expect(localStorageSetSpy).not.toHaveBeenCalled();
	});

	it("deduplicates entries in volatile fallback storage", async () => {
		const syncQueue = await loadQueueModule();

		await syncQueue.enqueue(
			buildEntry({
				id: "entry-1",
				dedupeKey: "checklist:cl-1",
			}),
		);
		await syncQueue.enqueue(
			buildEntry({
				id: "entry-2",
				dedupeKey: "checklist:cl-1",
			}),
		);

		const entries = await syncQueue.getAll();

		expect(entries).toHaveLength(1);
		expect(entries[0]?.id).toBe("entry-1");
	});
});
