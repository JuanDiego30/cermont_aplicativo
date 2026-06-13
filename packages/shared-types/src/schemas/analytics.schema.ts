import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const ErrorDashboardQuerySchema = z
	.object({
		limit: z.coerce.number().int().min(1).max(100).default(10),
	})
	.strict();

export const NotificationIdSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export const AnalyticsPeriodSchema = z.enum(["day", "week", "month", "quarter", "year"]);
export type AnalyticsPeriod = z.infer<typeof AnalyticsPeriodSchema>;

export const ExtendedKpisQuerySchema = z
	.object({
		period: z.enum(["7d", "30d", "90d"]).default("30d"),
		compare: z.coerce.boolean().default(true),
	})
	.strict();

export const DashboardTopAssetsQuerySchema = z
	.object({
		limit: z.coerce.number().int().min(1).max(50).default(10),
	})
	.strict();

export const DashboardTechnicianWorkloadQuerySchema = z
	.object({
		days: z.coerce.number().int().min(1).max(60).default(14),
	})
	.strict();

export type ErrorDashboardQuery = z.infer<typeof ErrorDashboardQuerySchema>;
export type NotificationId = z.infer<typeof NotificationIdSchema>;
export type ExtendedKpisQuery = z.infer<typeof ExtendedKpisQuerySchema>;
export type DashboardTopAssetsQuery = z.infer<typeof DashboardTopAssetsQuerySchema>;
export type DashboardTechnicianWorkloadQuery = z.infer<
	typeof DashboardTechnicianWorkloadQuerySchema
>;

export const AnalyticsReportDomainSchema = z.enum([
	"work-requests",
	"orders",
	"invoices",
	"payments",
	"ses",
]);

export type AnalyticsReportDomain = z.infer<typeof AnalyticsReportDomainSchema>;

export const AnalyticsReportParamsSchema = z
	.object({
		domain: AnalyticsReportDomainSchema,
	})
	.strict();

export const AnalyticsReportFilterSchema = z
	.object({
		dateFrom: z.string().datetime().optional(),
		dateTo: z.string().datetime().optional(),
		clientId: ObjectIdSchema.optional(),
		status: z.string().trim().min(1).max(80).optional(),
		type: z.string().trim().min(1).max(80).optional(),
	})
	.strict()
	.superRefine((filters, context) => {
		if (
			filters.dateFrom &&
			filters.dateTo &&
			new Date(filters.dateFrom).getTime() > new Date(filters.dateTo).getTime()
		) {
			context.addIssue({
				code: "custom",
				path: ["dateTo"],
				message: "dateTo must be greater than or equal to dateFrom",
			});
		}
	});

export type AnalyticsReportFilter = z.infer<typeof AnalyticsReportFilterSchema>;

export const AnalyticsReportRowValueSchema = z.union([z.string(), z.number()]);
export const AnalyticsReportRowSchema = z.record(z.string(), AnalyticsReportRowValueSchema);

export type AnalyticsReportRow = z.infer<typeof AnalyticsReportRowSchema>;

export const AnalyticsReportResultSchema = z.object({
	headers: z.array(z.string()),
	rows: z.array(AnalyticsReportRowSchema),
	total: z.number().int().min(0),
});

export type AnalyticsReportResult = z.infer<typeof AnalyticsReportResultSchema>;

export const OperationalKpiResultSchema = z.object({
	period: z.object({
		from: z.string(),
		to: z.string(),
	}),
	steps: z.object({
		workRequests: z.number().int().min(0),
		serviceCases: z.number().int().min(0),
		proposals: z.number().int().min(0),
		orders: z.number().int().min(0),
		executions: z.number().int().min(0),
		evidences: z.number().int().min(0),
		deliveries: z.number().int().min(0),
	}),
});

export type OperationalKpiResult = z.infer<typeof OperationalKpiResultSchema>;

export const AnalyticsCsvExportSchema = z.object({
	fileName: z.string().min(1),
	content: z.string(),
});

export type AnalyticsCsvExport = z.infer<typeof AnalyticsCsvExportSchema>;
