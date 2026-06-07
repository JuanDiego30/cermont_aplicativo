import type { OfflineOutboxItem } from "@cermont/shared-types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const memoryStore = new Map<string, OfflineOutboxItem>();

const offlineOutboxMock = {
	clear: vi.fn(async () => {
		memoryStore.clear();
	}),
	bulkPut: vi.fn(async (items: OfflineOutboxItem[]) => {
		for (const item of items) {
			memoryStore.set(item.localId, item);
		}
	}),
	bulkDelete: vi.fn(async (localIds: string[]) => {
		for (const localId of localIds) {
			memoryStore.delete(localId);
		}
	}),
	toArray: vi.fn(async (): Promise<OfflineOutboxItem[]> => Array.from(memoryStore.values())),
	update: vi.fn(async (localId: string, patch: Partial<OfflineOutboxItem>): Promise<number> => {
		const existing = memoryStore.get(localId);
		if (!existing) {
			return 0;
		}
		memoryStore.set(localId, { ...existing, ...patch });
		return 1;
	}),
};

const transactionMock = vi.fn(
	async (_mode: string, _table: typeof offlineOutboxMock, scope: () => Promise<void> | void) => {
		await scope();
	},
);

vi.mock("@/lib/offline/offline-db", () => ({
	hasIndexedDBSupport: () => true,
	nowIso: () => new Date().toISOString(),
	offlineDb: {
		offlineOutbox: offlineOutboxMock,
		transaction: transactionMock,
	},
	legacyQueueEntryToOutboxItem: (
		entry: {
			id: string;
			endpoint: string;
			method: "POST" | "PATCH" | "PUT" | "DELETE";
			payload: OfflineOutboxItem["payload"];
			createdAt: number;
			retryCount: number;
			idempotencyKey: string;
			status?: "pending" | "dead_letter";
			nextRetryAt?: number;
			lastError?: string;
			dedupeKey?: string;
		},
		_userId: string,
	): OfflineOutboxItem => ({
		localId: entry.id,
		entityType: "work_order",
		operation: entry.method === "PATCH" || entry.method === "PUT" ? "update" : "create",
		payload:
			typeof entry.dedupeKey === "string" && entry.dedupeKey.length > 0
				? { ...entry.payload, __cermontDedupeKey: entry.dedupeKey }
				: entry.payload,
		status: entry.status === "dead_letter" ? "failed" : "pending_sync",
		attempts: entry.retryCount,
		createdAt: new Date(entry.createdAt).toISOString(),
		updatedAt: new Date().toISOString(),
		idempotencyKey: entry.idempotencyKey,
		schemaVersion: "offline.v1",
		userId: "test-user",
		endpoint: entry.endpoint,
		method: entry.method,
		nextRetryAt: entry.nextRetryAt,
		lastError: entry.lastError,
	}),
}));

const { dequeue, enqueue, getAll, markDeadLetter, updateEntry } = await import("../sync-queue");

const baseEntry = {
	id: "queue-1",
	endpoint: "/checklists/checklist-1/items/item-1",
	method: "PATCH" as const,
	payload: { completed: true },
	createdAt: 1_700_000_000_000,
	retryCount: 0,
	idempotencyKey: "idempotency-1",
	dedupeKey: "checklists:update:checklist-1:item-1:true",
};

describe("sync-queue", () => {
	beforeEach(() => {
		memoryStore.clear();
		vi.clearAllMocks();
	});

	afterEach(() => {
		memoryStore.clear();
	});

	it("enqueues and dequeues entries", async () => {
		await enqueue(baseEntry);
		expect(await getAll()).toHaveLength(1);

		await dequeue(baseEntry.id);

		expect(await getAll()).toHaveLength(0);
	});

	it("persists entries in the canonical Dexie outbox", async () => {
		await enqueue(baseEntry);

		expect(offlineOutboxMock.bulkPut).toHaveBeenCalledOnce();
		expect(memoryStore.has(baseEntry.id)).toBe(true);
	});

	it("deduplicates entries by dedupeKey", async () => {
		await enqueue(baseEntry);
		await enqueue({
			...baseEntry,
			id: "queue-duplicate",
			idempotencyKey: "idempotency-duplicate",
		});

		const entries = await getAll();

		expect(entries).toHaveLength(1);
		expect(entries[0].id).toBe(baseEntry.id);
	});

	it("persists retry metadata on update", async () => {
		await enqueue(baseEntry);
		await updateEntry({
			...baseEntry,
			retryCount: 2,
			nextRetryAt: 1_700_000_060_000,
			lastError: "temporary failure",
		});

		const entries = await getAll();

		expect(entries[0].retryCount).toBe(2);
		expect(entries[0].nextRetryAt).toBe(1_700_000_060_000);
		expect(entries[0].lastError).toBe("temporary failure");
	});

	it("marks entries as dead letter", async () => {
		await enqueue(baseEntry);
		await markDeadLetter(baseEntry.id);

		const entries = await getAll();

		expect(entries).toHaveLength(1);
		expect(entries[0].status).toBe("dead_letter");
	});
});
