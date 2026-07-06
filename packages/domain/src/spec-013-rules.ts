/**
 * SPEC-013 Rules — Re-exportadas desde spec-015-rules.ts
 *
 * Este archivo existe por compatibilidad con el plan Spec-013 S1.6.
 * Las implementaciones canónicas viven en `./spec-015-rules.ts`.
 */

export type {
	CompletedOrderWindow,
	CompletedSessionWindow,
	CostRiskLevel,
	EvidenceCompletenessResult,
	EvidenceSlotInput,
	FirstTimeFixOrderInput,
	PreflightBooleanChecks,
	PreflightGateItemInput,
	PreflightResult,
	SLARiskLevel,
	TechnicianUtilizationSessionInput,
} from "./spec-015-rules";
export {
	computeFirstTimeFixRate,
	computeMTBF,
	computeMTTR,
	computeTechnicianUtilization,
	evaluateCostRisk,
	evaluateEvidenceCompleteness,
	evaluatePreflightGates,
	evaluateSLARisk,
} from "./spec-015-rules";
