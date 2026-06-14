/**
 * Sync Service Tests — Offline Synchronization
 *
 * Tests the offline sync batch processing logic:
 * - processSyncBatch: Batch processing with error tolerance
 * - applyOperation: Entity routing (order, checklist, evidence)
 * - Order operations: create, update via sync
 * - Checklist operations: create, update via sync
 * - Evidence operations: create via sync
 * - Error handling: Individual failures don't stop the batch
 *
 * Uses vitest mocks for dependent services.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../src/common/errors/AppError";
import * as ChecklistSvc from "../../src/modules/checklist/checklist.service";
import * as EvidenceSvc from "../../src/modules/evidence/evidence.service";
import * as OrderSvc from "../../src/modules/order/order.service";
import * as OrderCRUD from "../../src/modules/order/order-crud.service";
import { type OfflineOperation, processSyncBatch } from "../../src/modules/sync/sync.service";

// Mock dependent services
vi.mock("../../src/modules/order/order.service", () => ({
	createOrder: vi.fn(),
	updateOrderStatus: vi.fn(),
}));

vi.mock("../../src/modules/checklist/checklist.service", () => ({
	createChecklist: vi.fn(),
	updateChecklistItem: vi.fn(),
}));

vi.mock("../../src/modules/evidence/evidence.service", () => ({
	createEvidenceV2: vi.fn(),
}));

vi.mock("../../src/modules/order/order-crud.service", () => ({
	getOrderByIdWithAuth: vi.fn(),
}));

vi.mock("../../src/common/utils/logger", () => ({
	createLogger: vi.fn().mockReturnValue({
		info: vi.fn(),
		error: vi.fn(),
	}),
}));

vi.mock("../../src/modules/order/administrative-workflow.service", () => ({
	createTechnicalReportFromExecutionSession: vi.fn(),
	updateTechnicalReport: vi.fn(),
	createDeliveryRecordFromTechnicalReport: vi.fn(),
	signDeliveryRecord: vi.fn(),
	sendDeliveryRecord: vi.fn(),
	createServiceEntrySheetFromDeliveryRecord: vi.fn(),
	submitServiceEntrySheet: vi.fn(),
	createInvoiceFromServiceEntrySheet: vi.fn(),
	submitInvoice: vi.fn(),
	registerPaymentForInvoice: vi.fn(),
	reconcilePayment: vi.fn(),
}));

vi.mock("../../src/modules/cost/cost.service", () => ({
	createCost: vi.fn(),
	updateCost: vi.fn(),
}));

vi.mock("../../src/modules/purchase-order/purchase-order.service", () => ({
	registerPurchaseOrder: vi.fn(),
}));

vi.mock("../../src/models", () => ({
	TechnicalReport: { findOne: vi.fn().mockResolvedValue(null) },
	DeliveryRecord: { findOne: vi.fn().mockResolvedValue(null) },
	ServiceEntrySheet: { findOne: vi.fn().mockResolvedValue(null) },
	Invoice: { findOne: vi.fn().mockResolvedValue(null) },
	Payment: { findOne: vi.fn().mockResolvedValue(null) },
	Cost: { findOne: vi.fn().mockResolvedValue(null) },
}));

vi.mock("../../src/models/PurchaseOrder", () => ({
	PurchaseOrderModel: { findOne: vi.fn().mockResolvedValue(null) },
}));

describe("SyncService", () => {
	const mockActorId = "507f1f77bcf86cd799439011";
	const mockActorRole = "tecnico";

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("processSyncBatch", () => {
		it("should process a batch of order creation operations", async () => {
			vi.mocked(OrderSvc.createOrder).mockResolvedValue({} as never);

			const operations: OfflineOperation[] = [
				{
					id: "op-1",
					type: "order",
					action: "create",
					payload: {
						type: "maintenance",
						priority: "high",
						description: "Synced order description with enough characters",
						assetId: "ASSET-001",
						assetName: "Test Asset",
						location: "Test Location",
					},
					timestamp: new Date().toISOString(),
					actorId: mockActorId,
				},
			];

			const result = await processSyncBatch(operations, mockActorRole, mockActorId);

			expect(result.processed).toBe(1);
			expect(result.failed).toBe(0);
			expect(result.errors).toHaveLength(0);
			expect(OrderSvc.createOrder).toHaveBeenCalledTimes(1);
		});

		it("should process a batch of order status updates", async () => {
			vi.mocked(OrderSvc.updateOrderStatus).mockResolvedValue({} as never);

			const operations: OfflineOperation[] = [
				{
					id: "op-2",
					type: "order",
					action: "update",
					payload: {
						id: "507f1f77bcf86cd799439012",
						status: "in_progress",
						observations: "Started work",
					},
					timestamp: new Date().toISOString(),
				},
			];

			const result = await processSyncBatch(operations, mockActorRole, mockActorId);

			expect(result.processed).toBe(1);
			expect(OrderSvc.updateOrderStatus).toHaveBeenCalledWith(
				"507f1f77bcf86cd799439012",
				"in_progress",
				mockActorRole,
				mockActorId,
				"Started work",
			);
		});

		it("should process checklist creation operations", async () => {
			vi.mocked(ChecklistSvc.createChecklist).mockResolvedValue({} as never);

			const operations: OfflineOperation[] = [
				{
					id: "op-3",
					type: "checklist",
					action: "create",
					payload: {
						orderId: "507f1f77bcf86cd799439013",
					},
					timestamp: new Date().toISOString(),
				},
			];

			const result = await processSyncBatch(operations, mockActorRole, mockActorId);

			expect(result.processed).toBe(1);
			expect(ChecklistSvc.createChecklist).toHaveBeenCalledWith(
				"507f1f77bcf86cd799439013",
				mockActorId,
			);
		});

		it("should process checklist item updates", async () => {
			vi.mocked(ChecklistSvc.updateChecklistItem).mockResolvedValue({} as never);

			const operations: OfflineOperation[] = [
				{
					id: "op-4",
					type: "checklist",
					action: "update",
					payload: {
						checklistId: "507f1f77bcf86cd799439014",
						itemId: "item-1",
						completed: true,
						observation: "All clear",
					},
					timestamp: new Date().toISOString(),
				},
			];

			const result = await processSyncBatch(operations, mockActorRole, mockActorId);

			expect(result.processed).toBe(1);
			expect(ChecklistSvc.updateChecklistItem).toHaveBeenCalled();
		});

		it("should handle mixed entity types in a single batch", async () => {
			vi.mocked(OrderSvc.createOrder).mockResolvedValue({} as never);
			vi.mocked(ChecklistSvc.createChecklist).mockResolvedValue({} as never);

			const operations: OfflineOperation[] = [
				{
					id: "op-5",
					type: "order",
					action: "create",
					payload: {
						type: "inspection",
						priority: "medium",
						description: "Inspection order from offline sync",
						assetId: "ASSET-002",
						assetName: "Pump Station",
						location: "Building A",
					},
					timestamp: new Date().toISOString(),
				},
				{
					id: "op-6",
					type: "checklist",
					action: "create",
					payload: {
						orderId: "507f1f77bcf86cd799439015",
						checklistType: "pre-work",
					},
					timestamp: new Date().toISOString(),
				},
			];

			const result = await processSyncBatch(operations, mockActorRole, mockActorId);

			expect(result.processed).toBe(2);
			expect(result.failed).toBe(0);
		});

		it("should continue processing when individual operations fail", async () => {
			vi.mocked(OrderSvc.createOrder)
				.mockRejectedValueOnce(new AppError("Order creation failed", 500, "ORDER_CREATE_FAILED"))
				.mockResolvedValue({} as never);

			const operations: OfflineOperation[] = [
				{
					id: "op-fail-1",
					type: "order",
					action: "create",
					payload: {
						type: "maintenance",
						priority: "high",
						description: "First order that will fail",
						assetId: "BAD-ASSET",
						assetName: "Bad Asset",
						location: "Bad Location",
					},
					timestamp: new Date().toISOString(),
				},
				{
					id: "op-success-1",
					type: "order",
					action: "create",
					payload: {
						type: "maintenance",
						priority: "medium",
						description: "Second order that should succeed",
						assetId: "GOOD-ASSET",
						assetName: "Good Asset",
						location: "Good Location",
					},
					timestamp: new Date().toISOString(),
				},
			];

			const result = await processSyncBatch(operations, mockActorRole, mockActorId);

			expect(result.processed).toBe(1);
			expect(result.failed).toBe(1);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].id).toBe("op-fail-1");
		});

		it("should report errors for missing required fields in order update", async () => {
			const operations: OfflineOperation[] = [
				{
					id: "op-missing",
					type: "order",
					action: "update",
					payload: {
						// Missing id and status
						observations: "Incomplete update",
					},
					timestamp: new Date().toISOString(),
				},
			];

			const result = await processSyncBatch(operations, mockActorRole, mockActorId);

			expect(result.failed).toBe(1);
			expect(result.errors[0].error).toContain("id and status");
		});

		it("should return zero processed for empty batch", async () => {
			const result = await processSyncBatch([], mockActorRole, mockActorId);

			expect(result.processed).toBe(0);
			expect(result.failed).toBe(0);
			expect(result.errors).toHaveLength(0);
		});

		it("should route technical-report operations to the handler", async () => {
			// technical-report is now implemented via applyTechnicalReportOperation.
			// The operation may fail due to mocked services, but the batch should
			// not crash and should report the result.
			const operations: OfflineOperation[] = [
				{
					id: "op-technical",
					type: "technical-report",
					action: "create",
					payload: {
						executionSessionId: "507f1f77bcf86cd799439011",
					},
					timestamp: new Date().toISOString(),
				},
			];

			const result = await processSyncBatch(operations, mockActorRole, mockActorId);

			expect(result.results).toHaveLength(1);
			expect(result.batchId).toBeDefined();
		});

		it("should reject unsupported actions for known entities", async () => {
			const operations: OfflineOperation[] = [
				{
					id: "op-bad-action",
					type: "order",
					action: "delete" as never,
					payload: { id: "some-id" },
					timestamp: new Date().toISOString(),
				},
			];

			const result = await processSyncBatch(operations, mockActorRole, mockActorId);

			expect(result.failed).toBe(1);
			expect(result.errors[0].error).toContain("not supported");
		});

		it("rejects RIFF payloads that are not valid WebP images", async () => {
			vi.mocked(OrderCRUD.getOrderByIdWithAuth).mockResolvedValue({} as never);
			const invalidRiff = Buffer.from("RIFF0000NOT_WEBP", "ascii").toString("base64");
			const operations: OfflineOperation[] = [
				{
					id: "offline-evidence-invalid-riff",
					type: "evidence",
					action: "create",
					payload: {
						serviceCaseId: "507f1f77bcf86cd799439012",
						phase: "during",
						category: "progress",
						mimeType: "image/webp",
						temporaryUrl: invalidRiff,
						uploadedBy: mockActorId,
						capturedAt: "2026-06-11T12:00:00.000Z",
						offlineCapturedAt: "2026-06-11T12:00:00.000Z",
						clientMutationId: "550e8400-e29b-41d4-a716-446655440000",
					},
					timestamp: "2026-06-11T12:00:00.000Z",
				},
			];

			const result = await processSyncBatch(operations, mockActorRole, mockActorId);

			expect(result.failed).toBe(1);
			expect(result.results[0].status).toBe("failed");
			expect(EvidenceSvc.createEvidenceV2).not.toHaveBeenCalled();
		});

		it("uses the canonical 20 MB evidence limit for offline sync", async () => {
			vi.mocked(OrderCRUD.getOrderByIdWithAuth).mockResolvedValue({} as never);
			const oversizedPng = Buffer.alloc(20 * 1024 * 1024 + 1);
			oversizedPng.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
			const operations: OfflineOperation[] = [
				{
					id: "offline-evidence-too-large",
					type: "evidence",
					action: "create",
					payload: {
						serviceCaseId: "507f1f77bcf86cd799439012",
						phase: "during",
						category: "progress",
						mimeType: "image/png",
						temporaryUrl: oversizedPng.toString("base64"),
						uploadedBy: mockActorId,
						capturedAt: "2026-06-11T12:00:00.000Z",
						offlineCapturedAt: "2026-06-11T12:00:00.000Z",
						clientMutationId: "550e8400-e29b-41d4-a716-446655440001",
					},
					timestamp: "2026-06-11T12:00:00.000Z",
				},
			];

			const result = await processSyncBatch(operations, mockActorRole, mockActorId);

			expect(result.failed).toBe(1);
			expect(result.errors[0].error).toContain("20MB");
			expect(EvidenceSvc.createEvidenceV2).not.toHaveBeenCalled();
		});
	});
});
