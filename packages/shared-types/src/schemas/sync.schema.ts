import { z } from "zod";
import { OfflineEvidencePayloadSchema } from "./evidence.schema";
import { CreateExecutionSessionSchema } from "./execution-session.schema";
import { CreatePlanningPacketSchema } from "./planning-packet.schema";
import { CreateSiteVisitRecordSchema } from "./site-visit.schema";
import { CreateWorkRequestSchema } from "./work-request.schema";

// ──────────────────────────────────────────────────────────────────────────────
// Offline Action Types
// ──────────────────────────────────────────────────────────────────────────────

export const OfflineActionSchema = z.enum(["create", "update", "delete"]);
export type OfflineAction = z.infer<typeof OfflineActionSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Offline Entity Types — Extended to support all 14 operational flow entities
// ──────────────────────────────────────────────────────────────────────────────

export const OfflineEntityTypeSchema = z.enum([
	"order",
	"work-request",
	"site-visit",
	"checklist",
	"evidence",
	"planning-packet",
	"cost",
	"delivery-record",
	"service-entry-sheet",
	"invoice",
	"payment",
	"technical-report",
	"purchase-order",
]);
export type OfflineEntityType = z.infer<typeof OfflineEntityTypeSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Discriminated Unions for Offline Payloads
// ──────────────────────────────────────────────────────────────────────────────

// Work Request offline payload
export const OfflineWorkRequestPayloadSchema = CreateWorkRequestSchema.extend({
	clientMutationId: z.string().uuid().optional(),
});
export type OfflineWorkRequestPayload = z.infer<typeof OfflineWorkRequestPayloadSchema>;

// Site Visit offline payload
export const OfflineSiteVisitPayloadSchema = CreateSiteVisitRecordSchema.extend({
	clientMutationId: z.string().uuid().optional(),
});
export type OfflineSiteVisitPayload = z.infer<typeof OfflineSiteVisitPayloadSchema>;

// Planning Packet offline payload
export const OfflinePlanningPacketPayloadSchema = CreatePlanningPacketSchema.extend({
	clientMutationId: z.string().uuid().optional(),
});
export type OfflinePlanningPacketPayload = z.infer<typeof OfflinePlanningPacketPayloadSchema>;

// Execution Session offline payload
export const OfflineExecutionPayloadSchema = CreateExecutionSessionSchema;
export type OfflineExecutionPayload = z.infer<typeof OfflineExecutionPayloadSchema>;

// Evidence offline payload (already defined in evidence.schema.ts)
// export type OfflineEvidencePayload = OfflineEvidencePayload;

// ──────────────────────────────────────────────────────────────────────────────
// Discriminated Union for Offline Operations
// ──────────────────────────────────────────────────────────────────────────────

export const OfflineOperationSchema = z.discriminatedUnion("type", [
	z.object({
		id: z.string().uuid(),
		type: z.literal("work-request"),
		action: OfflineActionSchema,
		payload: OfflineWorkRequestPayloadSchema,
		timestamp: z.string().datetime(),
	}),
	z.object({
		id: z.string().uuid(),
		type: z.literal("site-visit"),
		action: OfflineActionSchema,
		payload: OfflineSiteVisitPayloadSchema,
		timestamp: z.string().datetime(),
	}),
	z.object({
		id: z.string().uuid(),
		type: z.literal("planning-packet"),
		action: OfflineActionSchema,
		payload: OfflinePlanningPacketPayloadSchema,
		timestamp: z.string().datetime(),
	}),
	z.object({
		id: z.string().uuid(),
		type: z.literal("evidence"),
		action: OfflineActionSchema,
		payload: OfflineEvidencePayloadSchema,
		timestamp: z.string().datetime(),
	}),
	z.object({
		id: z.string().uuid(),
		type: z.literal("execution-session"),
		action: OfflineActionSchema,
		payload: OfflineExecutionPayloadSchema,
		timestamp: z.string().datetime(),
	}),
	z.object({
		id: z.string().uuid(),
		type: z.literal("order"),
		action: OfflineActionSchema,
		payload: z.record(z.string(), z.unknown()),
		timestamp: z.string().datetime(),
	}),
	z.object({
		id: z.string().uuid(),
		type: z.literal("checklist"),
		action: OfflineActionSchema,
		payload: z.record(z.string(), z.unknown()),
		timestamp: z.string().datetime(),
	}),
	z.object({
		id: z.string().uuid(),
		type: z.literal("cost"),
		action: OfflineActionSchema,
		payload: z.record(z.string(), z.unknown()),
		timestamp: z.string().datetime(),
	}),
	z.object({
		id: z.string().uuid(),
		type: z.literal("delivery-record"),
		action: OfflineActionSchema,
		payload: z.record(z.string(), z.unknown()),
		timestamp: z.string().datetime(),
	}),
	z.object({
		id: z.string().uuid(),
		type: z.literal("service-entry-sheet"),
		action: OfflineActionSchema,
		payload: z.record(z.string(), z.unknown()),
		timestamp: z.string().datetime(),
	}),
	z.object({
		id: z.string().uuid(),
		type: z.literal("invoice"),
		action: OfflineActionSchema,
		payload: z.record(z.string(), z.unknown()),
		timestamp: z.string().datetime(),
	}),
	z.object({
		id: z.string().uuid(),
		type: z.literal("payment"),
		action: OfflineActionSchema,
		payload: z.record(z.string(), z.unknown()),
		timestamp: z.string().datetime(),
	}),
	z.object({
		id: z.string().uuid(),
		type: z.literal("technical-report"),
		action: OfflineActionSchema,
		payload: z.record(z.string(), z.unknown()),
		timestamp: z.string().datetime(),
	}),
	z.object({
		id: z.string().uuid(),
		type: z.literal("purchase-order"),
		action: OfflineActionSchema,
		payload: z.record(z.string(), z.unknown()),
		timestamp: z.string().datetime(),
	}),
]);

export type OfflineOperation = z.infer<typeof OfflineOperationSchema>;

export const SyncBatchSchema = z
	.object({
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
		processed: z.number().int().min(0),
		failed: z.number().int().min(0),
		errors: z.array(SyncErrorSchema),
	})
	.strip();

export type SyncResult = z.infer<typeof SyncResultSchema>;
