import { z } from "zod";
import { statusObjectOf } from "../utils/status-types";
import { ObjectIdSchema } from "./common.schema";

// ──────────────────────────────────────────────────────────────────────────────
// Evidence Phase — When evidence is captured in the operational flow
// ──────────────────────────────────────────────────────────────────────────────

export const EvidencePhaseSchema = z.enum(["before", "during", "after", "closure"]);
export type EvidencePhase = z.infer<typeof EvidencePhaseSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Evidence Category — Type classification for evidence
// ──────────────────────────────────────────────────────────────────────────────

export const EvidenceCategorySchema = z.enum([
	"installation",
	"deinstallation",
	"test",
	"calibration",
	"quality",
	"safety",
	"incident",
	"defect",
	"progress",
	"lifeline",
	"cctv",
	"measurement",
	"other",
]);
export type EvidenceCategory = z.infer<typeof EvidenceCategorySchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Evidence Image Variant — Different image sizes for performance
// ──────────────────────────────────────────────────────────────────────────────

export const EvidenceImageVariantSchema = z.enum(["original", "web", "thumbnail"]);
export type EvidenceImageVariant = z.infer<typeof EvidenceImageVariantSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Evidence Image Asset — Image with variant metadata
// ──────────────────────────────────────────────────────────────────────────────

export const EvidenceImageAssetSchema = z.object({
	id: ObjectIdSchema.optional(),
	url: z.string().url(),
	variant: EvidenceImageVariantSchema,
	checksum: z.string().min(1).max(120).optional(),
	storageKey: z.string().min(1).max(255).optional(),
	width: z.number().int().positive().optional(),
	height: z.number().int().positive().optional(),
	sizeBytes: z.number().int().positive().optional(),
	uploadedAt: z.string().datetime(),
});

export type EvidenceImageAsset = z.infer<typeof EvidenceImageAssetSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Legacy Evidence Type Schema (kept for backward compatibility)
// ──────────────────────────────────────────────────────────────────────────────

export const EvidenceTypeSchema = z.enum([
	"before",
	"during",
	"after",
	"defect",
	"safety",
	"signature",
]);

export type EvidenceType = z.infer<typeof EvidenceTypeSchema>;

export const EvidenceIdSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export const EvidenceOrderIdParamsSchema = z
	.object({
		orderId: ObjectIdSchema,
	})
	.strict();

export const EvidenceSchema = z
	.object({
		_id: ObjectIdSchema,
		orderId: ObjectIdSchema,
		type: EvidenceTypeSchema,
		filename: z.string(),
		url: z.string().url(),
		mimeType: z.string(),
		sizeBytes: z.number().int().positive(),
		title: z.string().max(120).optional(),
		description: z.string().max(500).optional(),
		gpsLocation: z
			.object({
				lat: z.number(),
				lng: z.number(),
				capturedAt: z.string().datetime(),
			})
			.optional(),
		capturedAt: z.string().datetime(),
		uploadedAt: z.string().datetime(),
		uploadedBy: ObjectIdSchema,
		deletedAt: statusObjectOf(z.string().datetime()).optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export const CreateEvidenceSchema = z
	.object({
		orderId: ObjectIdSchema,
		type: EvidenceTypeSchema,
		title: z.string().min(1, "El título es obligatorio").max(120).optional(),
		description: z.string().max(500).optional(),
		gpsLocation: z
			.object({
				lat: z.number(),
				lng: z.number(),
				capturedAt: z.string().datetime().optional(),
			})
			.optional(),
		capturedAt: z.string().datetime(),
	})
	.strict();

// ──────────────────────────────────────────────────────────────────────────────
// Technical Category — Domain-specific classification for field inspections
// ──────────────────────────────────────────────────────────────────────────────

export const TechnicalCategorySchema = z.enum(["lineas_de_vida", "cctv", "anclajes", "general"]);
export type TechnicalCategory = z.infer<typeof TechnicalCategorySchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Enhanced Evidence Schema (V2) — For 14-step workflow with variants
// ──────────────────────────────────────────────────────────────────────────────

export const EvidenceSchemaV2 = z
	.object({
		_id: ObjectIdSchema.optional(),
		code: z.string().min(1).max(40),
		phase: EvidencePhaseSchema,
		category: EvidenceCategorySchema,
		technicalCategory: TechnicalCategorySchema.optional(),
		equipmentId: ObjectIdSchema.optional(),
		location: z.string().max(300).optional(),
		inspectionType: z.string().max(100).optional(),
		serviceCaseId: ObjectIdSchema,
		workOrderId: ObjectIdSchema.optional(),
		executionSessionId: ObjectIdSchema.optional(),
		description: z.string().max(500).optional(),
		// Technical evidence metadata (Lote 3 — PROMPT CREA §5)
		componentName: z.string().max(200).optional(),
		photoLabel: z.string().max(200).optional(),
		beforeAfter: z.enum(["before", "after", "during"]).optional(),
		mimeType: z.string().min(1).max(120),
		sizeBytes: z.number().int().positive(),
		url: z.string().url(),
		variants: z.array(EvidenceImageAssetSchema).default([]),
		uploadedBy: ObjectIdSchema,
		uploadedByName: z.string().min(1).max(200).optional(),
		uploadedAt: z.string().datetime(),
		gpsLocation: z
			.object({
				lat: z.number().min(-90).max(90),
				lng: z.number().min(-180).max(180),
				accuracy: z.number().positive().optional(),
				capturedAt: z.string().datetime().optional(),
			})
			.optional(),
		deletedAt: statusObjectOf(z.string().datetime()).optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type EvidenceV2 = z.infer<typeof EvidenceSchemaV2>;

// ──────────────────────────────────────────────────────────────────────────────
// Offline Evidence Payload — For offline-first capture
// ──────────────────────────────────────────────────────────────────────────────

export const OfflineEvidencePayloadSchema = z
	.object({
		clientMutationId: z.string().uuid(),
		phase: EvidencePhaseSchema,
		category: EvidenceCategorySchema,
		serviceCaseId: ObjectIdSchema,
		workOrderId: ObjectIdSchema.optional(),
		executionSessionId: ObjectIdSchema.optional(),
		description: z.string().max(500).optional(),
		// Technical evidence metadata (Lote 3 — PROMPT CREA §5)
		componentName: z.string().max(200).optional(),
		photoLabel: z.string().max(200).optional(),
		beforeAfter: z.enum(["before", "after", "during"]).optional(),
		mimeType: z.string().min(1).max(120),
		sizeBytes: z.number().int().positive().optional(),
		temporaryUrl: z.string().url().optional(),
		gpsLocation: z
			.object({
				lat: z.number().min(-90).max(90),
				lng: z.number().min(-180).max(180),
				accuracy: z.number().positive().optional(),
				capturedAt: z.string().datetime().optional(),
			})
			.optional(),
		uploadedBy: ObjectIdSchema,
		capturedAt: z.string().datetime(),
		offlineCapturedAt: z.string().datetime(),
		deviceId: z.string().min(1).max(120).optional(),
		syncStatus: z.enum(["pending", "syncing", "synced", "failed"]).default("pending"),
	})
	.strict();

export type OfflineEvidencePayload = z.infer<typeof OfflineEvidencePayloadSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Create Evidence V2 Input Schema
// ──────────────────────────────────────────────────────────────────────────────

const normalizeQueryValue = (value: unknown): unknown => (Array.isArray(value) ? value[0] : value);
const normalizeOptionalStringQueryValue = (value: unknown): unknown => {
	const normalized = normalizeQueryValue(value);
	if (typeof normalized !== "string") {
		return normalized;
	}
	const trimmed = normalized.trim();
	return trimmed.length > 0 ? trimmed : undefined;
};

export const EvidenceListQuerySchema = z
	.object({
		serviceCaseId: z.preprocess(normalizeOptionalStringQueryValue, ObjectIdSchema.optional()),
		workOrderId: z.preprocess(normalizeOptionalStringQueryValue, ObjectIdSchema.optional()),
		executionSessionId: z.preprocess(normalizeOptionalStringQueryValue, ObjectIdSchema.optional()),
		phase: EvidencePhaseSchema.optional(),
		category: EvidenceCategorySchema.optional(),
		uploadedById: z.preprocess(normalizeOptionalStringQueryValue, ObjectIdSchema.optional()),
		dateFrom: z.preprocess(normalizeOptionalStringQueryValue, z.string().datetime().optional()),
		dateTo: z.preprocess(normalizeOptionalStringQueryValue, z.string().datetime().optional()),
		search: z.preprocess(normalizeOptionalStringQueryValue, z.string().max(100).optional()),
		page: z.preprocess(normalizeQueryValue, z.coerce.number().int().min(1)).default(1),
		limit: z.preprocess(normalizeQueryValue, z.coerce.number().int().min(1).max(100)).default(20),
	})
	.strip();

export type EvidenceListQuery = z.infer<typeof EvidenceListQuerySchema>;

export const EvidenceListResponseSchema = z
	.object({
		success: z.literal(true),
		data: z.array(EvidenceSchemaV2),
		pagination: z
			.object({
				page: z.number().int().min(1),
				limit: z.number().int().min(1),
				total: z.number().int().min(0),
				totalPages: z.number().int().min(0),
			})
			.strict(),
	})
	.strict();

export type EvidenceListResponse = z.infer<typeof EvidenceListResponseSchema>;

export const VerifyEvidenceSchema = z
	.object({
		verified: z.boolean(),
		comment: z.string().max(1000).optional().default(""),
	})
	.strict();

export type EvidenceId = z.infer<typeof EvidenceIdSchema>;
export type EvidenceOrderIdParams = z.infer<typeof EvidenceOrderIdParamsSchema>;
export type Evidence = z.infer<typeof EvidenceSchema>;
export type CreateEvidenceInput = z.infer<typeof CreateEvidenceSchema>;
export type VerifyEvidenceInput = z.infer<typeof VerifyEvidenceSchema>;
