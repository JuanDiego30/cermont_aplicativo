import type {
	ClosureReport,
	ClosureRequirement,
	DeliveryRecord,
	DeliveryRecordReadModel,
	TechnicalReport,
	TechnicalReportReadModel,
} from "@cermont/shared-types";

export type AdministrativeWorkflowCardStatus = "completed" | "pending" | "missing";

export function hasTechnicalReport(
	report: TechnicalReportReadModel | undefined,
): report is TechnicalReport {
	return report !== undefined && report.status !== "not_created";
}

export function hasDeliveryRecord(
	record: DeliveryRecordReadModel | undefined,
): record is DeliveryRecord {
	return record !== undefined && record.status !== "not_created";
}

export function resolveGroupedRequirementStatus(
	report: ClosureReport | undefined,
	kinds: ClosureRequirement["kind"][],
): AdministrativeWorkflowCardStatus {
	const requirements = report?.requirements.filter((requirement) =>
		kinds.includes(requirement.kind),
	);

	if (!requirements?.length) {
		return "missing";
	}

	if (requirements.every((requirement) => requirement.status === "completed")) {
		return "completed";
	}

	if (requirements.every((requirement) => requirement.status === "missing")) {
		return "missing";
	}

	return "pending";
}

export function resolveGroupedRequirementMessage(
	report: ClosureReport | undefined,
	kinds: ClosureRequirement["kind"][],
): string | undefined {
	const requirements = report?.requirements.filter((requirement) =>
		kinds.includes(requirement.kind),
	);
	const incompleteRequirement = requirements?.find(
		(requirement) => requirement.status !== "completed",
	);

	if (incompleteRequirement?.message) {
		return incompleteRequirement.message;
	}

	return requirements
		?.reduce<string[]>((labels, requirement) => {
			if (requirement.status !== "completed") {
				labels.push(requirement.label);
			}
			return labels;
		}, [])
		.join(" · ");
}

export function administrativeWorkflowStatusLabel(
	status: AdministrativeWorkflowCardStatus,
): string {
	if (status === "completed") {
		return "Completo";
	}

	if (status === "pending") {
		return "En curso";
	}

	return "Faltante";
}

export function administrativeWorkflowStatusTone(status: AdministrativeWorkflowCardStatus): string {
	if (status === "completed") {
		return "border-green-200 bg-green-50 text-green-700 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-300";
	}

	if (status === "pending") {
		return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-300";
	}

	return "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300";
}
