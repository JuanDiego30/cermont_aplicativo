import {
	COST_CATEGORY_LABELS_ES,
	type CostCategory,
	CostCategorySchema,
} from "@cermont/shared-types";

export { formatCurrency } from "@/_shared/lib/utils/format-currency";
export { formatDateTime } from "@/_shared/lib/utils/format-date";

export const COST_CATEGORY_OPTIONS = [...CostCategorySchema.options] as CostCategory[];

export const COST_CATEGORY_LABELS: Record<CostCategory, string> = COST_CATEGORY_LABELS_ES;

export const COST_CATEGORY_ORDER: CostCategory[] = [...CostCategorySchema.options];

export function formatPercent(value: number | null | undefined): string {
	if (value === null || value === undefined || Number.isNaN(value)) {
		return "—";
	}

	return `${new Intl.NumberFormat("es-CO", {
		style: "percent",
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(value)}`;
}
