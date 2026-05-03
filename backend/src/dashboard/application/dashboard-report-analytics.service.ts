import type {
	AnalyticsPeriod,
	ReportBillingVsCost,
	ReportCycleTimeBucket,
	ReportTechnicianRanking,
	WorkReportDocument,
} from "@cermont/shared-types";
import { container } from "../../_shared/config/container";
import { getClosureDays, getPeriodWindow, roundMetric } from "./dashboard.helpers";

function resolveCycleBucket(days: number): string {
	if (days < 1) {
		return "<1d";
	}

	if (days <= 3) {
		return "1-3d";
	}

	if (days <= 5) {
		return "3-5d";
	}

	if (days <= 7) {
		return "5-7d";
	}

	return ">7d";
}

function createCycleBuckets(): ReportCycleTimeBucket[] {
	return ["<1d", "1-3d", "3-5d", "5-7d", ">7d"].map((bucket) => ({
		bucket,
		count: 0,
	}));
}

async function getApprovedReportsForPeriod(period: AnalyticsPeriod): Promise<WorkReportDocument[]> {
	const dateWindow = getPeriodWindow(period);
	const result = await container.workReportRepository.findAll(
		{
			status: "approved",
			approvedAt: { $gte: dateWindow.start, $lte: dateWindow.end },
		},
		1,
		5000,
	);

	return result.data;
}

async function getOrdersByReportOrderId(reports: WorkReportDocument[]) {
	const orderIds = Array.from(new Set(reports.map((report) => report.orderId.toString())));

	if (orderIds.length === 0) {
		return new Map<
			string,
			Awaited<ReturnType<typeof container.orderRepository.findPaginated>>[number]
		>();
	}

	const orders = await container.orderRepository.findPaginated(
		{ _id: { $in: orderIds } },
		{ skip: 0, limit: orderIds.length },
	);

	return new Map(orders.map((order) => [order._id.toString(), order]));
}

export async function getReportCycleTimeDistribution(
	period: AnalyticsPeriod = "30d",
): Promise<ReportCycleTimeBucket[]> {
	const reports = await getApprovedReportsForPeriod(period);
	const ordersById = await getOrdersByReportOrderId(reports);
	const buckets = createCycleBuckets();
	const bucketMap = new Map(buckets.map((bucket) => [bucket.bucket, bucket]));

	for (const report of reports) {
		const order = ordersById.get(report.orderId.toString());
		const closureDays = getClosureDays(order?.completedAt ?? null, report.approvedAt ?? null);

		if (closureDays === null) {
			continue;
		}

		const bucket = bucketMap.get(resolveCycleBucket(closureDays));
		if (bucket) {
			bucket.count += 1;
		}
	}

	return buckets;
}

export async function getReportTechnicianRanking(
	period: AnalyticsPeriod = "30d",
): Promise<ReportTechnicianRanking[]> {
	const reports = await getApprovedReportsForPeriod(period);
	const ordersById = await getOrdersByReportOrderId(reports);
	const rankingMap = new Map<
		string,
		{
			technicianId: string;
			technicianName: string;
			reportsApproved: number;
			totalClosureDays: number;
			closureCount: number;
		}
	>();

	for (const report of reports) {
		const order = ordersById.get(report.orderId.toString());
		const technicianId = order?.assignedTo?.toString() || "unassigned";
		const technicianName = order?.assignedToName || "Sin tecnico asignado";
		const existing =
			rankingMap.get(technicianId) ??
			({
				technicianId,
				technicianName,
				reportsApproved: 0,
				totalClosureDays: 0,
				closureCount: 0,
			} satisfies {
				technicianId: string;
				technicianName: string;
				reportsApproved: number;
				totalClosureDays: number;
				closureCount: number;
			});
		const closureDays = getClosureDays(order?.completedAt ?? null, report.approvedAt ?? null);

		existing.reportsApproved += 1;
		if (closureDays !== null) {
			existing.totalClosureDays += closureDays;
			existing.closureCount += 1;
		}
		rankingMap.set(technicianId, existing);
	}

	return Array.from(rankingMap.values())
		.map((row) => ({
			technicianId: row.technicianId,
			technicianName: row.technicianName,
			reportsApproved: row.reportsApproved,
			avgClosureDays:
				row.closureCount > 0 ? roundMetric(row.totalClosureDays / row.closureCount) : null,
		}))
		.sort((left, right) => {
			if (right.reportsApproved !== left.reportsApproved) {
				return right.reportsApproved - left.reportsApproved;
			}

			return (left.avgClosureDays ?? 999) - (right.avgClosureDays ?? 999);
		})
		.slice(0, 10);
}

export async function getBillingVsCost(
	period: AnalyticsPeriod = "30d",
): Promise<ReportBillingVsCost[]> {
	const dateWindow = getPeriodWindow(period);
	const rows = await container.costRepository.aggregate<{
		_id: string;
		billed: number;
		cost: number;
	}>([
		{
			$match: {
				recordedAt: { $gte: dateWindow.start, $lte: dateWindow.end },
			},
		},
		{
			$project: {
				month: { $dateToString: { format: "%Y-%m", date: "$recordedAt" } },
				billed: "$estimatedAmount",
				cost: { $add: ["$actualAmount", "$taxAmount"] },
			},
		},
		{
			$group: {
				_id: "$month",
				billed: { $sum: "$billed" },
				cost: { $sum: "$cost" },
			},
		},
		{ $sort: { _id: 1 } },
	]);

	return rows.map((row) => ({
		month: row._id,
		billed: row.billed,
		cost: row.cost,
		margin: row.billed - row.cost,
	}));
}
