/**
 * Dashboard Operational KPI Service — Spec-015
 *
 * MTTR / MTBF / First-Time-Fix Rate plus billing and reporting workload
 * counters, computed with the pure domain rules from @cermont/domain.
 */

import {
	computeFirstTimeFixRate,
	computeMTBF,
	computeMTTR,
	computeTechnicianUtilization,
} from "@cermont/domain";
import type { DashboardOperationalKPI } from "@cermont/shared-types";
import { DashboardOperationalKPISchema } from "@cermont/shared-types";
import type { Types } from "mongoose";
import { ExecutionSession } from "../../models/ExecutionSession";
import { Invoice } from "../../models/Invoice";
import { TechnicalReport } from "../../models/TechnicalReport";

const DEFAULT_PERIOD_DAYS = 90;
const OPEN_INVOICE_STATUSES = ["issued", "sent", "submitted", "approved", "accepted"];

interface SessionWindowRow {
	workOrderId?: Types.ObjectId;
	assignedCrew?: Types.ObjectId[];
	startedAt?: Date;
	completedAt?: Date;
}

export async function getOperationalKPIs(
	periodFrom?: string,
	periodTo?: string,
): Promise<DashboardOperationalKPI> {
	const to = periodTo ? new Date(periodTo) : new Date();
	const from = periodFrom
		? new Date(periodFrom)
		: new Date(to.getTime() - DEFAULT_PERIOD_DAYS * 24 * 60 * 60 * 1000);

	const [sessions, pendingInvoicesCount, overdueInvoicesCount, pendingReportsCount] =
		await Promise.all([
			ExecutionSession.find({
				status: "completed",
				startedAt: { $exists: true },
				completedAt: { $exists: true, $gte: from, $lte: to },
			})
				.select("workOrderId assignedCrew startedAt completedAt")
				.lean<SessionWindowRow[]>(),
			Invoice.countDocuments({ status: { $in: OPEN_INVOICE_STATUSES } }),
			Invoice.countDocuments({
				status: { $in: OPEN_INVOICE_STATUSES },
				dueDate: { $exists: true, $lt: new Date() },
			}),
			TechnicalReport.countDocuments({ status: "draft" }),
		]);

	const windows = sessions.flatMap((session) =>
		session.startedAt && session.completedAt
			? [
					{
						startedAt: session.startedAt.toISOString(),
						completedAt: session.completedAt.toISOString(),
					},
				]
			: [],
	);

	const sessionsByOrder = new Map<string, number>();
	for (const session of sessions) {
		if (!session.workOrderId) {
			continue;
		}
		const key = String(session.workOrderId);
		sessionsByOrder.set(key, (sessionsByOrder.get(key) ?? 0) + 1);
	}
	const ftfOrders = [...sessionsByOrder.entries()].map(([orderId, count]) => ({
		orderId,
		hadReturnVisit: count > 1,
	}));
	const technicianIds = new Set<string>();
	let productiveMinutes = 0;
	for (const session of sessions) {
		const crew = session.assignedCrew ?? [];
		for (const technicianId of crew) {
			technicianIds.add(String(technicianId));
		}
		if (session.startedAt && session.completedAt) {
			productiveMinutes +=
				((session.completedAt.getTime() - session.startedAt.getTime()) / 60_000) * crew.length;
		}
	}
	const availableMinutes =
		technicianIds.size * Math.max(1, (to.getTime() - from.getTime()) / 86_400_000) * 480;

	const kpis: DashboardOperationalKPI = {
		mttrMinutes: Math.round(computeMTTR(windows) * 100) / 100,
		mtbfDays:
			Math.round(
				computeMTBF(windows.map((window) => ({ completedAt: window.completedAt }))) * 100,
			) / 100,
		firstTimeFixRate: Math.round(computeFirstTimeFixRate(ftfOrders) * 100) / 100,
		technicianUtilizationRate:
			Math.round(computeTechnicianUtilization([{ productiveMinutes, availableMinutes }]) * 100) /
			100,
		pendingInvoicesCount,
		overdueInvoicesCount,
		pendingReportsCount,
		currency: "COP",
		periodFrom: from.toISOString(),
		periodTo: to.toISOString(),
	};

	return DashboardOperationalKPISchema.parse(kpis);
}
