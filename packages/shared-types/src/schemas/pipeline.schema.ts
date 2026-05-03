import { z } from "zod";
import { ReportStatusSchema } from "./report.schema";

const PIPELINE_STATUS_VALUES = ["completed", "ready_for_invoicing", "closed"] as const;

export const PipelineStatusSchema = z.enum(PIPELINE_STATUS_VALUES);
export type PipelineStatus = z.infer<typeof PipelineStatusSchema>;

export const BillingPipelineItemSchema = z.object({
	_id: z.string(),
	code: z.string(),
	type: z.string(),
	status: PipelineStatusSchema,
	assetName: z.string(),
	location: z.string(),
	description: z.string(),
	completedAt: z.string().nullable(),
	daysWaiting: z.number(),
	invoiceReady: z.boolean(),
	createdBy: z.string(),
	clientName: z.string().nullable(),
	sesStatus: z.enum(["pending", "registered", "approved"]).optional(),
	invoiceStatus: z.enum(["pending", "sent", "approved", "paid"]).optional(),
	paidAt: z.string().nullable().optional(),
	nteAmount: z.number().optional(),
	hasDeliveryRecord: z.boolean().default(false),
	deliveryRecordSigned: z.boolean().default(false),
});
export type BillingPipelineItem = z.infer<typeof BillingPipelineItemSchema>;

export const BillingPipelineGroupSchema = z.object({
	clientName: z.string().nullable(),
	createdBy: z.string(),
	orders: z.array(BillingPipelineItemSchema),
	totalOrders: z.number(),
	totalDaysWaiting: z.number(),
	averageDaysWaiting: z.number(),
});
export type BillingPipelineGroup = z.infer<typeof BillingPipelineGroupSchema>;

export const BillingPipelineSummarySchema = z.object({
	totalAwaitingInvoicing: z.number(),
	totalCompletedNotReady: z.number(),
	totalReadyForInvoicing: z.number(),
	totalClosedPendingPayment: z.number(),
	averageDaysWaiting: z.number(),
	maxDaysWaiting: z.number(),
});
export type BillingPipelineSummary = z.infer<typeof BillingPipelineSummarySchema>;

export const BillingPipelineFinancialSummarySchema = z.object({
	totalCopInPipeline: z.number(),
	copByStage: z.object({
		completed: z.number(),
		readyForInvoicing: z.number(),
		sesPending: z.number(),
		invoicePending: z.number(),
		paid: z.number(),
	}),
});
export type BillingPipelineFinancialSummary = z.infer<typeof BillingPipelineFinancialSummarySchema>;

export const BillingPipelineResponseSchema = z.object({
	pipeline: z.array(BillingPipelineItemSchema),
	groupedByClient: z.array(BillingPipelineGroupSchema),
	summary: BillingPipelineSummarySchema,
	financialSummary: BillingPipelineFinancialSummarySchema,
});
export type BillingPipelineResponse = z.infer<typeof BillingPipelineResponseSchema>;

export const ReportPipelineItemSchema = z.object({
	_id: z.string(),
	code: z.string(),
	type: z.string(),
	status: PipelineStatusSchema,
	assetName: z.string(),
	location: z.string(),
	description: z.string(),
	createdAt: z.string().nullable(),
	completedAt: z.string().nullable(),
	daysWaiting: z.number(),
	createdBy: z.string(),
	reportId: z.string().nullable(),
	reportStatus: ReportStatusSchema.nullable(),
	reportSummary: z.string().nullable(),
	pdfUrl: z.string().nullable(),
});
export type ReportPipelineItem = z.infer<typeof ReportPipelineItemSchema>;

export const ReportPipelineSummarySchema = z.object({
	totalAwaitingApproval: z.number(),
	averageDaysWaiting: z.number(),
	maxDaysWaiting: z.number(),
	averageCompletionToApprovalDays: z.number().nullable(),
});
export type ReportPipelineSummary = z.infer<typeof ReportPipelineSummarySchema>;

export const ReportPipelineResponseSchema = z.object({
	pipeline: z.array(ReportPipelineItemSchema),
	summary: ReportPipelineSummarySchema,
});
export type ReportPipelineResponse = z.infer<typeof ReportPipelineResponseSchema>;

export const ReportMonthlyStatsSchema = z.object({
	approvedThisMonth: z.number(),
	rejectedThisMonth: z.number(),
	avgClosureDays: z.number().nullable(),
});
export type ReportMonthlyStats = z.infer<typeof ReportMonthlyStatsSchema>;
