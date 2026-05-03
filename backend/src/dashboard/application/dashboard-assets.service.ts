import type { DashboardTechnicianWorkloadRow, DashboardTopAsset } from "@cermont/shared-types";
import { container } from "../../_shared/config/container";
import { buildDateKeys } from "./dashboard.helpers";

export async function getTopAssets(limit = 10): Promise<DashboardTopAsset[]> {
	const rows = await container.orderRepository.aggregate<{
		_id: { assetId: string; assetName: string };
		orderCount: number;
	}>([
		{ $group: { _id: { assetId: "$assetId", assetName: "$assetName" }, orderCount: { $sum: 1 } } },
		{ $sort: { orderCount: -1 } },
		{ $limit: limit },
	]);

	return rows.map((row) => ({
		assetId: row._id.assetId,
		assetName: row._id.assetName,
		orderCount: row.orderCount,
	}));
}

export async function getTechnicianWorkload(days = 14): Promise<DashboardTechnicianWorkloadRow[]> {
	const dateKeys = buildDateKeys(days);
	const start = new Date(`${dateKeys[0]}T00:00:00.000Z`);
	const end = new Date(`${dateKeys[dateKeys.length - 1]}T23:59:59.999Z`);
	const rows = await container.orderRepository.aggregate<{
		_id: { technicianId: string; technicianName: string; date: string };
		count: number;
	}>([
		{
			$match: {
				assignedTo: { $exists: true },
				createdAt: { $gte: start, $lte: end },
			},
		},
		{
			$project: {
				technicianId: { $toString: "$assignedTo" },
				technicianName: { $ifNull: ["$assignedToName", "Sin nombre"] },
				date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
			},
		},
		{
			$group: {
				_id: {
					technicianId: "$technicianId",
					technicianName: "$technicianName",
					date: "$date",
				},
				count: { $sum: 1 },
			},
		},
		{ $sort: { "_id.technicianName": 1, "_id.date": 1 } },
	]);
	const rowMap = new Map<string, DashboardTechnicianWorkloadRow>();

	for (const row of rows) {
		const key = row._id.technicianId;
		const existing = rowMap.get(key);
		const next =
			existing ??
			({
				technicianId: key,
				technicianName: row._id.technicianName,
				days: Object.fromEntries(dateKeys.map((date) => [date, 0])),
			} satisfies DashboardTechnicianWorkloadRow);
		next.days[row._id.date] = row.count;
		rowMap.set(key, next);
	}

	return Array.from(rowMap.values());
}
