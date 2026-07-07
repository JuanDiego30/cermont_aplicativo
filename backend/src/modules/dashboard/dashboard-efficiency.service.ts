/**
 * Dashboard Efficiency Service — Maintenance efficiency KPIs (MTTR / MTBF)
 *
 * MTTR: Mean Time To Repair — average hours to complete an execution session.
 * MTBF proxy: average days between execution start and completion
 * (approximation — real MTBF requires asset-level maintenance history).
 */

import type { DashboardSummary } from "@cermont/shared-types";
import { ExecutionSession } from "../../models/ExecutionSession";
import { Order } from "../../models/Order";

export async function buildMaintenanceEfficiency(): Promise<
	DashboardSummary["maintenanceEfficiency"]
> {
	const [
		completedExecutionSessions,
		activeWorkOrders,
		overdueWorkOrders,
		executionSessionTimings,
		serviceCaseDurations,
	] = await Promise.all([
		ExecutionSession.countDocuments({ status: "completed" }),
		Order.countDocuments({ status: { $in: ["open", "in_progress", "assigned"] } }),
		Order.countDocuments({
			status: { $in: ["open", "planning"] },
			createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
		}),
		ExecutionSession.aggregate<{ avgHours: number }>([
			{
				$match: {
					status: "completed",
					startedAt: { $exists: true },
					completedAt: { $exists: true },
				},
			},
			{
				$project: {
					durationHours: {
						$divide: [{ $subtract: ["$completedAt", "$startedAt"] }, 1000 * 60 * 60],
					},
				},
			},
			{
				$group: {
					_id: null,
					avgHours: { $avg: "$durationHours" },
				},
			},
		]),
		ExecutionSession.aggregate<{ avgDays: number }>([
			{
				$match: {
					status: "completed",
					startedAt: { $exists: true },
					completedAt: { $exists: true },
				},
			},
			{
				$project: {
					durationDays: {
						$divide: [{ $subtract: ["$completedAt", "$startedAt"] }, 1000 * 60 * 60 * 24],
					},
				},
			},
			{
				$group: {
					_id: null,
					avgDays: { $avg: "$durationDays" },
				},
			},
		]),
	]);

	const avgHours = executionSessionTimings[0]?.avgHours ?? 0;
	const avgDays = serviceCaseDurations[0]?.avgDays ?? 0;
	const avgCompletionRate =
		completedExecutionSessions > 0 && activeWorkOrders > 0
			? Math.min(
					Math.round(
						(completedExecutionSessions / (completedExecutionSessions + activeWorkOrders)) * 100,
					),
					100,
				)
			: 0;

	return {
		mttrHours: Math.round(avgHours * 100) / 100,
		mtbfDays: Math.round(avgDays * 100) / 100,
		maintenanceCompletionRate: avgCompletionRate,
		activeWorkOrders,
		overdueWorkOrders,
	};
}
