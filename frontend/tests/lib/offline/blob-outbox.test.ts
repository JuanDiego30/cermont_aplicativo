/**
 * Tests for the blob-outbox IndexedDB store.
 *
 * Covers the public surface of `frontend/src/lib/offline/blob-outbox.ts`:
 *   - enqueueBlobUpload (idempotency on clientMutationId, excluding dead letters)
 *   - getPendingBlobUploads / getAllBlobUploads / getBlobUploadsByEntity
 *   - getPendingBlobCount
 *   - markBlobInFlight (no-op on missing id)
 *   - markBlobUploaded (removes entry from store)
 *   - markBlobFailed (increments retry, transitions to dead_letter at maxRetries)
 *   - removeBlobUpload / clearBlobOutbox
 *   - BLOB_OUTBOX_CHANGED_EVENT dispatched on mutations
 *
 * The Vitest jsdom environment does not provide `indexedDB`, so the test
 * file installs a minimal in-memory shim from
 * `./_in-memory-indexeddb.ts` before any outbox code is imported.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installInMemoryIndexedDB } from "./_in-memory-indexeddb";

installInMemoryIndexedDB();

const {
	BLOB_OUTBOX_CHANGED_EVENT,
	clearBlobOutbox,
	enqueueBlobUpload,
	getAllBlobUploads,
	getBlobUploadsByEntity,
	getPendingBlobCount,
	getPendingBlobUploads,
	markBlobFailed,
	markBlobInFlight,
	markBlobUploaded,
	removeBlobUpload,
	retryBlobUpload,
} = await import("@/lib/offline/blob-outbox");

function makeFile(name = "evidence.jpg", type = "image/jpeg"): File {
	return new File([new Uint8Array([0xff, 0xd8, 0xff])], name, { type });
}

interface EnqueueArgs {
	file?: File;
	entityType?: string;
	entityId?: string;
	category?: string;
	clientMutationId?: string;
	description?: string;
	tags?: string[];
}

async function enqueueFixture(overrides: EnqueueArgs = {}): Promise<string> {
	return enqueueBlobUpload({
		file: overrides.file ?? makeFile(),
		entityType: overrides.entityType ?? "evidence",
		entityId: overrides.entityId ?? "evidence-1",
		category: overrides.category ?? "before_photo",
		clientMutationId: overrides.clientMutationId ?? `cmid-${Math.random().toString(36).slice(2)}`,
		description: overrides.description,
		tags: overrides.tags,
	});
}

describe("blob-outbox", () => {
	beforeEach(async () => {
		installInMemoryIndexedDB();
		await clearBlobOutbox();
	});

	afterEach(async () => {
		await clearBlobOutbox();
	});

	describe("enqueueBlobUpload", () => {
		it("persists a new entry and returns its id", async () => {
			const id = await enqueueFixture();

			expect(id).toMatch(/^blob-\d+-[a-z0-9]+$/);
			const all = await getAllBlobUploads();
			expect(all).toHaveLength(1);
			expect(all[0].id).toBe(id);
			expect(all[0].status).toBe("pending");
			expect(all[0].retryCount).toBe(0);
		});

		it("is idempotent on clientMutationId (returns existing id)", async () => {
			const clientMutationId = "cmid-shared";
			const firstId = await enqueueFixture({ clientMutationId });
			const secondId = await enqueueFixture({ clientMutationId });

			expect(secondId).toBe(firstId);
			const all = await getAllBlobUploads();
			expect(all).toHaveLength(1);
		});

		it("allows re-enqueue when the previous entry is in dead_letter", async () => {
			const clientMutationId = "cmid-retry-after-dead-letter";
			const firstId = await enqueueFixture({ clientMutationId });
			// Force dead letter (low maxRetries for speed)
			await markBlobInFlight(firstId);
			for (let i = 0; i < 3; i += 1) {
				await markBlobFailed(firstId, "boom", 3);
			}
			const allAfterFail = await getAllBlobUploads();
			expect(allAfterFail[0].status).toBe("dead_letter");

			const secondId = await enqueueFixture({ clientMutationId });
			expect(secondId).not.toBe(firstId);
			const all = await getAllBlobUploads();
			expect(all).toHaveLength(2);
		});

		it("dispatches the BLOB_OUTBOX_CHANGED_EVENT on enqueue", async () => {
			const handler = vi.fn();
			window.addEventListener(BLOB_OUTBOX_CHANGED_EVENT, handler);

			await enqueueFixture();

			expect(handler).toHaveBeenCalled();
			window.removeEventListener(BLOB_OUTBOX_CHANGED_EVENT, handler);
		});
	});

	describe("queries", () => {
		beforeEach(async () => {
			await enqueueFixture({ entityType: "evidence", entityId: "e-1" });
			await enqueueFixture({ entityType: "evidence", entityId: "e-2" });
			await enqueueFixture({ entityType: "delivery_record", entityId: "dr-1" });
		});

		it("getPendingBlobUploads returns only pending and in_flight entries", async () => {
			const all = await getAllBlobUploads();
			await markBlobInFlight(all[0].id);
			await markBlobFailed(all[0].id, "x", 1); // becomes dead_letter immediately

			const pending = await getPendingBlobUploads();
			expect(pending).toHaveLength(2);
			expect(pending.every((e) => e.status === "pending" || e.status === "in_flight")).toBe(true);
		});

		it("getBlobUploadsByEntity filters by entityType and entityId", async () => {
			const forEvidence1 = await getBlobUploadsByEntity("evidence", "e-1");
			expect(forEvidence1).toHaveLength(1);
			expect(forEvidence1[0].entityId).toBe("e-1");

			const forDr1 = await getBlobUploadsByEntity("delivery_record", "dr-1");
			expect(forDr1).toHaveLength(1);

			const forUnknown = await getBlobUploadsByEntity("evidence", "missing");
			expect(forUnknown).toHaveLength(0);
		});

		it("getPendingBlobCount returns the number of pending entries", async () => {
			expect(await getPendingBlobCount()).toBe(3);

			const all = await getAllBlobUploads();
			await markBlobUploaded(all[0].id);
			expect(await getPendingBlobCount()).toBe(2);
		});
	});

	describe("markBlobInFlight", () => {
		it("updates the entry status to in_flight", async () => {
			const id = await enqueueFixture();

			await markBlobInFlight(id);

			const all = await getAllBlobUploads();
			expect(all[0].status).toBe("in_flight");
		});

		it("is a no-op when the id is unknown", async () => {
			await markBlobInFlight("nonexistent-id");
			const all = await getAllBlobUploads();
			expect(all).toHaveLength(0);
		});
	});

	describe("markBlobUploaded", () => {
		it("removes the entry from the outbox", async () => {
			const id = await enqueueFixture();
			expect(await getAllBlobUploads()).toHaveLength(1);

			await markBlobUploaded(id);

			expect(await getAllBlobUploads()).toHaveLength(0);
		});
	});

	describe("markBlobFailed", () => {
		it("returns null and does nothing when the id is unknown", async () => {
			const result = await markBlobFailed("nonexistent-id", "boom");
			expect(result).toBeNull();
		});

		it("increments retryCount and sets lastError while staying pending", async () => {
			const id = await enqueueFixture();
			await markBlobInFlight(id);

			const updated = await markBlobFailed(id, "network down", 5);

			expect(updated).not.toBeNull();
			expect(updated?.retryCount).toBe(1);
			expect(updated?.lastError).toBe("network down");
			expect(updated?.status).toBe("pending");

			const all = await getAllBlobUploads();
			expect(all[0].status).toBe("pending");
		});

		it("transitions to dead_letter once retryCount reaches maxRetries", async () => {
			const id = await enqueueFixture();
			await markBlobInFlight(id);

			await markBlobFailed(id, "fail 1", 2);
			const first = await getAllBlobUploads();
			expect(first[0].status).toBe("pending");
			expect(first[0].retryCount).toBe(1);

			await markBlobFailed(id, "fail 2", 2);
			const second = await getAllBlobUploads();
			expect(second[0].status).toBe("dead_letter");
			expect(second[0].retryCount).toBe(2);
			expect(second[0].lastError).toBe("fail 2");
		});

		it("returns a dead-letter upload to the pending queue", async () => {
			const id = await enqueueFixture();
			await markBlobFailed(id, "permanent failure", 1);

			await retryBlobUpload(id);

			const retried = (await getAllBlobUploads())[0];
			expect(retried.status).toBe("pending");
			expect(retried.retryCount).toBe(0);
			expect(retried.lastError).toBeUndefined();
		});
	});

	describe("removeBlobUpload and clearBlobOutbox", () => {
		it("removeBlobUpload removes a single entry", async () => {
			const id1 = await enqueueFixture();
			await enqueueFixture();

			await removeBlobUpload(id1);

			const all = await getAllBlobUploads();
			expect(all).toHaveLength(1);
			expect(all[0].id).not.toBe(id1);
		});

		it("clearBlobOutbox removes all entries", async () => {
			await enqueueFixture();
			await enqueueFixture();
			await enqueueFixture();
			expect(await getAllBlobUploads()).toHaveLength(3);

			await clearBlobOutbox();

			expect(await getAllBlobUploads()).toHaveLength(0);
		});
	});
});
