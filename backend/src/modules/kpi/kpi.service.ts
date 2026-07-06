import type { DashboardKpiSummary, KpiTimeRange } from "@cermont/shared-types";
import mongoose from "mongoose";

function getDateRange(period: KpiTimeRange): Date {
	const now = new Date();
	const map: Record<KpiTimeRange, number> = { "7d": 7, "30d": 30, "90d": 90, "12m": 365 };
	return new Date(now.getTime() - (map[period] || 30) * 24 * 60 * 60 * 1000);
}

export async function calculateMttr(period: KpiTimeRange) {
	const since = getDateRange(period);
	const ExecutionSession = mongoose.model("ExecutionSession");

	const sessions = await ExecutionSession.find({
		status: "completed",
		updatedAt: { $gte: since },
	}).lean();

	const totalRepairHours = (sessions as Array<Record<string, unknown>>).reduce(
		(sum: number, s: Record<string, unknown>) => {
			const elapsed = (s.elapsedMinutes as number) || 0;
			return sum + elapsed / 60;
		},
		0,
	);

	return {
		period,
		totalRepairHours,
		totalRepairEvents: sessions.length,
		mttrHours: sessions.length > 0 ? totalRepairHours / sessions.length : 0,
		trend: 0,
	};
}

export async function calculateMtbf(period: KpiTimeRange) {
	const since = getDateRange(period);
	const Maintenance = mongoose.model("Maintenance");

	const failures = await Maintenance.countDocuments({
		type: "corrective",
		createdAt: { $gte: since },
	});

	const totalDays = period === "12m" ? 365 : period === "90d" ? 90 : period === "30d" ? 30 : 7;

	return {
		period,
		totalOperationalHours: totalDays * 24,
		totalFailures: failures,
		mtbfHours: failures > 0 ? (totalDays * 24) / failures : totalDays * 24,
		trend: 0,
	};
}

export async function calculateFirstTimeFixRate(period: KpiTimeRange) {
	const since = getDateRange(period);
	const Order = mongoose.model("Order");

	const orders = await Order.find({
		createdAt: { $gte: since },
		lifecycleStatus: { $ne: "deleted" },
	}).lean();

	const totalJobs = orders.length;
	const firstTimeFixes = (orders as Array<Record<string, unknown>>).filter(
		(o: Record<string, unknown>) => ((o.visitCount as number) || 1) === 1,
	).length;

	return {
		period,
		totalJobs,
		firstTimeFixes,
		rate: totalJobs > 0 ? (firstTimeFixes / totalJobs) * 100 : 0,
		trend: 0,
	};
}

export async function getDashboardKpiSummary(
	period: KpiTimeRange = "30d",
): Promise<DashboardKpiSummary> {
	const [mttr, mtbf, firstTimeFixRate] = await Promise.all([
		calculateMttr(period),
		calculateMtbf(period),
		calculateFirstTimeFixRate(period),
	]);

	return {
		mttr,
		mtbf,
		firstTimeFixRate,
		technicianUtilization: {
			period,
			totalAvailableHours: 0,
			totalBilledHours: 0,
			utilizationRate: 0,
			trend: 0,
		},
		period,
		calculatedAt: new Date().toISOString(),
	} as DashboardKpiSummary;
}
