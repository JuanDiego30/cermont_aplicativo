import { createLogger } from "../../_shared/common/utils";
import { container } from "../../_shared/config/container";
import {
	buildDateRangeFilter,
	buildFinancial,
	buildGroupedCountPipeline,
	buildLeadTime,
	CLOSED_STATUSES,
	calcCompletionRate,
	MS_PER_DAY,
	mergeFilters,
	resolveClientUserIds,
	toCountMap,
} from "./dashboard.helpers";
import type {
	ChecklistAggregateRow,
	FinancialAggregateRow,
	GroupCount,
	KpiFilters,
	KpiResult,
	LeadTimeAggregateRow,
} from "./dashboard.types";

const log = createLogger("analytics-service");

const groupByField = (field: string, filters: KpiFilters, clientIds?: string[]) =>
	container.orderRepository.aggregate<GroupCount>(
		buildGroupedCountPipeline(field, filters, clientIds),
	);

const queryFinancialSummary = (filters: KpiFilters, clientIds?: string[]) =>
	container.costRepository.aggregate<FinancialAggregateRow>([
		...(Object.keys(buildDateRangeFilter("recordedAt", filters)).length > 0
			? [{ $match: buildDateRangeFilter("recordedAt", filters) }]
			: []),
		...(clientIds?.length ? [{ $match: { createdBy: { $in: clientIds } } }] : []),
		{
			$group: {
				_id: null,
				total_actual: { $sum: "$total" },
				count: { $sum: 1 },
			},
		},
	]);

const queryChecklistStats = (filters: KpiFilters, clientIds?: string[]) =>
	container.checklistRepository.aggregate<ChecklistAggregateRow>([
		...(Object.keys(buildDateRangeFilter("createdAt", filters)).length > 0
			? [{ $match: buildDateRangeFilter("createdAt", filters) }]
			: []),
		...(clientIds?.length ? [{ $match: { createdBy: { $in: clientIds } } }] : []),
		{
			$group: {
				_id: null,
				total: { $sum: 1 },
				completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
			},
		},
	]);

const queryLeadTimeStats = (filters: KpiFilters, clientIds?: string[]) => {
	const completedAtRange = buildDateRangeFilter("completedAt", filters);
	const completedAtClause = (completedAtRange.completedAt ?? {}) as Record<string, Date>;
	const clientMatch = clientIds?.length ? { createdBy: { $in: clientIds } } : {};

	return container.orderRepository.aggregate<LeadTimeAggregateRow>([
		{
			$match: mergeFilters(
				{ status: "closed", completedAt: { $exists: true, ...completedAtClause } },
				clientMatch,
			),
		},
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
};

const queryOverdueCount = (filters: KpiFilters, clientIds?: string[]) => {
	const thirtyDaysAgo = new Date(Date.now() - 30 * MS_PER_DAY);
	const createdAtRange =
		(buildDateRangeFilter("createdAt", filters).createdAt as Record<string, Date> | undefined) ??
		{};
	const clientMatch = clientIds?.length ? { createdBy: { $in: clientIds } } : {};

	return container.orderRepository.countDocuments(
		mergeFilters(
			{
				createdAt: { ...createdAtRange, $lt: thirtyDaysAgo },
				status: { $nin: [...CLOSED_STATUSES] },
			},
			clientMatch,
		),
	);
};

const queryMaintenanceOpenCount = () =>
	container.maintenanceKitRepository.countDocuments({ is_active: true });

const queryResourceInUseCount = () =>
	container.resourceRepository.countDocuments({ status: "in_use" });

const queryCompletedMonthCount = (clientIds?: string[]) => {
	const startOfMonth = new Date();
	startOfMonth.setDate(1);
	startOfMonth.setHours(0, 0, 0, 0);
	const clientMatch = clientIds?.length ? { createdBy: { $in: clientIds } } : {};
	return container.orderRepository.countDocuments(
		mergeFilters({ status: "closed", completedAt: { $gte: startOfMonth } }, clientMatch),
	);
};

const queryCompletedCountByFilter = (filters: KpiFilters, clientIds?: string[]) => {
	const clientMatch = clientIds?.length ? { createdBy: { $in: clientIds } } : {};
	return container.orderRepository.countDocuments(
		mergeFilters(
			{ status: "closed", ...buildDateRangeFilter("completedAt", filters) },
			clientMatch,
		),
	);
};

export async function getKpis(filters: KpiFilters = {}): Promise<KpiResult> {
	const orderDateFilter = buildDateRangeFilter("createdAt", filters);
	const hasDateFilter = Object.keys(orderDateFilter).length > 0;
	const clientIds = filters.client?.trim()
		? await resolveClientUserIds(filters.client.trim())
		: undefined;

	const clientOrderFilter = clientIds?.length ? { createdBy: { $in: clientIds } } : {};

	const [
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
		groupByField("status", filters, clientIds),
		groupByField("priority", filters, clientIds),
		groupByField("type", filters, clientIds),
		queryFinancialSummary(filters, clientIds),
		queryChecklistStats(filters, clientIds),
		queryLeadTimeStats(filters, clientIds),
		queryOverdueCount(filters, clientIds),
		container.orderRepository.countDocuments(mergeFilters(orderDateFilter, clientOrderFilter)),
		queryMaintenanceOpenCount(),
		queryResourceInUseCount(),
		hasDateFilter
			? queryCompletedCountByFilter(filters, clientIds)
			: queryCompletedMonthCount(clientIds),
	]);

	const byStage = toCountMap(stageGroups);
	const byPriority = toCountMap(priorityGroups);
	const byType = toCountMap(typeGroups);
	const checklist = checklistRaw[0] ?? { total: 0, completed: 0 };
	const activeOrders = totalOrders - CLOSED_STATUSES.reduce((acc, s) => acc + (byStage[s] ?? 0), 0);

	log.info("KPIs computed", {
		totalOrders,
		activeOrders,
		overdueCount,
		clientFilter: filters.client ?? "none",
	});

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
