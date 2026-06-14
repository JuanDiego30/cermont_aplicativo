import { User } from "../../models";
import {
	DAY_MS,
	dateOccurrenceKey,
	findThreshold,
	formatDate,
	type ReminderCandidate,
	type ReminderCheck,
} from "./reminder.types";

export const checkCertificationReminders: ReminderCheck = async (rule, now) => {
	const maximumDays = Math.max(...rule.thresholds);
	const limit = new Date(now.getTime() + maximumDays * DAY_MS);
	const users = await User.find({
		isActive: true,
		"certifications.expiresAt": {
			$gte: now.toISOString(),
			$lte: limit.toISOString(),
		},
	})
		.select("_id name certifications")
		.lean();
	const candidates: ReminderCandidate[] = [];

	for (const user of users) {
		for (const certification of user.certifications ?? []) {
			if (!certification.expiresAt) {
				continue;
			}
			const expiresAt = new Date(certification.expiresAt);
			if (Number.isNaN(expiresAt.getTime())) {
				continue;
			}
			const threshold = findThreshold(
				Math.ceil((expiresAt.getTime() - now.getTime()) / DAY_MS),
				rule.thresholds,
			);
			if (threshold === false) {
				continue;
			}
			candidates.push({
				type: rule.type,
				threshold,
				occurrenceKey: `${user._id.toString()}:${certification.name}:${dateOccurrenceKey(expiresAt)}`,
				templateName: "certification_expiring",
				variables: {
					certificationName: certification.name,
					expiryDate: formatDate(expiresAt),
					holderName: user.name,
				},
				relatedEntity: {
					entityType: "User",
					entityId: user._id.toString(),
				},
			});
		}
	}

	return candidates;
};
