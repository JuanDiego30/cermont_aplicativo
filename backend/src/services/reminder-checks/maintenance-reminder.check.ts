import { Asset } from "../../models/Asset";
import {
	DAY_MS,
	dateOccurrenceKey,
	findThreshold,
	formatDate,
	type ReminderCandidate,
	type ReminderCheck,
} from "./reminder.types";

export const checkMaintenanceReminders: ReminderCheck = async (rule, now) => {
	const maximumDays = Math.max(...rule.thresholds);
	const limit = new Date(now.getTime() + maximumDays * DAY_MS);
	const assets = await Asset.find({
		nextMaintenanceAt: { $gte: now, $lte: limit },
		status: { $nin: ["retired", "lost"] },
	})
		.select("_id code name nextMaintenanceAt")
		.lean();
	const candidates: ReminderCandidate[] = [];

	for (const asset of assets) {
		if (!asset.nextMaintenanceAt) {
			continue;
		}
		const dueAt = new Date(asset.nextMaintenanceAt);
		const threshold = findThreshold(
			Math.ceil((dueAt.getTime() - now.getTime()) / DAY_MS),
			rule.thresholds,
		);
		if (threshold === false) {
			continue;
		}
		candidates.push({
			type: rule.type,
			threshold,
			occurrenceKey: `${asset._id.toString()}:${dateOccurrenceKey(dueAt)}`,
			templateName: "maintenance_due",
			variables: {
				assetName: `${asset.code} - ${asset.name}`,
				dueDate: formatDate(dueAt),
			},
			relatedEntity: {
				entityType: "Asset",
				entityId: asset._id.toString(),
			},
		});
	}

	return candidates;
};
