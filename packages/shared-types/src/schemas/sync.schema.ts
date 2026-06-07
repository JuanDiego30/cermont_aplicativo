import { z } from "zod";
import { OfflineEvidencePayloadSchema } from "./evidence.schema";
import { CreateExecutionSessionSchema } from "./execution-session.schema";
import { CreatePlanningPacketSchema } from "./planning-packet.schema";
import { CreateSiteVisitRecordSchema } from "./site-visit.schema";
import { CreateWorkRequestSchema } from "./work-request.schema";

// ──────────────────────────────────────────────────────────────────────────────
// Typed JSON payloads for offline storage
// ──────────────────────────────────────────────────────────────────────────────

export type OfflineJsonPrimitive = string | number | boolean;
export type OfflineJsonValue = OfflineJsonPrimitive | OfflineJsonValue[] | OfflineJsonObject;
export interface OfflineJsonObject {
	[key: string]: OfflineJsonValue;
}

export const OfflineJsonValueSchema: z.ZodType<OfflineJsonValue> = z.lazy(() =>
	z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.array(OfflineJsonValueSchema),
		z.record(z.string(), OfflineJsonValueSchema),
	]),
);

export const OfflineJsonObjectSchema: z.ZodType<OfflineJsonObject> = z.record(
	z.string(),
	OfflineJsonValueSchema,
);

// ──────────────────────────────────────────────────────────────────────────────
// Canonical offline contract
// ──────────────────────────────────────────────────────────────────────────────

export const OfflineSyncStatusSchema = z.enum([
	"draft",
	"pending_sync",
	"syncing",
	"synced",
	"failed",
	"conflict",
	"discarded",
]);
export type OfflineSyncStatus = z.infer<typeof OfflineSyncStatusSchema>;

export const OfflineOperationTypeSchema = z.enum([
	"create",
	"update",
	"delete",
	"upload_file",
	"submit_form",
	"transition_state",
]);
export type OfflineOperationType = z.infer<typeof OfflineOperationTypeSchema>;

export const OfflineEntityTypeSchema = z.enum([
	"work_request",
	"site_visit",
	"proposal",
	"purchase_order",
	"work_order",
	"planning_packet",
	"execution_session",
	"checklist_submission",
	"evidence",
	"technical_report",
	"delivery_record",
	"client_acceptance",
	"service_entry_sheet",
	"invoice",
	"invoice_approval",
	"payment_record",
	"cost_record",
	"document_evidence",
	"form_submission",
]);
export type OfflineEntityType = z.infer<typeof OfflineEntityTypeSchema>;

export const OfflineConflictSchema = z
	.object({
		reason: z.string().min(1),
		serverVersion: z.number().int().min(0).optional(),
		localVersion: z.number().int().min(0).optional(),
		serverState: z.string().min(1).optional(),
		localState: z.string().min(1).optional(),
	})
	.strip();
export type OfflineConflict = z.infer<typeof OfflineConflictSchema>;

export const OfflineOutboxItemSchema = z
	.object({
		localId: z.string().min(1),
		serverId: z.string().min(1).optional(),
		entityType: OfflineEntityTypeSchema,
		operation: OfflineOperationTypeSchema,
		payload: OfflineJsonObjectSchema,
		status: OfflineSyncStatusSchema.default("pending_sync"),
		attempts: z.number().int().min(0).default(0),
		lastError: z.string().min(1).optional(),
		nextRetryAt: z.number().int().min(0).optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
		syncedAt: z.string().datetime().optional(),
		idempotencyKey: z.string().uuid(),
		schemaVersion: z.string().min(1).default("offline.v1"),
		userId: z.string().min(1),
		workOrderId: z.string().min(1).optional(),
		flowStep: z.number().int().min(1).max(14).optional(),
		endpoint: z.string().min(1).optional(),
		method: z.enum(["POST", "PATCH", "PUT", "DELETE"]).optional(),
	})
	.strip();
export type OfflineOutboxItem = z.infer<typeof OfflineOutboxItemSchema>;

export const OfflineFileSchema = z
	.object({
		localId: z.string().min(1),
		outboxLocalId: z.string().min(1).optional(),
		workOrderId: z.string().min(1),
		entityType: OfflineEntityTypeSchema,
		entityId: z.string().min(1),
		flowStep: z.number().int().min(1).max(14),
		fileName: z.string().min(1),
		mimeType: z.string().min(1),
		sizeBytes: z.number().int().min(1),
		hash: z.string().min(1).optional(),
		category: z.string().min(1),
		status: z.enum(["local_only", "pending_upload", "uploading", "uploaded", "failed", "conflict"]),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
		idempotencyKey: z.string().uuid(),
	})
	.strip();
export type OfflineFile = z.infer<typeof OfflineFileSchema>;

export const OfflineDraftSchema = z
	.object({
		localId: z.string().min(1),
		entityType: OfflineEntityTypeSchema,
		workOrderId: z.string().min(1).optional(),
		userId: z.string().min(1),
		payload: OfflineJsonObjectSchema,
		status: OfflineSyncStatusSchema.default("draft"),
		schemaVersion: z.string().min(1).default("offline.v1"),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strip();
export type OfflineDraft = z.infer<typeof OfflineDraftSchema>;

export const OfflineFormSnapshotSchema = z
	.object({
		localId: z.string().min(1),
		formTemplateId: z.string().min(1),
		formVersion: z.string().min(1),
		workOrderId: z.string().min(1),
		userId: z.string().min(1),
		payload: OfflineJsonObjectSchema,
		status: OfflineSyncStatusSchema.default("draft"),
		updatedAt: z.string().datetime(),
	})
	.strip();
export type OfflineFormSnapshot = z.infer<typeof OfflineFormSnapshotSchema>;

export const OfflineSyncItemResultSchema = z
	.object({
		localId: z.string().min(1),
		status: z.enum(["synced", "failed", "conflict"]),
		serverId: z.string().min(1).optional(),
		error: z.string().min(1).optional(),
		conflict: OfflineConflictSchema.optional(),
	})
	.strip();
export type OfflineSyncItemResult = z.infer<typeof OfflineSyncItemResultSchema>;

// Lowercase aliases requested by the offline implementation plan.
export const offlineSyncStatus = OfflineSyncStatusSchema;
export const offlineOperationType = OfflineOperationTypeSchema;
export const offlineEntityType = OfflineEntityTypeSchema;
export const offlineOutboxItemSchema = OfflineOutboxItemSchema;
export const offlineFileSchema = OfflineFileSchema;
export const offlineDraftSchema = OfflineDraftSchema;
export const offlineConflictSchema = OfflineConflictSchema;

// ──────────────────────────────────────────────────────────────────────────────
// Legacy operation support
// ──────────────────────────────────────────────────────────────────────────────

export const OfflineActionSchema = z.enum(["create", "update", "delete"]);
export type OfflineAction = z.infer<typeof OfflineActionSchema>;

export const LegacyOfflineEntityTypeSchema = z.enum([
	"order",
	"work-request",
	"site-visit",
	"checklist",
	"evidence",
	"planning-packet",
	"execution-session",
	"cost",
	"delivery-record",
	"service-entry-sheet",
	"invoice",
	"payment",
	"technical-report",
	"purchase-order",
]);
export type LegacyOfflineEntityType = z.infer<typeof LegacyOfflineEntityTypeSchema>;

export const OfflineWorkRequestPayloadSchema = CreateWorkRequestSchema.extend({
	clientMutationId: z.string().uuid().optional(),
});
export type OfflineWorkRequestPayload = z.infer<typeof OfflineWorkRequestPayloadSchema>;

export const OfflineSiteVisitPayloadSchema = CreateSiteVisitRecordSchema.extend({
	clientMutationId: z.string().uuid().optional(),
});
export type OfflineSiteVisitPayload = z.infer<typeof OfflineSiteVisitPayloadSchema>;

export const OfflinePlanningPacketPayloadSchema = CreatePlanningPacketSchema.extend({
	clientMutationId: z.string().uuid().optional(),
});
export type OfflinePlanningPacketPayload = z.infer<typeof OfflinePlanningPacketPayloadSchema>;

export const OfflineExecutionPayloadSchema = CreateExecutionSessionSchema;
export type OfflineExecutionPayload = z.infer<typeof OfflineExecutionPayloadSchema>;

const LegacyOperationBaseSchema = z
	.object({
		id: z.string().min(1),
		action: OfflineActionSchema,
		timestamp: z.string().datetime(),
	})
	.strip();

export const LegacyOfflineOperationSchema = z.discriminatedUnion("type", [
	LegacyOperationBaseSchema.extend({
		type: z.literal("work-request"),
		payload: OfflineWorkRequestPayloadSchema,
	}),
	LegacyOperationBaseSchema.extend({
		type: z.literal("site-visit"),
		payload: OfflineSiteVisitPayloadSchema,
	}),
	LegacyOperationBaseSchema.extend({
		type: z.literal("planning-packet"),
		payload: OfflinePlanningPacketPayloadSchema,
	}),
	LegacyOperationBaseSchema.extend({
		type: z.literal("evidence"),
		payload: OfflineEvidencePayloadSchema,
	}),
	LegacyOperationBaseSchema.extend({
		type: z.literal("execution-session"),
		payload: OfflineExecutionPayloadSchema,
	}),
	LegacyOperationBaseSchema.extend({
		type: z.literal("order"),
		payload: OfflineJsonObjectSchema,
	}),
	LegacyOperationBaseSchema.extend({
		type: z.literal("checklist"),
		payload: OfflineJsonObjectSchema,
	}),
	LegacyOperationBaseSchema.extend({
		type: z.literal("cost"),
		payload: OfflineJsonObjectSchema,
	}),
	LegacyOperationBaseSchema.extend({
		type: z.literal("delivery-record"),
		payload: OfflineJsonObjectSchema,
	}),
	LegacyOperationBaseSchema.extend({
		type: z.literal("service-entry-sheet"),
		payload: OfflineJsonObjectSchema,
	}),
	LegacyOperationBaseSchema.extend({
		type: z.literal("invoice"),
		payload: OfflineJsonObjectSchema,
	}),
	LegacyOperationBaseSchema.extend({
		type: z.literal("payment"),
		payload: OfflineJsonObjectSchema,
	}),
	LegacyOperationBaseSchema.extend({
		type: z.literal("technical-report"),
		payload: OfflineJsonObjectSchema,
	}),
	LegacyOperationBaseSchema.extend({
		type: z.literal("purchase-order"),
		payload: OfflineJsonObjectSchema,
	}),
]);

export type LegacyOfflineOperation = z.infer<typeof LegacyOfflineOperationSchema>;

export const OfflineOperationSchema = z.union([
	OfflineOutboxItemSchema,
	LegacyOfflineOperationSchema,
]);
export type OfflineOperation = z.infer<typeof OfflineOperationSchema>;

export const SyncBatchSchema = z
	.object({
		batchId: z.string().min(1).optional(),
		operations: z.array(OfflineOperationSchema).min(1).max(100),
	})
	.strip();

export type SyncBatch = z.infer<typeof SyncBatchSchema>;

export const SyncErrorSchema = z
	.object({
		id: z.string().min(1),
		error: z.string().min(1),
	})
	.strip();

export type SyncError = z.infer<typeof SyncErrorSchema>;

export const SyncResultSchema = z
	.object({
		batchId: z.string().min(1),
		results: z.array(OfflineSyncItemResultSchema),
		processed: z.number().int().min(0),
		failed: z.number().int().min(0),
		errors: z.array(SyncErrorSchema),
	})
	.strip();

export type SyncResult = z.infer<typeof SyncResultSchema>;
