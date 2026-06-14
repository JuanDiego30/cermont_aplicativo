import { ServiceCase } from "../../models";
import {
	DAY_MS,
	dateOccurrenceKey,
	findThreshold,
	type ReminderCandidate,
	type ReminderCheck,
} from "./reminder.types";

const TERMINAL_STAGES = ["paid", "archived", "cancelled"] as const;

export const checkStaleCaseReminders: ReminderCheck = async (rule, now) => {
	const maximumDays = Math.max(...rule.thresholds);
	const oldestRelevant = new Date(now.getTime() - maximumDays * DAY_MS);
	const newestRelevant = new Date(now.getTime() - Math.min(...rule.thresholds) * DAY_MS);
	const serviceCases = await ServiceCase.find({
		currentStage: { $nin: TERMINAL_STAGES },
		updatedAt: { $gte: oldestRelevant, $lte: newestRelevant },
	})
		.select("_id code currentStepCode updatedAt")
		.lean();
	const candidates: ReminderCandidate[] = [];

	for (const serviceCase of serviceCases) {
		const threshold = findThreshold(
			Math.floor((now.getTime() - serviceCase.updatedAt.getTime()) / DAY_MS),
			rule.thresholds,
		);
		if (threshold === false) {
			continue;
		}
		candidates.push({
			type: rule.type,
			threshold,
			occurrenceKey: `${serviceCase._id.toString()}:${dateOccurrenceKey(serviceCase.updatedAt)}`,
			templateName: "stale_case_alert",
			variables: {
				caseCode: serviceCase.code,
				daysInactive: String(threshold),
				currentStep: serviceCase.currentStepCode ?? "sin paso asignado",
			},
			relatedEntity: {
				entityType: "ServiceCase",
				entityId: serviceCase._id.toString(),
			},
		});
	}

	return candidates;
};
