import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

// ──────────────────────────────────────────────────────────────────────────────
// Site Visit Record — Standalone entity for Paso 2 of the 14-step flow
// Distinct from the embedded SiteVisit subdocument in work-request.schema.ts
// Reference: docs/plans/CERMONT_COMPREHENSIVE_AUDIT_V2.md — Section 2.1
// ──────────────────────────────────────────────────────────────────────────────

const SITE_VISIT_RECORD_STATUS_VALUES = [
	"scheduled",
	"in_progress",
	"completed",
	"cancelled",
] as const;

export const SiteVisitRecordStatusSchema = z.enum(SITE_VISIT_RECORD_STATUS_VALUES);
export type SiteVisitRecordStatus = z.infer<typeof SiteVisitRecordStatusSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Sub-schemas
// ──────────────────────────────────────────────────────────────────────────────

export const SiteVisitMeasurementSchema = z
	.object({
		label: z.string().min(1).max(200),
		value: z.string().min(1).max(200),
		unit: z.string().max(50).optional(),
	})
	.strict();
export type SiteVisitMeasurement = z.infer<typeof SiteVisitMeasurementSchema>;

export const SiteVisitFindingSchema = z
	.object({
		description: z.string().min(1).max(500),
		severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
		category: z
			.enum(["safety", "access", "measurement", "resource", "documentation", "other"])
			.default("other"),
	})
	.strict();
export type SiteVisitFinding = z.infer<typeof SiteVisitFindingSchema>;

export const SiteVisitPhotoSchema = z
	.object({
		url: z.string().url(),
		caption: z.string().max(300).optional(),
		takenAt: z.string().datetime().optional(),
	})
	.strict();
export type SiteVisitPhoto = z.infer<typeof SiteVisitPhotoSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Main entity
// ──────────────────────────────────────────────────────────────────────────────

export const SiteVisitRecordSchema = z
	.object({
		_id: ObjectIdSchema,
		code: z.string().regex(/^SV-\d{4}-\d{4}$/),
		workRequestId: ObjectIdSchema,
		serviceCaseId: ObjectIdSchema,
		clientId: ObjectIdSchema,
		clientName: z.string().min(1).max(200),
		visitDate: z.string().datetime(),
		location: z.string().min(1).max(500),
		responsibleUserId: ObjectIdSchema,
		responsibleName: z.string().min(1).max(200),
		measurements: z.array(SiteVisitMeasurementSchema).default([]),
		findings: z.array(SiteVisitFindingSchema).default([]),
		photos: z.array(SiteVisitPhotoSchema).default([]),
		requirements: z.string().max(2000).optional(),
		identifiedRisks: z.string().max(2000).optional(),
		recommendations: z.string().max(2000).optional(),
		observations: z.string().max(2000).optional(),
		commandHistory: z
			.array(
				z.object({
					clientMutationId: z.string().uuid(),
					command: z.string().min(1).max(80),
					recordedAt: z.string().datetime(),
				}),
			)
			.default([]),
		status: SiteVisitRecordStatusSchema,
		startedAt: z.string().datetime().optional(),
		completedAt: z.string().datetime().optional(),
		cancelledAt: z.string().datetime().optional(),
		cancellationReason: z.string().max(500).optional(),
		createdBy: ObjectIdSchema,
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type SiteVisitRecord = z.infer<typeof SiteVisitRecordSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Command schemas
// ──────────────────────────────────────────────────────────────────────────────

export const CreateSiteVisitRecordSchema = z
	.object({
		workRequestId: ObjectIdSchema,
		serviceCaseId: ObjectIdSchema,
		clientId: ObjectIdSchema,
		clientName: z.string().min(1).max(200),
		visitDate: z.string().datetime(),
		location: z.string().min(1).max(500),
		responsibleUserId: ObjectIdSchema,
		responsibleName: z.string().min(1).max(200),
		requirements: z.string().max(2000).optional(),
		observations: z.string().max(2000).optional(),
		clientMutationId: z.string().uuid().optional(),
	})
	.strict();
export type CreateSiteVisitRecordInput = z.infer<typeof CreateSiteVisitRecordSchema>;

export const UpdateSiteVisitRecordSchema = z
	.object({
		visitDate: z.string().datetime().optional(),
		location: z.string().min(1).max(500).optional(),
		responsibleUserId: ObjectIdSchema.optional(),
		responsibleName: z.string().min(1).max(200).optional(),
		requirements: z.string().max(2000).optional(),
		observations: z.string().max(2000).optional(),
	})
	.strict();
export type UpdateSiteVisitRecordInput = z.infer<typeof UpdateSiteVisitRecordSchema>;

export const StartSiteVisitRecordSchema = z
	.object({
		clientMutationId: z.string().uuid().optional(),
	})
	.strict();
export type StartSiteVisitRecordInput = z.infer<typeof StartSiteVisitRecordSchema>;

export const CompleteSiteVisitRecordSchema = z
	.object({
		measurements: z.array(SiteVisitMeasurementSchema).default([]),
		findings: z.array(SiteVisitFindingSchema).default([]),
		photos: z.array(SiteVisitPhotoSchema).default([]),
		identifiedRisks: z.string().max(2000).optional(),
		recommendations: z.string().max(2000).optional(),
		observations: z.string().max(2000).optional(),
		clientMutationId: z.string().uuid().optional(),
	})
	.strict();
export type CompleteSiteVisitRecordInput = z.infer<typeof CompleteSiteVisitRecordSchema>;

export const CancelSiteVisitRecordSchema = z
	.object({
		reason: z.string().min(5).max(500),
		clientMutationId: z.string().uuid().optional(),
	})
	.strict();
export type CancelSiteVisitRecordInput = z.infer<typeof CancelSiteVisitRecordSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// List query / params
// ──────────────────────────────────────────────────────────────────────────────

export const ListSiteVisitRecordsQuerySchema = z
	.object({
		workRequestId: ObjectIdSchema.optional(),
		clientId: ObjectIdSchema.optional(),
		status: SiteVisitRecordStatusSchema.optional(),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
	})
	.strip();
export type ListSiteVisitRecordsQuery = z.infer<typeof ListSiteVisitRecordsQuerySchema>;

export const SiteVisitRecordIdParamsSchema = z.object({ id: ObjectIdSchema }).strict();
export type SiteVisitRecordIdParams = z.infer<typeof SiteVisitRecordIdParamsSchema>;
