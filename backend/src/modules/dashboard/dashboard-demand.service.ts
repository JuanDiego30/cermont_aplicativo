import type { DashboardServiceDemand } from "@cermont/shared-types";
import { WorkRequest } from "../../models/WorkRequest";

type ServiceDemandRow = { _id: string; count: number };

export function buildServiceDemandSummary(
	rows: ServiceDemandRow[],
	periodDays: number,
): DashboardServiceDemand {
	const items = rows.map((row) => ({ serviceType: row._id, requests: row.count }));
	return {
		periodDays,
		totalRequests: items.reduce((total, item) => total + item.requests, 0),
		items,
	};
}

export async function buildServiceDemand(periodDays = 30): Promise<DashboardServiceDemand> {
	const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
	const rows = await WorkRequest.aggregate<ServiceDemandRow>([
		{ $match: { createdAt: { $gte: periodStart } } },
		{ $group: { _id: "$serviceType", count: { $sum: 1 } } },
		{ $sort: { count: -1, _id: 1 } },
		{ $limit: 8 },
	]);

	return buildServiceDemandSummary(rows, periodDays);
}
