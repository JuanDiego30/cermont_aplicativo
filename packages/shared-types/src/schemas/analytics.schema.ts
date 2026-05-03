import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const AnalyticsPeriodSchema = z.enum(["7d", "30d", "90d"]);

export const DashboardKpisQuerySchema = z
	.object({
		startDate: z
			.string()
			.regex(/^\d{4}-\d{2}-\d{2}$/)
			.optional(),
		endDate: z
			.string()
			.regex(/^\d{4}-\d{2}-\d{2}$/)
			.optional(),
		client: z.string().trim().min(1).optional(),
	})
	.strict();

export const ErrorDashboardQuerySchema = z
	.object({
		limit: z.coerce.number().int().min(1).max(100).default(10),
	})
	.strict();

export const ExtendedKpisQuerySchema = z
	.object({
		period: AnalyticsPeriodSchema.default("30d"),
		compare: z.coerce.boolean().default(true),
	})
	.strict();

export const DashboardTimeSeriesQuerySchema = z
	.object({
		range: AnalyticsPeriodSchema.default("30d"),
		client: z.string().trim().min(1).optional(),
	})
	.strict();

export const DashboardTopAssetsQuerySchema = z
	.object({
		limit: z.coerce.number().int().min(1).max(20).default(10),
	})
	.strict();

export const DashboardTechnicianWorkloadQuerySchema = z
	.object({
		days: z.coerce.number().int().min(1).max(31).default(14),
	})
	.strict();

export const ReportAnalyticsQuerySchema = z
	.object({
		period: AnalyticsPeriodSchema.default("30d"),
	})
	.strict();

export const KpiPeriodPairSchema = z.object({
	current: z.number(),
	previous: z.number(),
});

export const ExtendedKpisSchema = z.object({
	kpis: z.object({
		active_orders: KpiPeriodPairSchema,
		completed_orders: KpiPeriodPairSchema,
		overdue_sla_risk: KpiPeriodPairSchema,
		sla_compliance_pct: KpiPeriodPairSchema,
		avg_cycle_time_days: KpiPeriodPairSchema,
		first_time_fix_rate: KpiPeriodPairSchema,
		billing_funnel_cop: KpiPeriodPairSchema,
		avg_days_to_invoice: KpiPeriodPairSchema,
		sla_risk_count: KpiPeriodPairSchema,
		active_technicians_today: KpiPeriodPairSchema,
		unassigned_orders: KpiPeriodPairSchema,
		fsm_tasa_cumplimiento: KpiPeriodPairSchema.optional(),
		fsm_tiempo_promedio_ciclo: KpiPeriodPairSchema.optional(),
		fsm_facturacion_pendiente: KpiPeriodPairSchema.optional(),
		fsm_ordenes_retraso: KpiPeriodPairSchema.optional(),
		fsm_ordenes_activas: KpiPeriodPairSchema.optional(),
	}),
	generated_at: z.string(),
});

export const DashboardTimeSeriesPointSchema = z.object({
	date: z.string(),
	created: z.number(),
	completed: z.number(),
});

export const DashboardTopAssetSchema = z.object({
	assetId: z.string(),
	assetName: z.string(),
	orderCount: z.number(),
});

export const DashboardTechnicianWorkloadRowSchema = z.object({
	technicianId: z.string(),
	technicianName: z.string(),
	days: z.record(z.string(), z.number()),
});

export const AlertSeveritySchema = z.enum(["info", "warning", "critical"]);
export const AlertTypeSchema = z.enum([
	"missing_report",
	"unsigned_delivery_record",
	"pending_ses",
	"pending_invoice_approval",
	"expiring_certification",
]);

export const AlertMetadataValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
export const AlertSchema = z.object({
	id: z.string().min(1),
	type: AlertTypeSchema,
	severity: AlertSeveritySchema,
	orderId: z.string().min(1).optional(),
	userId: z.string().min(1).optional(),
	title: z.string().min(1),
	description: z.string().min(1),
	actionLabel: z.string().min(1),
	actionUrl: z.string().min(1),
	createdAt: z.string().datetime(),
	metadata: z.record(z.string(), AlertMetadataValueSchema).optional(),
});
export const AlertsResponseSchema = z.array(AlertSchema);

export const NotificationIdSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export const ReportCycleTimeBucketSchema = z.object({
	bucket: z.string(),
	count: z.number(),
});
export type ReportCycleTimeBucket = z.infer<typeof ReportCycleTimeBucketSchema>;

export const ReportTechnicianRankingSchema = z.object({
	technicianId: z.string(),
	technicianName: z.string(),
	reportsApproved: z.number(),
	avgClosureDays: z.number().nullable(),
});
export type ReportTechnicianRanking = z.infer<typeof ReportTechnicianRankingSchema>;

export const ReportBillingVsCostSchema = z.object({
	month: z.string(),
	billed: z.number(),
	cost: z.number(),
	margin: z.number(),
});
export type ReportBillingVsCost = z.infer<typeof ReportBillingVsCostSchema>;

export type AnalyticsPeriod = z.infer<typeof AnalyticsPeriodSchema>;
export type DashboardKpisQuery = z.infer<typeof DashboardKpisQuerySchema>;
export type ErrorDashboardQuery = z.infer<typeof ErrorDashboardQuerySchema>;
export type ExtendedKpisQuery = z.infer<typeof ExtendedKpisQuerySchema>;
export type DashboardTimeSeriesQuery = z.infer<typeof DashboardTimeSeriesQuerySchema>;
export type DashboardTopAssetsQuery = z.infer<typeof DashboardTopAssetsQuerySchema>;
export type DashboardTechnicianWorkloadQuery = z.infer<
	typeof DashboardTechnicianWorkloadQuerySchema
>;
export type ReportAnalyticsQuery = z.infer<typeof ReportAnalyticsQuerySchema>;
export type KpiPeriodPair = z.infer<typeof KpiPeriodPairSchema>;
export type ExtendedKpis = z.infer<typeof ExtendedKpisSchema>;
export type DashboardTimeSeriesPoint = z.infer<typeof DashboardTimeSeriesPointSchema>;
export type DashboardTopAsset = z.infer<typeof DashboardTopAssetSchema>;
export type DashboardTechnicianWorkloadRow = z.infer<typeof DashboardTechnicianWorkloadRowSchema>;
export type AlertSeverity = z.infer<typeof AlertSeveritySchema>;
export type AlertType = z.infer<typeof AlertTypeSchema>;
export type DashboardAlert = z.infer<typeof AlertSchema>;
export type NotificationId = z.infer<typeof NotificationIdSchema>;
