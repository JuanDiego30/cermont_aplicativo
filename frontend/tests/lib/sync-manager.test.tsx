import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSyncManager } from "@/lib/offline/sync-manager";
import type { SyncQueueEntry } from "@/lib/offline/sync-queue";
import { useAuthStore } from "@/store/auth.store";

let online = false;

const queueState: SyncQueueEntry[] = [];
const offlineDbMocks = vi.hoisted(() => ({
	hasIndexedDBSupport: vi.fn().mockReturnValue(true),
	nowIso: vi.fn().mockReturnValue("2026-01-01T10:00:00.000Z"),
	offlineFilesGet: vi.fn(),
	offlineFilesUpdate: vi.fn().mockResolvedValue(1),
}));

vi.mock("@/lib/offline/connectivity", () => ({
	useConnectivity: () => ({ isOnline: online }),
}));

vi.mock("@/lib/offline/sync-queue", () => ({
	QUEUE_CHANGED_EVENT: "sync-queue:changed",
	dequeue: vi.fn(async (id: string) => {
		const index = queueState.findIndex((entry) => entry.id === id);
		if (index >= 0) {
			queueState.splice(index, 1);
		}
	}),
	getAll: vi.fn(async () => queueState.map((entry) => ({ ...entry }))),
	updateEntry: vi.fn(async (entry: SyncQueueEntry) => {
		const index = queueState.findIndex((candidate) => candidate.id === entry.id);
		if (index >= 0) {
			queueState[index] = { ...entry };
		} else {
			queueState.push({ ...entry });
		}
		return { ...entry };
	}),
}));

vi.mock("@/lib/offline/offline-db", () => ({
	hasIndexedDBSupport: offlineDbMocks.hasIndexedDBSupport,
	nowIso: offlineDbMocks.nowIso,
	offlineDb: {
		offlineFiles: {
			get: offlineDbMocks.offlineFilesGet,
			update: offlineDbMocks.offlineFilesUpdate,
		},
	},
}));

vi.mock("@/lib/offline/sync-engine", () => ({
	syncNow: vi.fn(async () => ({
		synced: 0,
		failed: 0,
		conflicts: 0,
		pending: 0,
	})),
}));

describe("useSyncManager", () => {
	beforeEach(() => {
		online = false;
		queueState.splice(0, queueState.length);
		offlineDbMocks.offlineFilesGet.mockReset();
		offlineDbMocks.offlineFilesUpdate.mockClear();
		offlineDbMocks.hasIndexedDBSupport.mockReturnValue(true);
		useAuthStore.getState().clearAuth();
		useAuthStore.getState().setAccessToken("test-access-token");
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => new Response("", { status: 200 })),
		);
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
		useAuthStore.getState().clearAuth();
		queueState.splice(0, queueState.length);
	});

	it("sweeps queued requests sequentially after reconnecting", async () => {
		queueState.push(
			{
				id: "queue-1",
				endpoint: "/checklists",
				method: "POST",
				payload: { orderId: "order-1" },
				createdAt: 1,
				retryCount: 0,
				idempotencyKey: "idem-1",
				status: "pending",
			},
			{
				id: "queue-2",
				endpoint: "/checklists/123/items/abc",
				method: "PATCH",
				payload: { completed: true, observation: "done" },
				createdAt: 2,
				retryCount: 0,
				idempotencyKey: "idem-2",
				status: "pending",
			},
		);

		const fetchMock = vi.mocked(global.fetch);
		const { result, rerender } = renderHook(() => useSyncManager());

		await waitFor(() => {
			expect(result.current.pendingCount).toBe(2);
			expect(result.current.deadLetterCount).toBe(0);
			expect(result.current.status).toBe("idle");
		});

		online = true;

		await act(async () => {
			rerender();
		});

		await waitFor(() => {
			expect(result.current.pendingCount).toBe(0);
			expect(result.current.deadLetterCount).toBe(0);
			expect(result.current.status).toBe("idle");
		});

		expect(fetchMock).toHaveBeenCalledTimes(2);

		const firstCallInit = fetchMock.mock.calls[0][1] as RequestInit;
		const secondCallInit = fetchMock.mock.calls[1][1] as RequestInit;
		expect((firstCallInit.headers as Headers).get("Idempotency-Key")).toBe("idem-1");
		expect((secondCallInit.headers as Headers).get("Idempotency-Key")).toBe("idem-2");
		expect((firstCallInit.headers as Headers).get("Authorization")).toBe(
			"Bearer test-access-token",
		);
	});

	it("sweeps queued requests when authentication becomes ready after reconnecting", async () => {
		online = true;
		useAuthStore.getState().clearAccessToken();
		queueState.push({
			id: "queue-auth-refresh",
			endpoint: "/notifications/mark-all-read",
			method: "POST",
			payload: {},
			createdAt: 1,
			retryCount: 0,
			idempotencyKey: "idem-auth-refresh",
			status: "pending",
		});

		const fetchMock = vi.mocked(global.fetch);
		const { result } = renderHook(() => useSyncManager());

		await waitFor(() => {
			expect(result.current.pendingCount).toBe(1);
			expect(result.current.status).toBe("idle");
		});
		expect(fetchMock).not.toHaveBeenCalled();

		await act(async () => {
			useAuthStore.getState().setAccessToken("refreshed-access-token");
		});

		await waitFor(() => {
			expect(result.current.pendingCount).toBe(0);
		});

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const requestInit = fetchMock.mock.calls[0][1] as RequestInit;
		expect((requestInit.headers as Headers).get("Authorization")).toBe(
			"Bearer refreshed-access-token",
		);
	});

	it("automatically retries a transient queued request after its backoff expires", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-01T10:00:00.000Z"));
		online = true;
		queueState.push({
			id: "queue-transient-retry",
			endpoint: "/notifications/mark-all-read",
			method: "POST",
			payload: {},
			createdAt: 1,
			retryCount: 0,
			idempotencyKey: "idem-transient-retry",
			status: "pending",
		});

		const fetchMock = vi
			.fn()
			.mockRejectedValueOnce(new TypeError("Failed to fetch"))
			.mockResolvedValueOnce(new Response("", { status: 200 }));
		vi.stubGlobal("fetch", fetchMock);

		const { result } = renderHook(() => useSyncManager());

		await act(async () => {
			await vi.advanceTimersByTimeAsync(0);
		});

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(queueState[0]).toMatchObject({
			id: "queue-transient-retry",
			retryCount: 1,
			status: "pending",
			nextRetryAt: Date.parse("2026-01-01T10:00:01.000Z"),
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(1_000);
		});

		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(queueState).toHaveLength(0);
		expect(result.current.pendingCount).toBe(0);
	});

	it("hydrates queued evidence files from IndexedDB blobs before syncing", async () => {
		const evidenceBlob = new Blob(["evidence-bytes"], { type: "image/jpeg" });
		offlineDbMocks.offlineFilesGet.mockResolvedValue({
			localId: "offline-file-1",
			blob: evidenceBlob,
			fileName: "photo.jpg",
			mimeType: "image/jpeg",
			status: "pending_upload",
		});
		queueState.push({
			id: "queue-evidence",
			endpoint: "/evidences",
			method: "POST",
			payload: {
				orderId: "order-1",
				type: "before",
				capturedAt: "2026-01-01T10:00:00.000Z",
				fileLocalId: "offline-file-1",
				fileName: "photo.jpg",
				fileType: "image/jpeg",
			},
			createdAt: 1,
			retryCount: 0,
			idempotencyKey: "idem-evidence",
			status: "pending",
		});

		const fetchMock = vi.mocked(global.fetch);
		const { result, rerender } = renderHook(() => useSyncManager());

		await waitFor(() => {
			expect(result.current.pendingCount).toBe(1);
		});

		online = true;

		await act(async () => {
			rerender();
		});

		await waitFor(() => {
			expect(result.current.pendingCount).toBe(0);
			expect(result.current.status).toBe("idle");
		});

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const requestInit = fetchMock.mock.calls[0][1] as RequestInit;
		expect(requestInit.body).toBeInstanceOf(FormData);
		expect((requestInit.headers as Headers).has("Content-Type")).toBe(false);
		expect((requestInit.body as FormData).get("orderId")).toBe("order-1");
		expect((requestInit.body as FormData).get("file")).toBeInstanceOf(File);
		expect(offlineDbMocks.offlineFilesGet).toHaveBeenCalledWith("offline-file-1");
		expect(offlineDbMocks.offlineFilesUpdate).toHaveBeenCalledWith("offline-file-1", {
			status: "uploaded",
			updatedAt: "2026-01-01T10:00:00.000Z",
		});
	});

	it("dead-letters entries after the retry limit is exceeded", async () => {
		queueState.push({
			id: "queue-dead",
			endpoint: "/evidences",
			method: "POST",
			payload: {
				orderId: "order-1",
				fileBase64: "dGVzdA==",
				fileName: "photo.jpg",
				fileType: "image/jpeg",
			},
			createdAt: 1,
			retryCount: 4,
			idempotencyKey: "idem-dead",
			status: "pending",
		});

		vi.stubGlobal(
			"fetch",
			vi.fn(
				async () =>
					new Response(JSON.stringify({ error: "boom" }), {
						status: 500,
						headers: { "Content-Type": "application/json" },
					}),
			),
		);

		const fetchMock = vi.mocked(global.fetch);
		const { result, rerender } = renderHook(() => useSyncManager());

		await waitFor(() => {
			expect(result.current.pendingCount).toBe(1);
			expect(result.current.deadLetterCount).toBe(0);
			expect(result.current.status).toBe("idle");
		});

		online = true;

		await act(async () => {
			rerender();
		});

		await waitFor(() => {
			expect(result.current.pendingCount).toBe(0);
			expect(result.current.deadLetterCount).toBe(1);
			expect(result.current.status).toBe("error");
		});

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(queueState[0]).toMatchObject({
			id: "queue-dead",
			status: "dead_letter",
			retryCount: 5,
		});
	});
});
