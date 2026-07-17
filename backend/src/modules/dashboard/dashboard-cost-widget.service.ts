import type { DashboardKpiWidget, KpiTimeRange } from "@cermont/shared-types";
import { Cost } from "../../models/Cost";
import { getDashboardKpiSummary } from "../kpi/kpi.service";

export async function buildCostComparisonChart() {
	const data = await Cost.aggregate<{ _id: string; proposed: number; actual: number }>([
		{
			$group: {
				_id: "$serviceType",
				proposed: { $sum: "$estimatedAmount" },
				actual: { $sum: "$actualAmount" },
			},
		},
		{ $sort: { actual: -1 } },
	]);

	return data.map((entry) => ({
		label: entry._id || "Sin categoría",
		proposed: entry.proposed,
		actual: entry.actual,
	}));
}

export async function getDashboardKpiWidgetData(
	period: KpiTimeRange = "30d",
): Promise<DashboardKpiWidget> {
	const kpis = await getDashboardKpiSummary(period);
	return {
		mttr: kpis.mttr.mttrHours,
		mtbf: kpis.mtbf.mtbfHours,
		firstTimeFixRate: kpis.firstTimeFixRate.rate,
		technicianUtilizationRate: kpis.technicianUtilization.utilizationRate,
		slaCompliance: 0,
		pendingCertifications: 0,
		periodLabel: period,
	};
}
