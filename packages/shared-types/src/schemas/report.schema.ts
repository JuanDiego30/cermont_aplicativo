import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const ReportStatusSchema = z.enum(["draft", "pending_review", "approved", "rejected"]);
export type ReportStatus = z.infer<typeof ReportStatusSchema>;

export const ListReportsQuerySchema = z
	.object({
		orderId: ObjectIdSchema.optional(),
		status: ReportStatusSchema.optional(),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
	})
	.strip();

export type ListReportsQuery = z.infer<typeof ListReportsQuerySchema>;

export const ReportIdSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strip();

export type ReportIdParams = z.infer<typeof ReportIdSchema>;

export const ReportOrderIdSchema = z
	.object({
		orderId: ObjectIdSchema,
	})
	.strip();

export type ReportOrderIdParams = z.infer<typeof ReportOrderIdSchema>;

export const ReportRejectSchema = z
	.object({
		rejectionReason: z.string().min(1).max(2000),
	})
	.strip();

export type ReportRejectInput = z.infer<typeof ReportRejectSchema>;

export const WorkReportSchema = z
	.object({
		_id: z.string(),
		orderId: ObjectIdSchema,
		title: z.string(),
		summary: z.string(),
		status: ReportStatusSchema,
		generatedBy: ObjectIdSchema,
		approvedBy: ObjectIdSchema.optional(),
		approvedAt: z.string().optional(),
		rejectionReason: z.string().optional(),
		pdfUrl: z.string().optional(),
		includesChecklist: z.boolean(),
		includesCosts: z.boolean(),
		includesEvidences: z.boolean(),
		createdAt: z.string(),
		updatedAt: z.string(),
	})
	.strip();

export type WorkReport = z.infer<typeof WorkReportSchema>;

export const CreateWorkReportSchema = z
	.object({
		orderId: ObjectIdSchema,
		title: z.string().min(1).max(200),
		summary: z.string().max(2000).optional(),
	})
	.strip();

export type CreateWorkReportInput = z.infer<typeof CreateWorkReportSchema>;

export const UpdateWorkReportSchema = z
	.object({
		status: ReportStatusSchema.optional(),
		approvedBy: ObjectIdSchema.optional(),
		rejectionReason: z.string().optional(),
		summary: z.string().max(2000).optional(),
		title: z.string().min(1).max(200).optional(),
	})
	.strip();

export type UpdateWorkReportInput = z.infer<typeof UpdateWorkReportSchema>;

export const WorkReportResponseSchema = WorkReportSchema;

export type WorkReportResponse = z.infer<typeof WorkReportResponseSchema>;

// Legacy aliases kept for compatibility with older consumers.
export const ReportStatusEnum = ReportStatusSchema;
export const CreateReportSchema = CreateWorkReportSchema;
export const UpdateReportSchema = UpdateWorkReportSchema;
export const UpdateReportStatusSchema = UpdateWorkReportSchema.pick({
	status: true,
});
export const ReportSchema = WorkReportSchema;
export type CreateReport = CreateWorkReportInput;
export type UpdateReport = UpdateWorkReportInput;
export type UpdateReportStatus = z.infer<typeof UpdateReportStatusSchema>;
export type Report = WorkReport;

// ============================================================================
// Additional Report Types (missing and causing frontend errors)
// ============================================================================

/**
 * Billing vs Cost report data
 */
export const ReportBillingVsCostSchema = z.object({
	orderId: z.string(),
	orderCode: z.string(),
	billingAmount: z.number(),
	costAmount: z.number(),
	variance: z.number(),
	variancePercent: z.number(),
});
export type ReportBillingVsCost = z.infer<typeof ReportBillingVsCostSchema>;

/**
 * Cycle time bucket for analytics
 */
export const ReportCycleTimeBucketSchema = z.object({
	bucket: z.string(), // e.g., "0-1d", "1-3d", "3-7d", "7-14d", "14d+"
	count: z.number(),
	percentage: z.number(),
});
export type ReportCycleTimeBucket = z.infer<typeof ReportCycleTimeBucketSchema>;

/**
 * Technician ranking for performance reports
 */
export const ReportTechnicianRankingSchema = z.object({
	technicianId: z.string(),
	technicianName: z.string(),
	totalOrders: z.number(),
	completedOrders: z.number(),
	averageCompletionTime: z.number(), // in hours
	performanceScore: z.number(),
	reportsApproved: z.number().optional(), // Additional field for UI
	avgClosureDays: z.number().optional(), // Additional field for UI
});
export type ReportTechnicianRanking = z.infer<typeof ReportTechnicianRankingSchema>;

/**
 * Report pipeline response - orders awaiting report approval
 */
export const ReportPipelineResponseSchema = z.object({
	pipeline: z.array(
		z.object({
			_id: z.string(),
			code: z.string(),
			type: z.string(),
			status: z.string(),
			assetName: z.string(),
			location: z.string(),
			description: z.string(),
			createdAt: z.string().nullable(),
			updatedAt: z.string(),
			pdfUrl: z.string().nullable(),
		}),
	),
	summary: z.object({
		total: z.number(),
		byStatus: z.record(z.string(), z.number()),
	}),
});
export type ReportPipelineResponse = z.infer<typeof ReportPipelineResponseSchema>;

/**
 * Monthly statistics for reports
 */
export const ReportMonthlyStatsSchema = z.object({
	approvedThisMonth: z.number(),
	rejectedThisMonth: z.number(),
	avgClosureDays: z.number().nullable(),
});
export type ReportMonthlyStats = z.infer<typeof ReportMonthlyStatsSchema>;

/**
 * Report template settings
 */
export const ReportTemplateSettingsSchema = z.object({
	defaultTemplate: z.string().optional(),
	includeSignature: z.boolean().default(true),
	includeChecklist: z.boolean().default(true),
	includeCosts: z.boolean().default(true),
	includeEvidences: z.boolean().default(false),
});
export type ReportTemplateSettings = z.infer<typeof ReportTemplateSettingsSchema>;
