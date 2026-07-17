import type { CostDataState } from "@cermont/shared-types";

export function resolveAmountDataState(
	estimatedAmount: number,
	actualAmount: number,
): CostDataState {
	const hasEstimated = estimatedAmount > 0;
	const hasActual = actualAmount > 0;
	if (hasEstimated && hasActual) {
		return "ESTIMATED_AND_ACTUAL";
	}
	if (hasEstimated) {
		return "ESTIMATED_ONLY";
	}
	if (hasActual) {
		return "ACTUAL_ONLY";
	}
	return "NO_DATA";
}
