import type { DashboardFieldReadiness } from "@cermont/shared-types";
import { Checklist, Evidence, ExecutionSession, Tool } from "../../models";
import { VehicleModel } from "../../models/Vehicle";

const DAY_MS = 24 * 60 * 60 * 1000;

type ChecklistResultRow = { _id: "pending" | "failed" | "passed"; count: number };
type ToolCertificationRiskRow = { expiring: number; expired: number };

function buildVehicleExpiryFilter(from: Date, to: Date) {
	return {
		$or: [
			{ soatExpiry: { $gte: from, $lte: to } },
			{ technoMechanicalExpiry: { $gte: from, $lte: to } },
			{ insuranceExpiry: { $gte: from, $lte: to } },
		],
	};
}

export async function buildFieldReadiness(): Promise<DashboardFieldReadiness> {
	const now = new Date();
	const next30Days = new Date(now.getTime() + 30 * DAY_MS);

	const [
		checklistResults,
		evidencePendingReview,
		evidenceRejected,
		totalEvidence,
		evidenceWithGps,
		vehicleDocumentsExpiring,
		vehicleDocumentsExpired,
		toolCertificationRisk,
		evidenceSyncPending,
		evidenceSyncFailed,
		executionSyncPending,
		executionSyncFailed,
	] = await Promise.all([
		Checklist.aggregate<ChecklistResultRow>([
			{ $unwind: "$items" },
			{ $match: { "items.isBlocking": true, "items.result": { $in: ["pending", "failed"] } } },
			{ $group: { _id: "$items.result", count: { $sum: 1 } } },
		]),
		Evidence.countDocuments({ fsmStatus: "pending_review", lifecycleStatus: "active" }),
		Evidence.countDocuments({ fsmStatus: "rejected", lifecycleStatus: "active" }),
		Evidence.countDocuments({ lifecycleStatus: "active" }),
		Evidence.countDocuments({
			lifecycleStatus: "active",
			"gpsLocation.lat": { $exists: true },
			"gpsLocation.lng": { $exists: true },
		}),
		VehicleModel.countDocuments(buildVehicleExpiryFilter(now, next30Days)),
		VehicleModel.countDocuments(buildVehicleExpiryFilter(new Date(0), now)),
		Tool.aggregate<ToolCertificationRiskRow>([
			{ $unwind: "$certifications" },
			{
				$group: {
					_id: "certification-risk",
					expiring: {
						$sum: {
							$cond: [
								{
									$and: [
										{ $gte: ["$certifications.expiresAt", now] },
										{ $lte: ["$certifications.expiresAt", next30Days] },
									],
								},
								1,
								0,
							],
						},
					},
					expired: {
						$sum: { $cond: [{ $lt: ["$certifications.expiresAt", now] }, 1, 0] },
					},
				},
			},
		]),
		Evidence.countDocuments({ syncStatus: { $in: ["pending", "syncing"] } }),
		Evidence.countDocuments({ syncStatus: "failed" }),
		ExecutionSession.countDocuments({ offlineSyncStatus: { $in: ["pending", "syncing"] } }),
		ExecutionSession.countDocuments({ offlineSyncStatus: "failed" }),
	]);

	const checklistCounts = new Map(checklistResults.map((row) => [row._id, row.count]));
	const toolRisk = toolCertificationRisk[0] ?? { expiring: 0, expired: 0 };

	return {
		blockingChecklistsPending: checklistCounts.get("pending") ?? 0,
		blockingChecklistsFailed: checklistCounts.get("failed") ?? 0,
		evidencePendingReview,
		evidenceRejected,
		evidenceGpsCoveragePct:
			totalEvidence > 0 ? Math.round((evidenceWithGps / totalEvidence) * 100) : 0,
		vehicleDocumentsExpiring,
		vehicleDocumentsExpired,
		toolCertificationsExpiring: toolRisk.expiring,
		toolCertificationsExpired: toolRisk.expired,
		offlineSyncPending: evidenceSyncPending + executionSyncPending,
		offlineSyncFailed: evidenceSyncFailed + executionSyncFailed,
	};
}
