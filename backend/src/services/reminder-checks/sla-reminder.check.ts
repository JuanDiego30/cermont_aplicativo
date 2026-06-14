import { ServiceCase } from "../../models";
import { SLATrackingModel } from "../../modules/sla/sla.model";
import {
	dateOccurrenceKey,
	findThreshold,
	HOUR_MS,
	type ReminderCandidate,
	type ReminderCheck,
} from "./reminder.types";

export const checkSlaReminders: ReminderCheck = async (rule, now) => {
	const maximumHours = Math.max(...rule.thresholds);
	const limit = new Date(now.getTime() + maximumHours * HOUR_MS);
	const trackingRecords = await SLATrackingModel.find({
		firstResponseAt: { $exists: false },
		responseDeadline: { $gt: now, $lte: limit },
		status: { $in: ["active", "at_risk", "escalated"] },
	})
		.select("_id serviceCaseId serviceType responseDeadline")
		.lean();
	const caseIds = trackingRecords.map((tracking) => tracking.serviceCaseId);
	const serviceCases = await ServiceCase.find({ _id: { $in: caseIds } })
		.select("_id code")
		.lean();
	const caseCodeById = new Map(
		serviceCases.map((serviceCase) => [serviceCase._id.toString(), serviceCase.code]),
	);
	const candidates: ReminderCandidate[] = [];

	for (const tracking of trackingRecords) {
		const threshold = findThreshold(
			Math.ceil((tracking.responseDeadline.getTime() - now.getTime()) / HOUR_MS),
			rule.thresholds,
		);
		if (threshold === false) {
			continue;
		}
		const serviceCaseId = tracking.serviceCaseId.toString();
		candidates.push({
			type: rule.type,
			threshold,
			occurrenceKey: `${tracking._id.toString()}:${dateOccurrenceKey(tracking.responseDeadline)}`,
			templateName: "sla_breach_warning",
			variables: {
				caseCode: caseCodeById.get(serviceCaseId) ?? serviceCaseId,
				serviceType: tracking.serviceType,
				remainingHours: String(threshold),
			},
			relatedEntity: {
				entityType: "ServiceCase",
				entityId: serviceCaseId,
			},
		});
	}

	return candidates;
};
