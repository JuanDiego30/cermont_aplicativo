import type { OfflineOutboxItem } from "@cermont/shared-types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const memoryStore = new Map<string, OfflineOutboxItem>();

const offlineOutboxMock = {
	toArray: vi.fn(async (): Promise<OfflineOutboxItem[]> => Array.from(memoryStore.values())),
	get: vi.fn(
		async (localId: string): Promise<OfflineOutboxItem | undefined> => memoryStore.get(localId),
	),
	update: vi.fn(async (localId: string, patch: Partial<OfflineOutboxItem>): Promise<number> => {
		const existing = memoryStore.get(localId);
		if (!existing) {
			return 0;
		}
		memoryStore.set(localId, { ...existing, ...patch });
		return 1;
	}),
};

vi.mock("@/lib/offline/offline-db", () => ({
	nowIso: () => "2026-06-11T12:00:00.000Z",
	offlineDb: {
		offlineOutbox: offlineOutboxMock,
	},
}));

vi.mock("@/lib/offline/blob-outbox", () => ({
	getAllBlobUploads: vi.fn(async () => []),
	removeBlobUpload: vi.fn(async () => undefined),
	retryBlobUpload: vi.fn(async () => undefined),
}));

vi.mock("@/store/offline.store", () => ({
	useOfflineStore: {
		getState: () => ({
			setSyncState: vi.fn(),
		}),
	},
}));

const {
	discardOfflineRecoveryItem,
	listOfflineRecoveryItems,
	resolveOfflineConflict,
	retryOfflineRecoveryItem,
} = await import("../offline-recovery");

function makeItem(localId: string, status: OfflineOutboxItem["status"]): OfflineOutboxItem {
	const base: OfflineOutboxItem = {
		localId,
		entityType: "work_order",
		operation: "update",
		payload: { status: "in_progress" },
		status,
		attempts: 5,
		lastError: "Conflicto de version",
		nextRetryAt: 1_800_000_000_000,
		createdAt: "2026-06-11T10:00:00.000Z",
		updatedAt: "2026-06-11T11:00:00.000Z",
		idempotencyKey: "550e8400-e29b-41d4-a716-446655440000",
		schemaVersion: "offline.v1",
		userId: "user-1",
	};

	if (status !== "conflict") {
		return base;
	}

	return {
		...base,
		conflict: {
			reason: "El servidor cambio primero.",
			serverVersion: 2,
			localVersion: 1,
		},
	};
}

describe("offline recovery repository", () => {
	beforeEach(() => {
		memoryStore.clear();
		vi.clearAllMocks();
	});

	it("lists failed and conflicted items without mixing pending work", async () => {
		memoryStore.set("failed-1", makeItem("failed-1", "failed"));
		memoryStore.set("conflict-1", makeItem("conflict-1", "conflict"));
		memoryStore.set("pending-1", makeItem("pending-1", "pending_sync"));

		const items = await listOfflineRecoveryItems();

		expect(items.map((item) => item.localId)).toEqual(["conflict-1", "failed-1"]);
	});

	it("resets retry metadata and returns an item to pending sync", async () => {
		memoryStore.set("failed-1", makeItem("failed-1", "failed"));

		await retryOfflineRecoveryItem("failed-1");

		expect(memoryStore.get("failed-1")).toMatchObject({
			status: "pending_sync",
			attempts: 0,
			updatedAt: "2026-06-11T12:00:00.000Z",
		});
		expect(memoryStore.get("failed-1")?.lastError).toBeUndefined();
		expect(memoryStore.get("failed-1")?.nextRetryAt).toBeUndefined();
		expect(memoryStore.get("failed-1")?.conflict).toBeUndefined();
	});

	it("keeps discarded records locally for traceability", async () => {
		memoryStore.set("failed-1", makeItem("failed-1", "failed"));

		await discardOfflineRecoveryItem("failed-1");

		expect(memoryStore.get("failed-1")).toMatchObject({
			status: "discarded",
			updatedAt: "2026-06-11T12:00:00.000Z",
		});
		expect(memoryStore.get("failed-1")?.nextRetryAt).toBeUndefined();
	});

	it("resolves conflicts by choosing the server or retrying the local version", async () => {
		memoryStore.set("server", makeItem("server", "conflict"));
		memoryStore.set("local", makeItem("local", "conflict"));

		await resolveOfflineConflict("server", "keep_server");
		await resolveOfflineConflict("local", "retry_local");

		expect(memoryStore.get("server")?.status).toBe("discarded");
		expect(memoryStore.get("local")?.status).toBe("pending_sync");
	});
});
