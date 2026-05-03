import {
	CHECKLIST_ITEM_CATEGORY_LABELS_ES,
	CHECKLIST_STATUS_LABELS_ES,
	type ChecklistItemCategory,
	type ChecklistStatus,
} from "@cermont/shared-types";

export const CATEGORY_ORDER: ChecklistItemCategory[] = ["tool", "equipment", "ppe", "procedure"];

export const CATEGORY_LABELS: Record<ChecklistItemCategory, string> =
	CHECKLIST_ITEM_CATEGORY_LABELS_ES;

export const STATUS_LABELS: Record<ChecklistStatus, string> = CHECKLIST_STATUS_LABELS_ES;

export const STATUS_STYLES: Record<ChecklistStatus, string> = {
	pending:
		"border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
	in_progress:
		"border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/40 dark:bg-sky-900/10 dark:text-sky-300",
	completed:
		"border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/10 dark:text-emerald-300",
	cancelled:
		"border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/10 dark:text-rose-300",
};

export function formatChecklistDate(value?: string): string {
	if (!value) {
		return "—";
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "—";
	}

	return date.toLocaleString("es-CO", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function getSignaturePreview(signature?: string): string | null {
	if (!signature) {
		return null;
	}

	return signature.startsWith("data:image") ? signature : null;
}
