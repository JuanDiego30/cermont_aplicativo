import type { ClosureRequirement } from "../schemas/closureReport.schema";
import type { ClosingEvidenceKind } from "../schemas/document-ingestion.schema";

/** Requisitos administrativos obligatorios para cierre definitivo (pasos 8–14). */
export const ADMINISTRATIVE_CLOSURE_REQUIREMENT_KINDS = [
	"acta_delivery",
	"client_signature",
	"ses_filing",
	"ses_approval",
	"invoice_sent",
	"invoice_approval",
	"payment_support",
] as const satisfies readonly ClosingEvidenceKind[];

export type AdministrativeClosureRequirementKind =
	(typeof ADMINISTRATIVE_CLOSURE_REQUIREMENT_KINDS)[number];

export interface ClosureReadinessResult {
	canCloseAdministratively: boolean;
	completionPercentage: number;
	missingKinds: AdministrativeClosureRequirementKind[];
	blockingRequirements: ClosureRequirement[];
}

/**
 * Evalúa si un caso puede cerrarse administrativamente según requisitos 8–14.
 * Un requisito en estado `missing` bloquea el cierre; `pending` no bloquea si hay soporte cargado.
 */
export function evaluateClosureReadiness(
	requirements: ClosureRequirement[],
): ClosureReadinessResult {
	const administrative = requirements.filter((requirement) =>
		ADMINISTRATIVE_CLOSURE_REQUIREMENT_KINDS.includes(
			requirement.kind as AdministrativeClosureRequirementKind,
		),
	);

	const completed = administrative.filter((requirement) => requirement.status === "completed");
	const blockingRequirements = administrative.filter(
		(requirement) => requirement.status === "missing",
	);
	const missingKinds = blockingRequirements.map(
		(requirement) => requirement.kind as AdministrativeClosureRequirementKind,
	);

	const completionPercentage =
		administrative.length === 0 ? 0 : Math.round((completed.length / administrative.length) * 100);

	return {
		canCloseAdministratively: blockingRequirements.length === 0 && administrative.length > 0,
		completionPercentage,
		missingKinds,
		blockingRequirements,
	};
}
