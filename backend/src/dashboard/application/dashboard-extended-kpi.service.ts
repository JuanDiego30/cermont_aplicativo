import type { AnalyticsPeriod, ExtendedKpis, KpiPeriodPair } from "@cermont/shared-types";
import { createLogger } from "../../_shared/common/utils";
import { container } from "../../_shared/config/container";
import {
	ACTIVE_TECHNICIAN_STATUSES,
	buildWindowFilter,
	CLOSED_STATUSES,
	COMPLETED_STATUSES,
	calcCompletionRate,
	getPeriodWindow,
	MS_PER_DAY,
	roundMetric,
} from "./dashboard.helpers";
import type { DateWindow } from "./dashboard.types";

const log = createLogger("analytics-service");

const countOrders = (filter: Record<string, unknown>) =>
	container.orderRepository.countDocuments(filter);

async function countSlaCompliantOrders(dateWindow: DateWindow): Promise<number> {
	const rows = await container.orderRepository.aggregate<{
		_id: null;
		compliant: number;
		total: number;
	}>([
		{
			$match: {
				status: { $in: [...COMPLETED_STATUSES] },
				completedAt: buildWindowFilter("completedAt", dateWindow).completedAt,
			},
		},
		{
			$project: {
				completedAt: 1,
				slaDate: { $ifNull: ["$slaDueDate", "$dueDate"] },
			},
		},
		{
			$group: {
				_id: null,
				total: { $sum: 1 },
				compliant: {
					$sum: {
						$cond: [
							{
								$and: [{ $ne: ["$slaDate", null] }, { $lte: ["$completedAt", "$slaDate"] }],
							},
							1,
							0,
						],
					},
				},
			},
		},
	]);

	const row = rows[0];
	return row ? calcCompletionRate(row.compliant, row.total) : 0;
}

async function getAverageCycleTime(dateWindow: DateWindow): Promise<number> {
	const now = new Date();
	const rows = await container.orderRepository.aggregate<{
		_id: null;
		avg_cycle_time_days: number;
	}>([
		{ $match: buildWindowFilter("createdAt", dateWindow) },
		{
			$project: {
				cycle_time_days: {
					$divide: [{ $subtract: [{ $ifNull: ["$completedAt", now] }, "$createdAt"] }, MS_PER_DAY],
				},
			},
		},
		{
			$group: {
				_id: null,
				avg_cycle_time_days: { $avg: "$cycle_time_days" },
			},
		},
	]);

	return roundMetric(rows[0]?.avg_cycle_time_days ?? 0);
}

async function getFirstTimeFixRate(dateWindow: DateWindow): Promise<number> {
	const completedFilter = {
		status: { $in: [...COMPLETED_STATUSES] },
		...buildWindowFilter("completedAt", dateWindow),
	};
	const [completed, completedWithoutFollowUp] = await Promise.all([
		countOrders(completedFilter),
		countOrders({
			...completedFilter,
			followUpWorkOrderId: { $exists: false },
		}),
	]);

	return calcCompletionRate(completedWithoutFollowUp, completed);
}

async function getBillingFunnelCop(dateWindow: DateWindow): Promise<number> {
	const rows = await container.orderRepository.aggregate<{ _id: null; total: number }>([
		{
			$match: {
				status: { $in: ["completed", "ready_for_invoicing", "closed"] },
				...buildWindowFilter("updatedAt", dateWindow),
			},
		},
		{ $group: { _id: null, total: { $sum: { $ifNull: ["$commercial.nteAmount", 0] } } } },
	]);
	return rows[0]?.total ?? 0;
}

async function getAvgDaysToInvoice(dateWindow: DateWindow): Promise<number> {
	const rows = await container.orderRepository.aggregate<{
		_id: null;
		avg_days: number | null;
	}>([
		{
			$match: {
				completedAt: { $exists: true },
				"billing.invoiceApprovedAt": { $exists: true },
				...buildWindowFilter("completedAt", dateWindow),
			},
		},
		{
			$project: {
				days: {
					$divide: [{ $subtract: ["$billing.invoiceApprovedAt", "$completedAt"] }, MS_PER_DAY],
				},
			},
		},
		{ $group: { _id: null, avg_days: { $avg: "$days" } } },
	]);
	return roundMetric(rows[0]?.avg_days ?? 0);
}

async function getSlaRiskCount(dateWindow: DateWindow): Promise<number> {
	const riskDeadline = new Date(Math.min(dateWindow.end.getTime(), Date.now() + MS_PER_DAY));
	return countOrders({
		status: { $nin: ["completed", "ready_for_invoicing", "closed", "cancelled"] },
		$or: [{ "scheduleSla.dueAt": { $lt: riskDeadline } }, { dueDate: { $lt: riskDeadline } }],
		...buildWindowFilter("createdAt", dateWindow),
	});
}

async function countActiveTechnicians(dateWindow: DateWindow): Promise<number> {
	const rows = await container.orderRepository.aggregate<{ _id: string }>([
		{
			$match: {
				status: { $in: [...ACTIVE_TECHNICIAN_STATUSES] },
				assignedTo: { $exists: true },
				...buildWindowFilter("updatedAt", dateWindow),
			},
		},
		{ $group: { _id: "$assignedTo" } },
	]);

	return rows.length;
}

async function getExtendedKpiPair(
	period: AnalyticsPeriod,
	resolver: (dateWindow: DateWindow) => Promise<number>,
): Promise<KpiPeriodPair> {
	const [current, previous] = await Promise.all([
		resolver(getPeriodWindow(period)),
		resolver(getPeriodWindow(period, 1)),
	]);

	return { current, previous };
}

async function getFsmFacturacionPendiente(dateWindow: DateWindow): Promise<number> {
	const rows = await container.orderRepository.aggregate<{ _id: null; total: number }>([
		{
			$match: {
				status: {
					$in: ["completed", "ready_for_invoicing", "acta_signed", "ses_sent", "invoice_approved"],
				},
				"billing.paidAt": { $exists: false },
				...buildWindowFilter("updatedAt", dateWindow),
			},
		},
		{ $group: { _id: null, total: { $sum: { $ifNull: ["$commercial.nteAmount", 0] } } } },
	]);
	return rows[0]?.total ?? 0;
}

async function getFsmOrdenesRetraso(dateWindow: DateWindow): Promise<number> {
	const now = new Date();
	return countOrders({
		status: { $in: ["planning", "assigned", "in_progress", "on_hold", "report_pending"] },
		$or: [{ "scheduleSla.dueAt": { $lt: now } }, { slaDueDate: { $lt: now } }],
		...buildWindowFilter("createdAt", dateWindow),
	});
}

export async function getExtendedKpis(period: AnalyticsPeriod = "30d"): Promise<ExtendedKpis> {
	const currentWindow = getPeriodWindow(period);
	const previousWindow = getPeriodWindow(period, 1);

	const activeOrderFilter = (dateWindow: DateWindow) => ({
		status: { $in: ["planning", "assigned", "in_progress", "on_hold", "report_pending"] },
		...buildWindowFilter("createdAt", dateWindow),
	});

	const completedOrderFilter = (dateWindow: DateWindow) => ({
		status: { $in: [...COMPLETED_STATUSES] },
		...buildWindowFilter("completedAt", dateWindow),
	});

	const overdueFilter = (dateWindow: DateWindow) => ({
		status: { $nin: [...CLOSED_STATUSES] },
		$or: [{ slaDueDate: { $lt: dateWindow.end } }, { dueDate: { $lt: dateWindow.end } }],
		...buildWindowFilter("createdAt", dateWindow),
	});

	const unassignedFilter = (dateWindow: DateWindow) => ({
		status: "open",
		$or: [{ assignedTo: { $exists: false } }, { assignedTo: null }],
		...buildWindowFilter("createdAt", dateWindow),
	});

	const [
		activeOrders,
		completedOrders,
		overdueSlaRisk,
		slaCompliancePct,
		avgCycleTimeDays,
		firstTimeFixRate,
		billingFunnelCop,
		avgDaysToInvoice,
		slaRiskCount,
		activeTechniciansToday,
		unassignedOrders,
		fsmFacturacionPendiente,
		fsmOrdenesRetraso,
	] = await Promise.all([
		getExtendedKpiPair(period, (dateWindow) => countOrders(activeOrderFilter(dateWindow))),
		getExtendedKpiPair(period, (dateWindow) => countOrders(completedOrderFilter(dateWindow))),
		getExtendedKpiPair(period, (dateWindow) => countOrders(overdueFilter(dateWindow))),
		getExtendedKpiPair(period, countSlaCompliantOrders),
		getExtendedKpiPair(period, getAverageCycleTime),
		getExtendedKpiPair(period, getFirstTimeFixRate),
		getExtendedKpiPair(period, getBillingFunnelCop),
		getExtendedKpiPair(period, getAvgDaysToInvoice),
		getExtendedKpiPair(period, getSlaRiskCount),
		getExtendedKpiPair(period, countActiveTechnicians),
		getExtendedKpiPair(period, (dateWindow) => countOrders(unassignedFilter(dateWindow))),
		getExtendedKpiPair(period, getFsmFacturacionPendiente),
		getExtendedKpiPair(period, getFsmOrdenesRetraso),
	]);

	log.info("Extended KPIs computed", {
		period,
		currentStart: currentWindow.start.toISOString(),
		previousStart: previousWindow.start.toISOString(),
	});

	return {
		kpis: {
			active_orders: activeOrders,
			completed_orders: completedOrders,
			overdue_sla_risk: overdueSlaRisk,
			sla_compliance_pct: slaCompliancePct,
			avg_cycle_time_days: avgCycleTimeDays,
			first_time_fix_rate: firstTimeFixRate,
			billing_funnel_cop: billingFunnelCop,
			avg_days_to_invoice: avgDaysToInvoice,
			sla_risk_count: slaRiskCount,
			active_technicians_today: activeTechniciansToday,
			unassigned_orders: unassignedOrders,
			fsm_tasa_cumplimiento: slaCompliancePct, // Matches "Tasa de cumplimiento"
			fsm_tiempo_promedio_ciclo: avgCycleTimeDays, // Matches "Tiempo promedio de ciclo"
			fsm_facturacion_pendiente: fsmFacturacionPendiente,
			fsm_ordenes_retraso: fsmOrdenesRetraso,
			fsm_ordenes_activas: activeOrders,
		},
		generated_at: new Date().toISOString(),
	};
}
