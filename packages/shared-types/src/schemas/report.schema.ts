import { z } from "zod";
import { type MongooseDocument, ObjectIdSchema } from "./common.schema";

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

export const ReportBulkEvidenceZipSchema = z
	.object({
		orderIds: z.array(ObjectIdSchema).min(1).max(100),
	})
	.strip();

export type ReportBulkEvidenceZipInput = z.infer<typeof ReportBulkEvidenceZipSchema>;

export const ReportRejectSchema = z
	.object({
		rejectionReason: z.string().min(1).max(2000),
	})
	.strip();

export type ReportRejectInput = z.infer<typeof ReportRejectSchema>;

export const ReportTemplateSettingsSchema = z
	.object({
		logoUrl: z.string().url().optional(),
		headerText: z.string().max(200).optional(),
		footerText: z.string().max(200).optional(),
		companyName: z.string().max(100).optional(),
		companyNit: z.string().max(20).optional(),
		primaryColor: z
			.string()
			.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
			.optional(),
	})
	.strip();

export type ReportTemplateSettings = z.infer<typeof ReportTemplateSettingsSchema>;

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

/**
 * Mongoose Document representation for WorkReport.
 * Used for type safety in backend services and repositories.
 */
export interface WorkReportDocument<TID = string> extends MongooseDocument<TID> {
	orderId: TID;
	title: string;
	summary: string;
	status: ReportStatus;
	generatedBy: TID;
	approvedBy?: TID;
	approvedAt?: Date;
	rejectionReason?: string;
	pdfPath?: string;
	includesChecklist: boolean;
	includesCosts: boolean;
	includesEvidences: boolean;
}

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
