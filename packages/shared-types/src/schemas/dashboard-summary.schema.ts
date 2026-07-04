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
		totalOutstandingAmount: z.number().nonnegative(),
		totalOverdueAmount: z.number().nonnegative(),
		overdueInvoiceCount: z.number().int().nonnegative(),
	})
	.strict();

// ── Field readiness ──────────────────────────────────────────────────

export const DashboardFieldReadinessSchema = z
	.object({
		blockingChecklistsPending: z.number().int().nonnegative(),
		blockingChecklistsFailed: z.number().int().nonnegative(),
		evidencePendingReview: z.number().int().nonnegative(),
		evidenceRejected: z.number().int().nonnegative(),
		evidenceGpsCoveragePct: z.number().min(0).max(100),
		vehicleDocumentsExpiring: z.number().int().nonnegative(),
		vehicleDocumentsExpired: z.number().int().nonnegative(),
		toolCertificationsExpiring: z.number().int().nonnegative(),
		toolCertificationsExpired: z.number().int().nonnegative(),
		offlineSyncPending: z.number().int().nonnegative(),
		offlineSyncFailed: z.number().int().nonnegative(),
	})
	.strict();

// ── Multi-service demand ─────────────────────────────────────────────

export const DashboardServiceDemandItemSchema = z
	.object({
		serviceType: z.string().trim().min(1).max(120),
		requests: z.number().int().nonnegative(),
	})
	.strict();

export const DashboardServiceDemandSchema = z
	.object({
		periodDays: z.number().int().positive(),
		totalRequests: z.number().int().nonnegative(),
		items: z.array(DashboardServiceDemandItemSchema),
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

// ── Maintenance Efficiency (MTTR / MTBF) ───────────────────────────────
// MTTR: Mean Time To Repair — average hours to complete a work order
// MTBF: Mean Time Between Failures — average days between maintenance events

export const DashboardMaintenanceEfficiencySchema = z
	.object({
		mttrHours: z.number().nonnegative(),
		mtbfDays: z.number().nonnegative(),
		maintenanceCompletionRate: z.number().min(0).max(100),
		activeWorkOrders: z.number().int().nonnegative(),
		overdueWorkOrders: z.number().int().nonnegative(),
		technicianUtilizationPct: z.number().min(0).max(100).optional(),
	})
	.strict();

// ── SLA Risk Orders ────────────────────────────────────────────────────
// Active cases whose target completion date is overdue or expiring soon.
// riskLevel: critical = overdue or under 24h, warning = under 72h.

export const DashboardSlaRiskOrderSchema = z
	.object({
		serviceCaseId: z.string(),
		code: z.string(),
		clientName: z.string().optional(),
		slaDeadline: z.string().datetime(),
		hoursRemaining: z.number(),
		currentStep: z.number().int().min(1).max(14),
		riskLevel: z.enum(["warning", "critical"]),
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
		fieldReadiness: DashboardFieldReadinessSchema,
		serviceDemand: DashboardServiceDemandSchema,
		costVariance: DashboardCostVarianceSchema,
		documentWorkload: DashboardDocumentWorkloadSchema,
		assetMaintenance: DashboardAssetMaintenanceSchema,
		maintenanceEfficiency: DashboardMaintenanceEfficiencySchema.optional(),
		slaRiskOrders: z.array(DashboardSlaRiskOrderSchema).default([]),
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
export type DashboardFieldReadiness = z.infer<typeof DashboardFieldReadinessSchema>;
export type DashboardServiceDemand = z.infer<typeof DashboardServiceDemandSchema>;
export type DashboardServiceDemandItem = z.infer<typeof DashboardServiceDemandItemSchema>;
export type DashboardCostVariance = z.infer<typeof DashboardCostVarianceSchema>;
export type DashboardDocumentWorkload = z.infer<typeof DashboardDocumentWorkloadSchema>;
export type DashboardAssetMaintenance = z.infer<typeof DashboardAssetMaintenanceSchema>;
export type DashboardMaintenanceEfficiency = z.infer<typeof DashboardMaintenanceEfficiencySchema>;
export type DashboardSlaRiskOrder = z.infer<typeof DashboardSlaRiskOrderSchema>;
export type DashboardOfflineSync = z.infer<typeof DashboardOfflineSyncSchema>;
export type DashboardRecentActivity = z.infer<typeof DashboardRecentActivitySchema>;
export type DashboardCharts = z.infer<typeof DashboardChartsSchema>;
export type DashboardChartPoint = z.infer<typeof DashboardChartPointSchema>;
export type DashboardSystemHealth = z.infer<typeof DashboardSystemHealthSchema>;
