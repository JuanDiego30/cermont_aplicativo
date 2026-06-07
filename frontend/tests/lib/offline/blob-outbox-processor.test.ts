/**
 * Tests for the blob-outbox processor.
 *
 * Covers the public surface of
 * `frontend/src/lib/offline/blob-outbox-processor.ts`:
 *   - processBlobOutboxEntry
 *     * returns false (skips) when offline
 *     * on success: removes entry, emits changed event
 *     * on failure: increments retry via markBlobFailed
 *   - drainBlobOutbox
 *     * returns zero counts when offline
 *     * returns zero counts when outbox is empty
 *     * processes all pending entries and reports succeeded/failed
 *
 * The Vitest jsdom environment does not provide `indexedDB`, so the
 * test file installs a minimal in-memory shim from
 * `./_in-memory-indexeddb.ts` before any outbox code is imported.
 * The uploadFile API is mocked per-test with `vi.mock` so the test
 * can simulate success and failure paths without hitting the network.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useOfflineStore } from "@/store/offline.store";
import { installInMemoryIndexedDB } from "./_in-memory-indexeddb";

installInMemoryIndexedDB();

const uploadFileMock = vi.fn();

vi.mock("@/modules/files/api/files.api", () => ({
	uploadFile: (...args: unknown[]) => uploadFileMock(...args),
}));

const {
	BLOB_OUTBOX_CHANGED_EVENT,
	clearBlobOutbox,
	enqueueBlobUpload,
	getAllBlobUploads,
	markBlobFailed,
	markBlobInFlight,
} = await import("@/lib/offline/blob-outbox");

// markBlobInFlight is imported for use in the dead-letter test below.
void markBlobInFlight;

const { drainBlobOutbox, processBlobOutboxEntry } = await import(
	"@/lib/offline/blob-outbox-processor"
);

function makeFile(name = "evidence.jpg", type = "image/jpeg"): File {
	return new File([new Uint8Array([0xff, 0xd8, 0xff])], name, { type });
}

async function enqueueFixture(
	overrides: { entityId?: string; clientMutationId?: string } = {},
): Promise<string> {
	return enqueueBlobUpload({
		file: makeFile(),
		entityType: "evidence",
		entityId: overrides.entityId ?? "evidence-1",
		category: "before_photo",
		clientMutationId: overrides.clientMutationId ?? `cmid-${Math.random().toString(36).slice(2)}`,
	});
}

function setConnectivity(value: boolean): void {
	useOfflineStore.getState().setConnectivity(value);
}

describe("blob-outbox-processor", () => {
	beforeEach(async () => {
		installInMemoryIndexedDB();
		await clearBlobOutbox();
		uploadFileMock.mockReset();
		setConnectivity(true);
	});

	afterEach(async () => {
		await clearBlobOutbox();
		uploadFileMock.mockReset();
		setConnectivity(true);
	});

	describe("processBlobOutboxEntry", () => {
		it("returns false (skips) when the connectivity monitor reports offline", async () => {
			setConnectivity(false);
			const id = await enqueueFixture();
			const entry = (await getAllBlobUploads())[0];

			const ok = await processBlobOutboxEntry(entry);

			expect(ok).toBe(false);
			expect(uploadFileMock).not.toHaveBeenCalled();
			// The entry must remain in the outbox untouched.
			const all = await getAllBlobUploads();
			expect(all).toHaveLength(1);
			expect(all[0].id).toBe(id);
			expect(all[0].status).toBe("pending");
		});

		it("on success: marks in_flight, uploads, removes entry, and emits changed event", async () => {
			uploadFileMock.mockResolvedValueOnce({ id: "remote-1" });
			const id = await enqueueFixture();
			const entry = (await getAllBlobUploads())[0];

			const handler = vi.fn();
			window.addEventListener(BLOB_OUTBOX_CHANGED_EVENT, handler);

			const ok = await processBlobOutboxEntry(entry);

			expect(ok).toBe(true);
			expect(uploadFileMock).toHaveBeenCalledTimes(1);
			// The processor must pass offlineLocalId so the backend can dedupe.
			const callArgs = uploadFileMock.mock.calls[0]?.[0] as {
				offlineLocalId?: string;
				file: File;
				category: string;
				entityType: string;
				entityId: string;
			};
			expect(callArgs.offlineLocalId).toBe(id);
			expect(callArgs.file).toBeInstanceOf(File);
			expect(callArgs.file.name).toBe("evidence.jpg");
			expect(callArgs.category).toBe(entry.category);
			expect(callArgs.entityType).toBe(entry.entityType);
			expect(callArgs.entityId).toBe(entry.entityId);

			// Entry is removed on success.
			const all = await getAllBlobUploads();
			expect(all).toHaveLength(0);

			// Changed event must fire on success.
			expect(handler).toHaveBeenCalled();
			window.removeEventListener(BLOB_OUTBOX_CHANGED_EVENT, handler);
		});

		it("on failure: marks the entry failed (increments retry), keeps it in the outbox, emits changed", async () => {
			uploadFileMock.mockRejectedValueOnce(new Error("network down"));
			const id = await enqueueFixture();
			const entry = (await getAllBlobUploads())[0];

			const handler = vi.fn();
			window.addEventListener(BLOB_OUTBOX_CHANGED_EVENT, handler);

			const ok = await processBlobOutboxEntry(entry);

			expect(ok).toBe(false);
			expect(uploadFileMock).toHaveBeenCalledTimes(1);

			// Entry remains, retryCount incremented, lastError recorded.
			const all = await getAllBlobUploads();
			expect(all).toHaveLength(1);
			expect(all[0].id).toBe(id);
			expect(all[0].retryCount).toBe(1);
			expect(all[0].lastError).toBe("network down");
			expect(all[0].status).toBe("pending");

			expect(handler).toHaveBeenCalled();
			window.removeEventListener(BLOB_OUTBOX_CHANGED_EVENT, handler);
		});

		it("handles non-Error rejections by storing a fallback message", async () => {
			uploadFileMock.mockRejectedValueOnce("string failure");
			const id = await enqueueFixture();
			const entry = (await getAllBlobUploads())[0];

			const ok = await processBlobOutboxEntry(entry);

			expect(ok).toBe(false);
			const all = await getAllBlobUploads();
			expect(all[0].lastError).toBe("Error desconocido al subir archivo");
			expect(all[0].id).toBe(id);
		});
	});

	describe("drainBlobOutbox", () => {
		it("returns zero counts and skips work when offline", async () => {
			setConnectivity(false);
			await enqueueFixture();

			const result = await drainBlobOutbox();

			expect(result).toEqual({ succeeded: 0, failed: 0, skipped: 0 });
			expect(uploadFileMock).not.toHaveBeenCalled();
		});

		it("returns zero counts when the outbox is empty", async () => {
			const result = await drainBlobOutbox();
			expect(result).toEqual({ succeeded: 0, failed: 0, skipped: 0 });
		});

		it("processes every pending entry and reports succeeded/failed counts", async () => {
			// 2 success, 1 failure: total 3 entries.
			uploadFileMock
				.mockResolvedValueOnce({ id: "remote-1" })
				.mockRejectedValueOnce(new Error("network"))
				.mockResolvedValueOnce({ id: "remote-3" });

			await enqueueFixture({ clientMutationId: "a" });
			await enqueueFixture({ clientMutationId: "b" });
			await enqueueFixture({ clientMutationId: "c" });

			const result = await drainBlobOutbox();

			expect(result).toEqual({ succeeded: 2, failed: 1, skipped: 0 });
			expect(uploadFileMock).toHaveBeenCalledTimes(3);

			// After drain: 1 entry remains (the one that failed), with retryCount 1.
			const all = await getAllBlobUploads();
			expect(all).toHaveLength(1);
			expect(all[0].retryCount).toBe(1);
			expect(all[0].status).toBe("pending");
		});

		it("marks entries in_flight before attempting upload (prevents concurrent drains)", async () => {
			let resolveUpload: ((value: unknown) => void) | null = null;
			uploadFileMock.mockImplementationOnce(
				() =>
					new Promise((resolve) => {
						resolveUpload = resolve;
					}),
			);

			await enqueueFixture();
			const drainPromise = drainBlobOutbox();
			// Let the microtask queue advance so the entry is marked in_flight.
			await new Promise((r) => setTimeout(r, 0));

			const mid = await getAllBlobUploads();
			expect(mid[0].status).toBe("in_flight");

			// Resolve the in-flight upload.
			(resolveUpload as unknown as (value: unknown) => void)({ id: "remote-1" });
			await drainPromise;

			const after = await getAllBlobUploads();
			expect(after).toHaveLength(0);
		});

		it("transitioned dead_letter entries are not retried by drain", async () => {
			uploadFileMock.mockResolvedValue({ id: "remote-x" });

			const id = await enqueueFixture();
			// Mark in_flight, then fail with maxRetries=1 to dead-letter immediately.
			await markBlobInFlight(id);
			await markBlobFailed(id, "permanent", 1);

			const mid = await getAllBlobUploads();
			expect(mid[0].status).toBe("dead_letter");

			const result = await drainBlobOutbox();

			expect(result).toEqual({ succeeded: 0, failed: 0, skipped: 0 });
			expect(uploadFileMock).not.toHaveBeenCalled();
		});
	});
});
