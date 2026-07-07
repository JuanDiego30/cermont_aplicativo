import { z } from "zod";
import { normalizeOptionalStringQueryValue, normalizeQueryValue } from "../utils";
import { type AuditableDocument, ObjectIdSchema, type SoftDeleteDocument } from "./common.schema";
import { CustomFieldValuesSchema } from "./custom-field.schema";

/**
 * Work Request Status Enum
 * Represents the lifecycle of a request from intake to resolution
 */
export const WorkRequestStatusSchema = z.enum([
	"draft",
	"submitted",
	"qualified",
	"visit_required",
	"proposal_pending",
	"cancelled",
]);
export type WorkRequestStatus = z.infer<typeof WorkRequestStatusSchema>;

/**
 * Urgency level for work requests
 */
export const WorkRequestUrgencySchema = z.enum(["low", "medium", "high", "critical"]);
export type WorkRequestUrgency = z.infer<typeof WorkRequestUrgencySchema>;

/**
 * Source channel where the request originated
 */
export const WorkRequestSourceChannelSchema = z.enum([
	"email",
	"phone",
	"whatsapp",
	"portal_client",
	"field_report",
	"internal",
	"scheduled_maintenance",
	"other",
]);
export type WorkRequestSourceChannel = z.infer<typeof WorkRequestSourceChannelSchema>;

/**
 * GPS Location for the request site
 */
export const GpsLocationSchema = z
	.object({
		lat: z.number().min(-90).max(90),
		lng: z.number().min(-180).max(180),
		accuracy: z.number().optional(),
		capturedAt: z.string().datetime().optional(),
	})
	.strict();

export type GpsLocation = z.infer<typeof GpsLocationSchema>;

/**
 * Evidence attachment for work request
 */
export const WorkRequestEvidenceSchema = z
	.object({
		id: ObjectIdSchema,
		url: z.string().url(),
		type: z.enum(["image", "document", "video"]),
		description: z.string().max(300).optional(),
		uploadedAt: z.string().datetime(),
	})
	.strict();

export type WorkRequestEvidence = z.infer<typeof WorkRequestEvidenceSchema>;

/**
 * Site Visit Record
 * Captured when a site visit is required/performed
 */
export const SiteVisitSchema = z
	.object({
		scheduledAt: z.string().datetime().optional(),
		completedAt: z.string().datetime().optional(),
		technicianId: ObjectIdSchema.optional(),
		technicianName: z.string().optional(),
		notes: z.string().max(2000).optional(),
		evidences: z.array(WorkRequestEvidenceSchema).default([]),
		measurements: z
			.object({
				value: z.string(),
				unit: z.string(),
				description: z.string().optional(),
			})
			.optional(),
		technicalFindings: z.string().max(3000).optional(),
		scopeClarifications: z.string().max(3000).optional(),
		estimatedDuration: z.number().positive().optional(),
		riskNotes: z.string().max(1000).optional(),
	})
	.strict();

export type SiteVisit = z.infer<typeof SiteVisitSchema>;

/**
 * Work Request Schema - Main intake entity
 * This is the initial entry point for all field service work
 */
export const WorkRequestSchema = z
	.object({
		_id: z.string(),
		// Identification
		code: z.string().regex(/^WR-\d{4}-\d{4}$/),
		status: WorkRequestStatusSchema,
		urgency: WorkRequestUrgencySchema,

		// Requester Information
		requesterName: z.string().min(1).max(200),
		requesterEmail: z.email().optional(),
		requesterPhone: z.string().min(1).max(30).optional(),

		// Client Information
		clientId: ObjectIdSchema.optional(),
		clientName: z.string().min(1).max(200),
		serviceSite: z.string().min(1).max(300),
		serviceType: z.string().min(1).max(120),
		billingAccount: z.string().max(200).optional(),

		// Asset Information
		assetId: ObjectIdSchema.optional(),
		assetName: z.string().max(200).optional(),
		assetLocation: z.string().max(300).optional(),
		serialTag: z.string().max(120).optional(),

		// Request Details
		sourceChannel: WorkRequestSourceChannelSchema,
		shortDescription: z.string().min(5).max(200),
		description: z.string().min(10).max(3000),
		requestedDate: z.string().datetime().optional(),
		incidentDate: z.string().datetime().optional(),

		// Location
		gpsLocation: GpsLocationSchema.optional(),

		// SLA
		slaHours: z.number().positive().max(720).optional(),

		// Classification
		tags: z.array(z.string().trim().max(50)).default([]),
		classifications: z.array(z.string().trim().max(100)).default([]),

		// Initial Evidence
		initialEvidences: z.array(WorkRequestEvidenceSchema).default([]),

		// Visit Requirement
		requiresSiteVisit: z.boolean().default(false),
		visitNotes: z.string().max(1000).optional(),
		visit: SiteVisitSchema.optional(),

		// Assignment
		assignedTo: ObjectIdSchema.optional(),

		// Configurable dynamic fields
		customFields: CustomFieldValuesSchema,
		assignedToName: z.string().optional(),

		// Links to other entities
		linkedProposalId: ObjectIdSchema.optional(),
		linkedProposalCode: z.string().optional(),
		linkedOrderId: ObjectIdSchema.optional(),
		linkedOrderCode: z.string().optional(),

		// Resolution
		resolution: z.string().max(500).optional(),
		resolvedAt: z.string().datetime().optional(),

		// Audit
		createdBy: z.string(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),

		// Soft delete
		archived: z.boolean().default(false),
	})
	.strip();

export type WorkRequest = z.infer<typeof WorkRequestSchema>;

/**
 * Input schema for creating a new work request
 */
export const CreateWorkRequestSchema = WorkRequestSchema.pick({
	requesterName: true,
	requesterEmail: true,
	requesterPhone: true,
	clientName: true,
	serviceSite: true,
	serviceType: true,
	billingAccount: true,
	assetName: true,
	assetLocation: true,
	serialTag: true,
	sourceChannel: true,
	shortDescription: true,
	description: true,
	requestedDate: true,
	incidentDate: true,
	tags: true,
	classifications: true,
	requiresSiteVisit: true,
	urgency: true,
	customFields: true,
})
	.extend({
		clientId: ObjectIdSchema.optional(),
		assetId: ObjectIdSchema.optional(),
		initialEvidences: z
			.array(
				z
					.object({
						url: z.string().url(),
						type: z.enum(["image", "document", "video"]),
						description: z.string().max(300).optional(),
					})
					.strict(),
			)
			.default([]),
	})
	.strict();

export type CreateWorkRequestInput = z.infer<typeof CreateWorkRequestSchema>;

/**
 * Input schema for updating work request status
 */
export const UpdateWorkRequestStatusSchema = z
	.object({
		status: WorkRequestStatusSchema,
		resolution: z.string().max(500).optional(),
	})
	.strict();

export type UpdateWorkRequestStatusInput = z.infer<typeof UpdateWorkRequestStatusSchema>;

/**
 * Input schema for scheduling a site visit
 */
export const ScheduleVisitSchema = z
	.object({
		scheduledAt: z.string().datetime(),
		technicianId: ObjectIdSchema,
		technicianName: z.string(),
		notes: z.string().max(500).optional(),
	})
	.strict();

export type ScheduleVisitInput = z.infer<typeof ScheduleVisitSchema>;

/**
 * Input schema for completing a site visit
 */
export const CompleteVisitSchema = z
	.object({
		notes: z.string().max(2000).optional(),
		technicalFindings: z.string().max(3000).optional(),
		scopeClarifications: z.string().max(3000).optional(),
		estimatedDuration: z.number().positive().optional(),
		riskNotes: z.string().max(1000).optional(),
		measurements: z
			.object({
				value: z.string(),
				unit: z.string(),
				description: z.string().optional(),
			})
			.optional(),
		evidences: z
			.array(
				z
					.object({
						url: z.string().url(),
						type: z.enum(["image", "document", "video"]),
						description: z.string().max(300).optional(),
					})
					.strict(),
			)
			.default([]),
	})
	.strict();

export type CompleteVisitInput = z.infer<typeof CompleteVisitSchema>;

/**
 * Parameters schema for work request ID
 */
export const WorkRequestIdParamsSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export type WorkRequestIdParams = z.infer<typeof WorkRequestIdParamsSchema>;

/**
 * Query parameters for listing work requests
 */
export const ListWorkRequestsQuerySchema = z
	.object({
		status: z.preprocess(
			(value) => (Array.isArray(value) ? value.filter((v) => v !== "") : value),
			z.array(WorkRequestStatusSchema).optional(),
		),
		urgency: z.preprocess(normalizeOptionalStringQueryValue, WorkRequestUrgencySchema.optional()),
		sourceChannel: z.preprocess(
			normalizeOptionalStringQueryValue,
			WorkRequestSourceChannelSchema.optional(),
		),
		clientId: z.preprocess(normalizeOptionalStringQueryValue, ObjectIdSchema.optional()),
		assignedTo: z.preprocess(normalizeOptionalStringQueryValue, ObjectIdSchema.optional()),
		search: z.preprocess(normalizeOptionalStringQueryValue, z.string().max(100).optional()),
		dateFrom: z.preprocess(normalizeOptionalStringQueryValue, z.string().datetime().optional()),
		dateTo: z.preprocess(normalizeOptionalStringQueryValue, z.string().datetime().optional()),
		page: z.preprocess(normalizeQueryValue, z.coerce.number().int().min(1)).default(1),
		limit: z.preprocess(normalizeQueryValue, z.coerce.number().int().min(1).max(100)).default(20),
	})
	.strip();

export type ListWorkRequestsQuery = z.infer<typeof ListWorkRequestsQuerySchema>;

export const WorkRequestPaginationSchema = z
	.object({
		page: z.number().int().min(1),
		limit: z.number().int().min(1).max(100),
		total: z.number().int().min(0),
		totalPages: z.number().int().min(0),
	})
	.strict();

export type WorkRequestPagination = z.infer<typeof WorkRequestPaginationSchema>;

export const WorkRequestListResponseSchema = z
	.object({
		success: z.literal(true),
		data: z.array(WorkRequestSchema),
		pagination: WorkRequestPaginationSchema,
	})
	.strict();

export type WorkRequestListResponse = z.infer<typeof WorkRequestListResponseSchema>;

/**
 * Schema for converting work request to proposal
 */
export const ConvertWorkRequestToProposalSchema = z
	.object({
		title: z.string().min(5).max(200),
		clientName: z.string().min(2).max(200),
		clientEmail: z.email().optional(),
		items: z
			.array(
				z
					.object({
						description: z.string().min(1).max(300),
						unit: z.string().min(1).max(50),
						quantity: z.number().positive(),
						unitCost: z.number().nonnegative(),
					})
					.strict(),
			)
			.min(1),
		validUntil: z.string().datetime(),
		notes: z.string().max(2000).optional(),
	})
	.strict();

export type ConvertWorkRequestToProposalInput = z.infer<typeof ConvertWorkRequestToProposalSchema>;

/**
 * Mongoose Document representation for WorkRequest
 */
export interface WorkRequestDocument<TID = string>
	extends AuditableDocument<TID>,
		SoftDeleteDocument<TID> {
	code: string;
	status: WorkRequestStatus;
	urgency: WorkRequestUrgency;
	requesterName: string;
	requesterEmail?: string;
	requesterPhone?: string;
	clientId?: TID;
	clientName: string;
	serviceSite: string;
	serviceType: string;
	billingAccount?: string;
	assetId?: TID;
	assetName?: string;
	assetLocation?: string;
	serialTag?: string;
	sourceChannel: WorkRequestSourceChannel;
	shortDescription: string;
	description: string;
	requestedDate?: Date;
	incidentDate?: Date;
	gpsLocation?: GpsLocation;
	tags: string[];
	classifications: string[];
	initialEvidences: Array<{
		id: TID;
		url: string;
		type: "image" | "document" | "video";
		description?: string;
		uploadedAt: Date;
	}>;
	requiresSiteVisit: boolean;
	visitNotes?: string;
	visit?: {
		scheduledAt?: Date;
		completedAt?: Date;
		technicianId?: TID;
		technicianName?: string;
		notes?: string;
		technicalFindings?: string;
		scopeClarifications?: string;
		estimatedDuration?: number;
		riskNotes?: string;
		evidences: Array<{
			id: TID;
			url: string;
			type: "image" | "document" | "video";
			description?: string;
			uploadedAt: Date;
		}>;
	};
	assignedTo?: TID;
	assignedToName?: string;
	linkedProposalId?: TID;
	linkedProposalCode?: string;
	linkedOrderId?: TID;
	linkedOrderCode?: string;
	resolution?: string;
	resolvedAt?: Date;
}

// ──────────────────────────────────────────────────────────────────────────────
// SiteVisit standalone command schemas (Phase 1 — SSOT only, no backend routes)
// SiteVisitSchema, ScheduleVisitSchema, and CompleteVisitSchema already exist above.
// ──────────────────────────────────────────────────────────────────────────────

export const ApproveSiteVisitSchema = z
	.object({
		approvedBy: ObjectIdSchema,
		notes: z.string().max(500).optional(),
	})
	.strict();

export type ApproveSiteVisitInput = z.infer<typeof ApproveSiteVisitSchema>;

export const CancelSiteVisitSchema = z
	.object({
		reason: z.string().min(5).max(500),
	})
	.strict();

export type CancelSiteVisitInput = z.infer<typeof CancelSiteVisitSchema>;
