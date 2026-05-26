import { z } from "zod";

/**
 * Dashboard Summary Schema — Contract for GET /api/dashboard/summary
 *
 * PROMPT 01 — Dashboard / KPIs
 * Single source of truth for the gerencial dashboard.
 * Contains ONLY business KPIs. Technical errors go to /api/observability/errors.
 */

// ── Pipeline ──────────────────────────────────────────────────────────

export const DashboardStageMetricSchema = z
	.object({
		stage: z.string(),
		label: z.string(),
		count: z.number().int().nonnegative(),
		order: z.number().int(),
	})
	.strict();

export const DashboardPipelineSummarySchema = z
	.object({
		stages: z.array(DashboardStageMetricSchema),
		totalActive: z.number().int().nonnegative(),
		totalClosed: z.number().int().nonnegative(),
		completionRate: z.number().min(0).max(100),
	})
	.strict();

// ── Blockers ──────────────────────────────────────────────────────────

export const DashboardBlockerSummarySchema = z
	.object({
		totalBlockers: z.number().int().nonnegative(),
		criticalBlockers: z.number().int().nonnegative(),
		blockedCases: z.number().int().nonnegative(),
	})
	.strict();

// ── Next Actions ──────────────────────────────────────────────────────

export const DashboardNextActionSchema = z
	.object({
		command: z.string(),
		label: z.string(),
		requiredRole: z.string(),
		count: z.number().int().nonnegative(),
	})
	.strict();

// ── Administrative Closure ─────────────────────────────────────────────

export const DashboardAdministrativeClosureSchema = z
	.object({
		pendingDeliveryRecords: z.number().int().nonnegative(),
		pendingSES: z.number().int().nonnegative(),
		pendingInvoices: z.number().int().nonnegative(),
		pendingPayments: z.number().int().nonnegative(),
	})
	.strict();

// ── Financial Aging ────────────────────────────────────────────────────

export const DashboardAgingBucketSchema = z
	.object({
		bucket: z.string(),
		minDays: z.number().int().optional(),
		maxDays: z.number().int().optional(),
		count: z.number().int().nonnegative(),
		amount: z.number().nonnegative(),
		currency: z.string().default("COP"),
	})
	.strict();

export const DashboardFinancialAgingSchema = z
	.object({
		buckets: z.array(DashboardAgingBucketSchema),
		totalOutstanding: z.number().nonnegative(),
		totalOverdue: z.number().nonnegative(),
	})
	.strict();

// ── Cost Variance ──────────────────────────────────────────────────────

export const DashboardCostVarianceSchema = z
	.object({
		estimatedCost: z.number().nonnegative(),
		actualCost: z.number().nonnegative(),
		variance: z.number(),
		variancePct: z.number(),
		currency: z.string().default("COP"),
	})
	.strict();

// ── Document Workload ──────────────────────────────────────────────────

export const DashboardDocumentWorkloadSchema = z
	.object({
		pendingImports: z.number().int().nonnegative(),
		pendingTemplates: z.number().int().nonnegative(),
		pendingResponses: z.number().int().nonnegative(),
		totalDocuments: z.number().int().nonnegative(),
	})
	.strict();

// ── Assets / Maintenance ───────────────────────────────────────────────

export const DashboardAssetMaintenanceSchema = z
	.object({
		totalAssets: z.number().int().nonnegative(),
		activeMaintenance: z.number().int().nonnegative(),
		expiringCertificates: z.number().int().nonnegative(),
		overdueMaintenance: z.number().int().nonnegative(),
	})
	.strict();

// ── Offline Sync ───────────────────────────────────────────────────────

export const DashboardOfflineSyncSchema = z
	.object({
		pendingSyncItems: z.number().int().nonnegative(),
		lastSyncAt: z.string().datetime().optional(),
		syncErrors: z.number().int().nonnegative(),
	})
	.strict();

// ── Recent Activity ────────────────────────────────────────────────────

export const DashboardRecentActivitySchema = z
	.object({
		items: z.array(
			z.object({
				event: z.string(),
				entityType: z.string(),
				entityCode: z.string().optional(),
				occurredAt: z.string().datetime(),
			}),
		),
	})
	.strict();

// ── Charts ─────────────────────────────────────────────────────────────

export const DashboardChartPointSchema = z
	.object({
		label: z.string(),
		value: z.number(),
	})
	.strict();

export const DashboardChartsSchema = z
	.object({
		ordersByStatus: z.array(DashboardChartPointSchema),
		ordersByMonth: z.array(
			z.object({
				month: z.string(),
				created: z.number().int().nonnegative(),
				completed: z.number().int().nonnegative(),
			}),
		),
		costByCategory: z.array(DashboardChartPointSchema),
	})
	.strict();

// ── System Health (optional, small, clearly separated) ─────────────────

export const DashboardSystemHealthSchema = z
	.object({
		status: z.enum(["healthy", "degraded", "unhealthy"]),
		dbState: z.string(),
		uptimeSeconds: z.number().nonnegative(),
	})
	.strict();

// ── Main Summary ───────────────────────────────────────────────────────

export const DashboardSummarySchema = z
	.object({
		generatedAt: z.string().datetime(),
		operationalPipeline: DashboardPipelineSummarySchema,
		blockers: DashboardBlockerSummarySchema,
		nextActions: z.array(DashboardNextActionSchema),
		administrativeClosure: DashboardAdministrativeClosureSchema,
		financialAging: DashboardFinancialAgingSchema,
		costVariance: DashboardCostVarianceSchema,
		documentWorkload: DashboardDocumentWorkloadSchema,
		assetMaintenance: DashboardAssetMaintenanceSchema,
		offlineSync: DashboardOfflineSyncSchema,
		recentActivity: DashboardRecentActivitySchema,
		charts: DashboardChartsSchema,
		systemHealth: DashboardSystemHealthSchema.optional(),
	})
	.strict();

export type DashboardSummary = z.infer<typeof DashboardSummarySchema>;
export type DashboardPipelineSummary = z.infer<typeof DashboardPipelineSummarySchema>;
export type DashboardStageMetric = z.infer<typeof DashboardStageMetricSchema>;
export type DashboardBlockerSummary = z.infer<typeof DashboardBlockerSummarySchema>;
export type DashboardNextAction = z.infer<typeof DashboardNextActionSchema>;
export type DashboardAdministrativeClosure = z.infer<typeof DashboardAdministrativeClosureSchema>;
export type DashboardFinancialAging = z.infer<typeof DashboardFinancialAgingSchema>;
export type DashboardAgingBucket = z.infer<typeof DashboardAgingBucketSchema>;
export type DashboardCostVariance = z.infer<typeof DashboardCostVarianceSchema>;
export type DashboardDocumentWorkload = z.infer<typeof DashboardDocumentWorkloadSchema>;
export type DashboardAssetMaintenance = z.infer<typeof DashboardAssetMaintenanceSchema>;
export type DashboardOfflineSync = z.infer<typeof DashboardOfflineSyncSchema>;
export type DashboardRecentActivity = z.infer<typeof DashboardRecentActivitySchema>;
export type DashboardCharts = z.infer<typeof DashboardChartsSchema>;
export type DashboardChartPoint = z.infer<typeof DashboardChartPointSchema>;
export type DashboardSystemHealth = z.infer<typeof DashboardSystemHealthSchema>;
