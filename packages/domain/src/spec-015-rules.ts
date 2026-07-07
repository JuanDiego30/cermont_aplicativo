/**
 * Spec-015 Rules — Preflight gates, SLA/cost risk, evidence completeness
 * and operational KPI computation (MTTR / MTBF / First-Time-Fix Rate).
 *
 * Pure functions with inline interfaces — no dependency on shared-types
 * Zod schemas to avoid circular package dependencies.
 */

// ─── Preflight gates ─────────────────────────────────────────────────────────

export interface PreflightGateItemInput {
	key: string;
	label: string;
	isBlocking: boolean;
	isChecked: boolean;
}

export interface PreflightBooleanChecks {
	eppComplete: boolean;
	astSigned: boolean;
	ptwObtained: boolean;
	toolsValidated: boolean;
	vehicleDocumentsOk: boolean;
	certificationsCurrent: boolean;
}

export interface PreflightResult {
	passed: boolean;
	missingBlockingKeys: string[];
	missingOptionalKeys: string[];
}

const BLOCKING_PREFLIGHT_CHECKS: readonly (keyof PreflightBooleanChecks)[] = [
	"eppComplete",
	"astSigned",
	"ptwObtained",
	"toolsValidated",
	"vehicleDocumentsOk",
	"certificationsCurrent",
];

/**
 * A session may start only when every blocking gate (fixed boolean checks
 * plus custom blocking items) is checked. Non-blocking unchecked items are
 * reported but do not fail the preflight.
 */
export function evaluatePreflightGates(
	items: readonly PreflightGateItemInput[],
	checks: PreflightBooleanChecks,
): PreflightResult {
	const missingBlockingKeys: string[] = [];
	const missingOptionalKeys: string[] = [];

	for (const check of BLOCKING_PREFLIGHT_CHECKS) {
		if (!checks[check]) {
			missingBlockingKeys.push(check);
		}
	}

	for (const item of items) {
		if (item.isChecked) {
			continue;
		}
		if (item.isBlocking) {
			missingBlockingKeys.push(item.key);
		} else {
			missingOptionalKeys.push(item.key);
		}
	}

	return {
		passed: missingBlockingKeys.length === 0,
		missingBlockingKeys,
		missingOptionalKeys,
	};
}

// ─── SLA risk ────────────────────────────────────────────────────────────────

export type SLARiskLevel = "on_track" | "at_risk" | "overdue";

export const SLA_AT_RISK_THRESHOLD_HOURS = 24;

/**
 * Classifies SLA health from the deadline and the reference time (defaults
 * to now). Under SLA_AT_RISK_THRESHOLD_HOURS remaining = at_risk; past the
 * deadline = overdue.
 */
export function evaluateSLARisk(slaDeadline: string, referenceTime?: string): SLARiskLevel {
	const deadlineMs = Date.parse(slaDeadline);
	const nowMs = referenceTime ? Date.parse(referenceTime) : Date.now();
	if (Number.isNaN(deadlineMs) || Number.isNaN(nowMs)) {
		return "on_track";
	}
	const hoursRemaining = (deadlineMs - nowMs) / 3_600_000;
	if (hoursRemaining < 0) {
		return "overdue";
	}
	if (hoursRemaining < SLA_AT_RISK_THRESHOLD_HOURS) {
		return "at_risk";
	}
	return "on_track";
}

// ─── Cost risk ───────────────────────────────────────────────────────────────

export type CostRiskLevel = "under_budget" | "on_budget" | "at_risk" | "critical";

export const COST_ON_BUDGET_THRESHOLD_PERCENT = 80;
export const COST_AT_RISK_THRESHOLD_PERCENT = 95;

/**
 * Classifies budget consumption: <80% under_budget, 80-95% on_budget,
 * 95-100% at_risk, >100% critical.
 */
export function evaluateCostRisk(consumedPercent: number): CostRiskLevel {
	if (consumedPercent > 100) {
		return "critical";
	}
	if (consumedPercent >= COST_AT_RISK_THRESHOLD_PERCENT) {
		return "at_risk";
	}
	if (consumedPercent >= COST_ON_BUDGET_THRESHOLD_PERCENT) {
		return "on_budget";
	}
	return "under_budget";
}

// ─── Evidence completeness ───────────────────────────────────────────────────

export interface EvidenceSlotInput {
	slotId: string;
	isRequired: boolean;
	isBlocking: boolean;
	isFulfilled: boolean;
}

export interface EvidenceCompletenessResult {
	canClosePhase: boolean;
	requiredCount: number;
	fulfilledCount: number;
	pendingCount: number;
	blockingPendingCount: number;
	pendingBlockingSlotIds: string[];
}

/**
 * A phase can close when every blocking slot is fulfilled. Required but
 * non-blocking slots are counted yet do not block closure.
 */
export function evaluateEvidenceCompleteness(
	slots: readonly EvidenceSlotInput[],
): EvidenceCompletenessResult {
	const required = slots.filter((slot) => slot.isRequired);
	const fulfilled = required.filter((slot) => slot.isFulfilled);
	const pendingBlocking = slots.filter((slot) => slot.isBlocking && !slot.isFulfilled);

	return {
		canClosePhase: pendingBlocking.length === 0,
		requiredCount: required.length,
		fulfilledCount: fulfilled.length,
		pendingCount: required.length - fulfilled.length,
		blockingPendingCount: pendingBlocking.length,
		pendingBlockingSlotIds: pendingBlocking.map((slot) => slot.slotId),
	};
}

// ─── Operational KPIs ────────────────────────────────────────────────────────

export interface CompletedSessionWindow {
	startedAt: string;
	completedAt: string;
}

/**
 * Mean Time To Repair in minutes: average of (completedAt - startedAt)
 * across completed sessions. Sessions with invalid or inverted timestamps
 * are ignored. Returns 0 when no valid session exists.
 */
export function computeMTTR(sessions: readonly CompletedSessionWindow[]): number {
	let totalMinutes = 0;
	let count = 0;
	for (const session of sessions) {
		const start = Date.parse(session.startedAt);
		const end = Date.parse(session.completedAt);
		if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
			continue;
		}
		totalMinutes += (end - start) / 60_000;
		count += 1;
	}
	return count === 0 ? 0 : totalMinutes / count;
}

export interface CompletedOrderWindow {
	completedAt: string;
}

/**
 * Mean Time Between Failures in days: average gap between consecutive
 * completed corrective orders (sorted chronologically). Needs at least two
 * orders; otherwise returns 0.
 */
export function computeMTBF(orders: readonly CompletedOrderWindow[]): number {
	const times = orders
		.map((order) => Date.parse(order.completedAt))
		.filter((time) => !Number.isNaN(time))
		.sort((a, b) => a - b);
	if (times.length < 2) {
		return 0;
	}
	let totalGapMs = 0;
	for (let index = 1; index < times.length; index += 1) {
		totalGapMs += times[index] - times[index - 1];
	}
	return totalGapMs / (times.length - 1) / 86_400_000;
}

export interface FirstTimeFixOrderInput {
	orderId: string;
	hadReturnVisit: boolean;
}

/**
 * First-Time-Fix Rate: percentage (0-100) of orders resolved without a
 * return visit. Returns 0 when the list is empty.
 */
export function computeFirstTimeFixRate(orders: readonly FirstTimeFixOrderInput[]): number {
	if (orders.length === 0) {
		return 0;
	}
	const fixedFirstTime = orders.filter((order) => !order.hadReturnVisit).length;
	return (fixedFirstTime / orders.length) * 100;
}

export interface TechnicianUtilizationSessionInput {
	productiveMinutes: number;
	availableMinutes: number;
}

/**
 * Technician utilization: productive minutes as a percentage of available
 * minutes across valid session windows. Returns a bounded 0-100 percentage.
 */
export function computeTechnicianUtilization(
	sessions: readonly TechnicianUtilizationSessionInput[],
): number {
	let totalProductiveMinutes = 0;
	let totalAvailableMinutes = 0;
	for (const session of sessions) {
		if (!Number.isFinite(session.availableMinutes) || session.availableMinutes <= 0) {
			continue;
		}
		totalProductiveMinutes += Math.max(0, session.productiveMinutes);
		totalAvailableMinutes += session.availableMinutes;
	}
	if (totalAvailableMinutes === 0) {
		return 0;
	}
	return Math.min(100, (totalProductiveMinutes / totalAvailableMinutes) * 100);
}
