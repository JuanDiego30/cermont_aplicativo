export type ChecklistItemResult = "pending" | "passed" | "failed";

export type ChecklistReadinessItem = {
	id: string;
	label: string;
	required: boolean;
	isBlocking: boolean;
	result: ChecklistItemResult;
	requiresPhoto: boolean;
	photoCount: number;
	requiresSignature: boolean;
	hasSignature: boolean;
};

export type ChecklistBlockerCode =
	| "CHECKLIST_ITEM_PENDING"
	| "CHECKLIST_CRITICAL_ITEM_FAILED"
	| "CHECKLIST_PHOTO_REQUIRED"
	| "CHECKLIST_SIGNATURE_REQUIRED";

export type ChecklistReadinessBlocker = {
	code: ChecklistBlockerCode;
	itemId: string;
	message: string;
};

export type ChecklistReadiness =
	| { status: "ready"; blockers: [] }
	| { status: "blocked"; blockers: ChecklistReadinessBlocker[] };

export function evaluateChecklistReadiness(items: ChecklistReadinessItem[]): ChecklistReadiness {
	const blockers: ChecklistReadinessBlocker[] = [];

	for (const item of items) {
		if ((item.required || item.isBlocking) && item.result === "pending") {
			blockers.push({
				code: "CHECKLIST_ITEM_PENDING",
				itemId: item.id,
				message: `Falta responder: ${item.label}`,
			});
			continue;
		}

		if (item.isBlocking && item.result === "failed") {
			blockers.push({
				code: "CHECKLIST_CRITICAL_ITEM_FAILED",
				itemId: item.id,
				message: `Control crítico fallido: ${item.label}`,
			});
			continue;
		}

		if (item.result === "passed" && item.requiresPhoto && item.photoCount === 0) {
			blockers.push({
				code: "CHECKLIST_PHOTO_REQUIRED",
				itemId: item.id,
				message: `Falta evidencia fotográfica: ${item.label}`,
			});
		}

		if (item.result === "passed" && item.requiresSignature && !item.hasSignature) {
			blockers.push({
				code: "CHECKLIST_SIGNATURE_REQUIRED",
				itemId: item.id,
				message: `Falta firma de validación: ${item.label}`,
			});
		}
	}

	return blockers.length === 0
		? { status: "ready", blockers: [] }
		: { status: "blocked", blockers };
}
