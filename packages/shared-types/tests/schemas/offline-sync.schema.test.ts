import { describe, expect, it } from "vitest";
import {
	OfflineEntityTypeSchema,
	OfflineFileSchema,
	OfflineOperationTypeSchema,
	OfflineOutboxItemSchema,
	OfflineSyncStatusSchema,
	SyncBatchSchema,
	SyncResultSchema,
} from "../../src/schemas/sync.schema";

const validOutboxItem = {
	localId: "local-planning-001",
	entityType: "planning_packet",
	operation: "create",
	payload: {
		workOrderId: "wo-001",
		scope: "Mantenimiento preventivo de sistema CCTV en campo.",
	},
	status: "pending_sync",
	attempts: 0,
	createdAt: "2026-06-01T15:00:00.000Z",
	updatedAt: "2026-06-01T15:00:00.000Z",
	idempotencyKey: "018f3ef8-a748-7bbd-a32f-5f15d5fd6f32",
	schemaVersion: "offline.v1",
	userId: "user-001",
	workOrderId: "wo-001",
	flowStep: 5,
};

describe("Offline sync contract", () => {
	it("exposes the canonical status, operation and entity enums", () => {
		expect(OfflineSyncStatusSchema.options).toEqual([
			"draft",
			"pending_sync",
			"syncing",
			"synced",
			"failed",
			"conflict",
			"discarded",
		]);
		expect(OfflineOperationTypeSchema.options).toContain("upload_file");
		expect(OfflineEntityTypeSchema.options).toContain("service_entry_sheet");
		expect(OfflineEntityTypeSchema.options).toContain("payment_record");
	});

	it("accepts a typed planning packet outbox item", () => {
		const parsed = OfflineOutboxItemSchema.parse(validOutboxItem);
		expect(parsed.entityType).toBe("planning_packet");
		expect(parsed.status).toBe("pending_sync");
	});

	it("rejects unsupported flow steps", () => {
		expect(() =>
			OfflineOutboxItemSchema.parse({
				...validOutboxItem,
				flowStep: 15,
			}),
		).toThrow();
	});

	it("validates offline file metadata without requiring the Blob in the shared contract", () => {
		const file = OfflineFileSchema.parse({
			localId: "file-local-001",
			workOrderId: "wo-001",
			entityType: "evidence",
			entityId: "ev-001",
			flowStep: 6,
			fileName: "antes.jpg",
			mimeType: "image/jpeg",
			sizeBytes: 124_000,
			hash: "sha256:local",
			category: "before_photo",
			status: "pending_upload",
			createdAt: "2026-06-01T15:00:00.000Z",
			updatedAt: "2026-06-01T15:00:00.000Z",
			idempotencyKey: "018f3ef8-a748-7bbd-a32f-5f15d5fd6f33",
		});

		expect(file.status).toBe("pending_upload");
	});

	it("accepts a batch with modern outbox items and item-level results", () => {
		const batch = SyncBatchSchema.parse({
			batchId: "batch-001",
			operations: [validOutboxItem],
		});
		expect(batch.operations).toHaveLength(1);

		const result = SyncResultSchema.parse({
			batchId: "batch-001",
			results: [
				{
					localId: "local-planning-001",
					status: "synced",
					serverId: "planning-001",
				},
			],
			processed: 1,
			failed: 0,
			errors: [],
		});
		expect(result.results[0]?.status).toBe("synced");
	});
});
