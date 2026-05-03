/**
 * Checklist Domain Rules
 *
 * Status validation, item completion rules, and signature requirements.
 * Framework-agnostic — no Express or Mongoose imports.
 */

export const CHECKLIST_STATUSES = ["pending", "in_progress", "completed", "approved"] as const;
export type ChecklistStatus = (typeof CHECKLIST_STATUSES)[number];

export const VALID_STATUS_TRANSITIONS: Record<ChecklistStatus, ChecklistStatus[]> = {
	pending: ["in_progress"],
	in_progress: ["completed"],
	completed: ["approved"],
	approved: [],
};

export function isValidStatusTransition(current: ChecklistStatus, next: ChecklistStatus): boolean {
	return VALID_STATUS_TRANSITIONS[current]?.includes(next) ?? false;
}

export const MIN_ITEMS_FOR_COMPLETION = 1;

export function canCompleteChecklist(
	totalItems: number,
	completedItems: number,
): { canComplete: boolean; reason?: string } {
	if (totalItems === 0) {
		return { canComplete: false, reason: "Checklist has no items" };
	}
	if (completedItems < totalItems) {
		return {
			canComplete: false,
			reason: `${totalItems - completedItems} item(s) still pending`,
		};
	}
	return { canComplete: true };
}

export const SIGNATURE_REQUIRED_FOR_APPROVAL = true;
