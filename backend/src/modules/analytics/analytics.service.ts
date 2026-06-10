import { ServiceUnavailableError } from "../../common/errors/AppError";
import { getErrorMetrics } from "../../common/observability/error-metrics";
import { createLogger } from "../../common/utils/logger";
import { isTransientDatabaseError } from "../../common/utils/transient-database-error";
import { Checklist } from "../../models/Checklist";
import { Cost } from "../../models/Cost";
import { MaintenanceKit } from "../../models/MaintenanceKit";
import { Order } from "../../models/Order";
import { Resource } from "../../models/Resource";

const log = createLogger("analytics-service");

// ─── Constantes ──────────────────────────────────────────────────────────────

const CLOSED_STATUSES = ["closed", "cancelled"] as const;
const MS_PER_DAY = 1_000 * 60 * 60 * 24;
const DEFAULT_CURRENCY = "COP";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface GroupCount {
	_id: string;
	count: number;
}

export interface KpiOverview {
	total_orders: number;
	active_orders: number;
	overdue_orders: number;
	closed_orders: number;
	maintenance_open_count: number;
	resource_in_use_count: number;
	completed_month_count: number;
}

export interface KpiFinancial {
	total_actual: number;
	count: number;
	currency: string;
}

export interface KpiChecklists {
	total: number;
	completed: number;
	completion_rate_pct: number;
}

export interface KpiLeadTime {
	avg_lead_time_days: number;
	min_lead_time_days: number;
	max_lead_time_days: number;
	count: number;
}

interface FinancialAggregate extends KpiFinancial {
	_id: string;
}

interface LeadTimeAggregate extends KpiLeadTime {
	_id: string;
}

interface ChecklistAggregate {
	total: number;
	completed: number;
}

export interface KpiSnapshot {
	overview: KpiOverview;
	by_stage: Record<string, number>;
	by_priority: Record<string, number>;
	by_type: Record<string, number>;
	financial: KpiFinancial;
	checklists: KpiChecklists;
	lead_time: KpiLeadTime;
	generated_at: string;
}

export interface ErrorDashboardSnapshot {
	total_errors: number;
	by_module: Array<{ module: string; count: number }>;
	by_endpoint: Array<{ module: string; endpoint: string; count: number; last_error_at: string }>;
	generated_at: string;
}

// ─── Helpers puros (DRY + KISS) ──────────────────────────────────────────────

function toCountMap(groups: GroupCount[]): Record<string, number> {
	return Object.fromEntries(groups.map(({ _id, count }) => [_id, count]));
}

function calcCompletionRate(completed: number, total: number): number {
	return total > 0 ? Math.round((completed / total) * 100) : 0;
}

function buildFinancial(raw: FinancialAggregate | undefined): KpiFinancial {
	const defaults: KpiFinancial = {
		total_actual: 0,
		count: 0,
		currency: DEFAULT_CURRENCY,
	};
	if (!raw) {
		return defaults;
	}
	return {
		total_actual: raw.total_actual,
		count: raw.count,
		currency: DEFAULT_CURRENCY,
	};
}

function buildLeadTime(raw: LeadTimeAggregate | undefined): KpiLeadTime {
	if (!raw) {
		return {
			avg_lead_time_days: 0,
			min_lead_time_days: 0,
			max_lead_time_days: 0,
			count: 0,
		};
	}
	return {
		avg_lead_time_days: raw.avg_lead_time_days ?? 0,
		min_lead_time_days: raw.min_lead_time_days ?? 0,
		max_lead_time_days: raw.max_lead_time_days ?? 0,
		count: raw.count,
	};
}

// ─── Consultas MongoDB (SRP: cada función hace una sola cosa) ─────────────────

const groupByField = (field: string) =>
	Order.aggregate<GroupCount>([
		{ $group: { _id: `$${field}`, count: { $sum: 1 } } },
		{ $sort: { count: -1 } },
	]);

const queryFinancialSummary = () =>
	Cost.aggregate<FinancialAggregate>([
		{
			$group: {
				_id: null,
				total_actual: { $sum: "$total" },
				count: { $sum: 1 },
			},
		},
	]);

const queryChecklistStats = () =>
	Checklist.aggregate([
		{
			$group: {
				_id: null,
				total: { $sum: 1 },
				completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
			},
		},
	]);

const queryLeadTimeStats = () =>
	Order.aggregate<LeadTimeAggregate>([
		{ $match: { status: "closed", completedAt: { $exists: true } } },
		{
			$project: {
				lead_time_days: {
					$divide: [{ $subtract: ["$completedAt", "$createdAt"] }, MS_PER_DAY],
				},
			},
		},
		{
			$group: {
				_id: null,
				avg_lead_time_days: { $avg: "$lead_time_days" },
				min_lead_time_days: { $min: "$lead_time_days" },
				max_lead_time_days: { $max: "$lead_time_days" },
				count: { $sum: 1 },
			},
		},
	]);

const queryOverdueCount = () => {
	const thirtyDaysAgo = new Date(Date.now() - 30 * MS_PER_DAY);
	return Order.countDocuments({
		createdAt: { $lt: thirtyDaysAgo },
		status: { $nin: [...CLOSED_STATUSES] },
	});
};

const queryMaintenanceOpenCount = () => MaintenanceKit.countDocuments({ is_active: true });
const queryResourceInUseCount = () => Resource.countDocuments({ status: "in_use" });
const queryCompletedMonthCount = () => {
	const startOfMonth = new Date();
	startOfMonth.setDate(1);
	startOfMonth.setHours(0, 0, 0, 0);
	return Order.countDocuments({ status: "closed", completedAt: { $gte: startOfMonth } });
};

// ─── Servicio ─────────────────────────────────────────────────────────────────

export async function getKpis(): Promise<KpiSnapshot> {
	let stageGroups: GroupCount[];
	let priorityGroups: GroupCount[];
	let typeGroups: GroupCount[];
	let financialRaw: FinancialAggregate[];
	let checklistRaw: ChecklistAggregate[];
	let leadTimeRaw: LeadTimeAggregate[];
	let overdueCount: number;
	let totalOrders: number;
	let maintenanceOpenCount: number;
	let resourceInUseCount: number;
	let completedMonthCount: number;

	try {
		[
			stageGroups,
			priorityGroups,
			typeGroups,
			financialRaw,
			checklistRaw,
			leadTimeRaw,
			overdueCount,
			totalOrders,
			maintenanceOpenCount,
			resourceInUseCount,
			completedMonthCount,
		] = await Promise.all([
			groupByField("status"),
			groupByField("priority"),
			groupByField("type"),
			queryFinancialSummary(),
			queryChecklistStats(),
			queryLeadTimeStats(),
			queryOverdueCount(),
			Order.countDocuments(),
			queryMaintenanceOpenCount(),
			queryResourceInUseCount(),
			queryCompletedMonthCount(),
		]);
	} catch (error) {
		if (isTransientDatabaseError(error as Error)) {
			throw new ServiceUnavailableError("Database temporarily unavailable. Please try again.");
		}
		throw error;
	}

	const byStage = toCountMap(stageGroups);
	const byPriority = toCountMap(priorityGroups);
	const byType = toCountMap(typeGroups);
	const checklist = checklistRaw[0] ?? { total: 0, completed: 0 };
	const activeOrders = totalOrders - CLOSED_STATUSES.reduce((acc, s) => acc + (byStage[s] ?? 0), 0);

	log.info("KPIs computed", { totalOrders, activeOrders, overdueCount });

	return {
		overview: {
			total_orders: totalOrders,
			active_orders: activeOrders,
			overdue_orders: overdueCount,
			closed_orders: byStage.closed ?? 0,
			maintenance_open_count: maintenanceOpenCount,
			resource_in_use_count: resourceInUseCount,
			completed_month_count: completedMonthCount,
		},
		by_stage: byStage,
		by_priority: byPriority,
		by_type: byType,
		financial: buildFinancial(financialRaw[0]),
		checklists: {
			total: checklist.total,
			completed: checklist.completed,
			completion_rate_pct: calcCompletionRate(checklist.completed, checklist.total),
		},
		lead_time: buildLeadTime(leadTimeRaw[0]),
		generated_at: new Date().toISOString(),
	};
}

export function getErrorDashboard(limit = 10): ErrorDashboardSnapshot {
	const metrics = getErrorMetrics(limit);

	return {
		total_errors: metrics.totalErrors,
		by_module: metrics.modules,
		by_endpoint: metrics.endpoints.map((endpoint) => ({
			module: endpoint.module,
			endpoint: endpoint.endpoint,
			count: endpoint.count,
			last_error_at: endpoint.lastErrorAt,
		})),
		generated_at: metrics.generatedAt,
	};
}

export function getSystemMetrics(): {
	status: "operational" | "degraded" | "unhealthy";
	timestamp: string;
	uptime_seconds: number;
	memory: {
		rss_mb: number;
		heap_used_mb: number;
		external_mb: number;
	};
	version: string;
} {
	const memory = process.memoryUsage();
	const uptime = process.uptime();

	return {
		status: "operational",
		timestamp: new Date().toISOString(),
		uptime_seconds: Math.round(uptime),
		memory: {
			rss_mb: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
			heap_used_mb: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
			external_mb: Math.round((memory.external / 1024 / 1024) * 100) / 100,
		},
		version: "1.0.0",
	};
}
