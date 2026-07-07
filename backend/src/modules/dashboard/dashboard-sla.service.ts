/**
 * Dashboard SLA Service — Active cases at risk of missing their target
 * completion date (order.completedAt is the promised delivery date).
 *
 * riskLevel: critical = overdue or less than 24h remaining,
 *            warning  = less than 72h remaining.
 */

import { normalizeOperationalStepCode } from "@cermont/domain";
import type { DashboardSlaRiskOrder } from "@cermont/shared-types";
import { CERMONT_OPERATIONAL_STEPS } from "@cermont/shared-types";
import { Order } from "../../models/Order";
import { ServiceCase } from "../../models/ServiceCase";

const RISK_HORIZON_HOURS = 72;
const CRITICAL_THRESHOLD_HOURS = 24;
const MAX_RISK_ORDERS = 20;
const MS_PER_HOUR = 1000 * 60 * 60;

const TERMINAL_STAGES = ["paid", "archived", "cancelled"] as const;

export interface SlaRiskSourceRow {
	serviceCaseId: string;
	code: string;
	clientName?: string;
	currentStepCode: string;
	deadline: Date;
}

function resolveStepNumber(stepCode: string): number {
	const normalized = normalizeOperationalStepCode(stepCode);
	const canonicalCode = normalized.status === "invalid" ? stepCode : normalized.code;
	const step = CERMONT_OPERATIONAL_STEPS.find((item) => item.code === canonicalCode);
	return step?.stepNumber ?? 1;
}

/** Pure mapper — exported for unit tests. */
export function mapSlaRiskRows(rows: SlaRiskSourceRow[], now: Date): DashboardSlaRiskOrder[] {
	return rows
		.map((row) => {
			const hoursRemaining =
				Math.round(((row.deadline.getTime() - now.getTime()) / MS_PER_HOUR) * 10) / 10;
			const riskLevel: DashboardSlaRiskOrder["riskLevel"] =
				hoursRemaining < CRITICAL_THRESHOLD_HOURS ? "critical" : "warning";

			return {
				serviceCaseId: row.serviceCaseId,
				code: row.code,
				...(row.clientName ? { clientName: row.clientName } : {}),
				slaDeadline: row.deadline.toISOString(),
				hoursRemaining,
				currentStep: resolveStepNumber(row.currentStepCode),
				riskLevel,
			};
		})
		.sort((a, b) => a.hoursRemaining - b.hoursRemaining)
		.slice(0, MAX_RISK_ORDERS);
}

export async function buildSlaRiskOrders(): Promise<DashboardSlaRiskOrder[]> {
	const now = new Date();
	const horizon = new Date(now.getTime() + RISK_HORIZON_HOURS * MS_PER_HOUR);

	const activeCases = await ServiceCase.find({
		currentStage: { $nin: TERMINAL_STAGES },
		"artifacts.workOrder.id": { $exists: true },
	})
		.select("code clientName currentStepCode artifacts.workOrder.id")
		.lean();

	const orderIds = activeCases.flatMap((serviceCase) => {
		const workOrderId = serviceCase.artifacts?.workOrder?.id;
		return workOrderId ? [workOrderId] : [];
	});

	if (orderIds.length === 0) {
		return [];
	}

	const orders = await Order.find({
		_id: { $in: orderIds },
		completedAt: { $exists: true, $lte: horizon },
	})
		.select("completedAt")
		.lean();

	const deadlineByOrderId = new Map(
		orders.flatMap((order) => (order.completedAt ? [[String(order._id), order.completedAt]] : [])),
	);

	const rows = activeCases.flatMap((serviceCase) => {
		const workOrderId = serviceCase.artifacts?.workOrder?.id;
		const deadline = workOrderId ? deadlineByOrderId.get(String(workOrderId)) : void 0;
		if (!deadline) {
			return [];
		}

		return [
			{
				serviceCaseId: String(serviceCase._id),
				code: serviceCase.code,
				...(serviceCase.clientName ? { clientName: serviceCase.clientName } : {}),
				currentStepCode: serviceCase.currentStepCode ?? "step_01_work_request",
				deadline,
			},
		];
	});

	return mapSlaRiskRows(rows, now);
}
