import type { AnalyticsPeriod, DashboardTimeSeriesPoint } from "@cermont/shared-types";
import { container } from "../../_shared/config/container";
import {
	buildDateKeys,
	COMPLETED_STATUSES,
	getPeriodDays,
	mergeFilters,
	resolveClientUserIds,
	toCountMap,
} from "./dashboard.helpers";

export async function getTimeSeries(
	range: AnalyticsPeriod = "30d",
	client?: string,
): Promise<DashboardTimeSeriesPoint[]> {
	const days = getPeriodDays(range);
	const dateKeys = buildDateKeys(days);
	const start = new Date(`${dateKeys[0]}T00:00:00.000Z`);
	const end = new Date(`${dateKeys[dateKeys.length - 1]}T23:59:59.999Z`);
	const clientIds = client?.trim() ? await resolveClientUserIds(client.trim()) : undefined;
	const clientMatch = clientIds?.length ? { createdBy: { $in: clientIds } } : {};
	const createdRows = await container.orderRepository.aggregate<{ _id: string; count: number }>([
		{
			$match: mergeFilters(
				{
					createdAt: { $gte: start, $lte: end },
				},
				clientMatch,
			),
		},
		{
			$project: {
				date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
			},
		},
		{ $group: { _id: "$date", count: { $sum: 1 } } },
		{ $sort: { _id: 1 } },
	]);
	const completedRows = await container.orderRepository.aggregate<{ _id: string; count: number }>([
		{
			$match: mergeFilters(
				{
					status: { $in: [...COMPLETED_STATUSES] },
					completedAt: { $gte: start, $lte: end },
				},
				clientMatch,
			),
		},
		{
			$project: {
				date: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
			},
		},
		{ $group: { _id: "$date", count: { $sum: 1 } } },
		{ $sort: { _id: 1 } },
	]);
	const createdByDate = toCountMap(createdRows);
	const completedByDate = toCountMap(completedRows);

	return dateKeys.map((date) => ({
		date,
		created: createdByDate[date] ?? 0,
		completed: completedByDate[date] ?? 0,
	}));
}
