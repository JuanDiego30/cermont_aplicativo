/**
 * Cost Rules — Cost display and validation rules
 *
 * SSOT for cost-related business rules.
 * No $0 false values — use null/sentinel for missing data.
 */

/** Fields that must have data for a cost entry to be valid */
export const COST_REQUIRED_FIELDS = ["proposalValue", "invoicedAmount", "paidAmount"] as const;

export interface CostEntry {
	proposalValue: number | null;
	estimatedMaterials: number | null;
	realMaterials: number | null;
	estimatedLabor: number | null;
	realLabor: number | null;
	equipmentCosts: number | null;
	invoicedAmount: number | null;
	paidAmount: number | null;
}

/** Check if a cost entry is missing (no data recorded) */
export function isCostMissing(costEntry: CostEntry): boolean {
	return COST_REQUIRED_FIELDS.every((field) => costEntry[field] === null);
}

/** Format cost value for display — returns null if missing (never $0) */
export function formatCostValue(value: number | null): string | null {
	if (value === null || value === undefined) {
		return null;
	}
	return new Intl.NumberFormat("es-CO", {
		style: "currency",
		currency: "COP",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
}

/** Calculate margin percentage */
export function calculateMargin(income: number | null, cost: number | null): number | null {
	if (income === null || cost === null || income === 0) {
		return null;
	}
	return Math.round(((income - cost) / income) * 100);
}

/** Calculate variance between estimated and real */
export function calculateVariance(estimated: number | null, real: number | null): number | null {
	if (estimated === null || real === null) {
		return null;
	}
	return real - estimated;
}
