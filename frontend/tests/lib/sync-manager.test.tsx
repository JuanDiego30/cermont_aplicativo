import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSyncManager } from "@/lib/offline/sync-manager";
import type { SyncQueueEntry } from "@/lib/offline/sync-queue";
import { useAuthStore } from "@/store/auth.store";

let online = false;

const queueState: SyncQueueEntry[] = [];

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

describe("useSyncManager", () => {
	beforeEach(() => {
		online = false;
		queueState.splice(0, queueState.length);
		useAuthStore.getState().clearAuth();
		useAuthStore.getState().setAccessToken("test-access-token");
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => new Response("", { status: 200 })),
		);
	});

	afterEach(() => {
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
