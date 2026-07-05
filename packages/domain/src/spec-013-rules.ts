/**
 * SPEC-013 Rules — Re-exportadas desde spec-015-rules.ts
 *
 * Este archivo existe por compatibilidad con el plan Spec-013 S1.6.
 * Las implementaciones canónicas viven en `./spec-015-rules.ts`.
 */

export {
	evaluatePreflightGates,
	evaluateSLARisk,
	evaluateCostRisk,
	evaluateEvidenceCompleteness,
	computeMTTR,
	computeMTBF,
	computeFirstTimeFixRate,
	computeTechnicianUtilization,
} from "./spec-015-rules";

export type {
	PreflightGateItemInput,
	PreflightBooleanChecks,
	PreflightResult,
	SLARiskLevel,
	CostRiskLevel,
	EvidenceSlotInput,
	EvidenceCompletenessResult,
	CompletedSessionWindow,
	CompletedOrderWindow,
	FirstTimeFixOrderInput,
	TechnicianUtilizationSessionInput,
} from "./spec-015-rules";