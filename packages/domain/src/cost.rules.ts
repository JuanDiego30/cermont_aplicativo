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

// ─── Budget risk & profitability (Spec-014/015) ─────────────────────────────

/** Present/absent value — no $0 false values */
export type CostBudgetValue = { status: "present"; value: number } | { status: "absent" };

export type CostBudgetRisk =
	| "not_available"
	| "within_budget"
	| "threshold_reached"
	| "over_budget";

export const COST_BUDGET_ALERT_THRESHOLD = 0.8;

export interface CostBudgetAssessment {
	risk: CostBudgetRisk;
	consumptionPercent: CostBudgetValue;
	threshold: number;
}

/**
 * Classifies actual spend against the approved budget:
 * below threshold = within_budget, threshold..100% = threshold_reached,
 * above 100% = over_budget. Without an approved budget the risk is
 * not_available (never a false $0 baseline).
 */
export function evaluateCostBudgetRisk(input: {
	actualAmount: number;
	approvedBudget: CostBudgetValue;
}): CostBudgetAssessment {
	if (input.approvedBudget.status === "absent" || input.approvedBudget.value <= 0) {
		return {
			risk: "not_available",
			consumptionPercent: { status: "absent" },
			threshold: COST_BUDGET_ALERT_THRESHOLD,
		};
	}
	const consumption = input.actualAmount / input.approvedBudget.value;
	let risk: CostBudgetRisk = "within_budget";
	if (consumption > 1) {
		risk = "over_budget";
	} else if (consumption >= COST_BUDGET_ALERT_THRESHOLD) {
		risk = "threshold_reached";
	}
	return {
		risk,
		consumptionPercent: { status: "present", value: consumption },
		threshold: COST_BUDGET_ALERT_THRESHOLD,
	};
}

export interface CostProfitability {
	grossProfit: CostBudgetValue;
	grossMarginPercent: CostBudgetValue;
}

/**
 * Gross profit and margin from approved revenue and supported actual cost.
 * Both stay absent until revenue is approved.
 */
export function calculateGrossMargin(input: {
	revenue: CostBudgetValue;
	actualCost: number;
}): CostProfitability {
	if (input.revenue.status === "absent" || input.revenue.value === 0) {
		return {
			grossProfit: { status: "absent" },
			grossMarginPercent: { status: "absent" },
		};
	}
	const grossProfit = input.revenue.value - input.actualCost;
	return {
		grossProfit: { status: "present", value: grossProfit },
		grossMarginPercent: { status: "present", value: grossProfit / input.revenue.value },
	};
}
