/**
 * Planning Rules — Preconditions and gates for planning step (step 5)
 *
 * These rules block execution (step 6) if planning is incomplete.
 * SSOT for planning readiness validation.
 *
 * F14-T044: Readiness calculation and approval gating.
 * F15-T047: Certification validation and equipment calibration checks.
 */

/** Document types required for planning readiness */
export const REQUIRED_PLANNING_DOCUMENTS = [
	"ats",
	"ast",
	"ptw",
	"procedimiento",
	"instructivo",
	"checklist_equipos",
] as const;

export type PlanningDocumentType = (typeof REQUIRED_PLANNING_DOCUMENTS)[number];

/** Required planning fields */
export interface PlanningReadiness {
	hasSchedule: boolean;
	hasLaborAssignment: boolean;
	hasToolsAssignment: boolean;
	hasEquipmentAssignment: boolean;
	hasMaterialsList: boolean;
	hasSafetyElements: boolean;
	hasCertifications: boolean;
	hasReferenceDocuments: PlanningDocumentType[];
	missingRequiredDocuments: PlanningDocumentType[];
	hasChecklists: boolean;
}

export interface PlanningBlocker {
	code: string;
	message: string;
	severity: "warning" | "error" | "critical";
}

/** Check if planning is ready for execution */
export function isPlanningReady(readiness: PlanningReadiness): boolean {
	return getPlanningBlockers(readiness).length === 0;
}

/** Get all blockers that prevent execution */
export function getPlanningBlockers(readiness: PlanningReadiness): PlanningBlocker[] {
	const blockers: PlanningBlocker[] = [];

	if (!readiness.hasSchedule) {
		blockers.push({
			code: "MISSING_SCHEDULE",
			message: "Cronograma de obra no definido",
			severity: "error",
		});
	}

	if (!readiness.hasLaborAssignment) {
		blockers.push({
			code: "MISSING_LABOR",
			message: "Mano de obra no asignada",
			severity: "error",
		});
	}

	if (!readiness.hasToolsAssignment) {
		blockers.push({
			code: "MISSING_TOOLS",
			message: "Herramientas no asignadas",
			severity: "warning",
		});
	}

	if (!readiness.hasEquipmentAssignment) {
		blockers.push({
			code: "MISSING_EQUIPMENT",
			message: "Equipos no asignados",
			severity: "warning",
		});
	}

	if (!readiness.hasMaterialsList) {
		blockers.push({
			code: "MISSING_MATERIALS",
			message: "Materiales no definidos",
			severity: "warning",
		});
	}

	if (!readiness.hasSafetyElements) {
		blockers.push({
			code: "MISSING_SAFETY",
			message: "Elementos de seguridad no definidos",
			severity: "critical",
		});
	}

	if (!readiness.hasCertifications) {
		blockers.push({
			code: "MISSING_CERTIFICATIONS",
			message: "Certificaciones de equipos/personal no verificadas",
			severity: "error",
		});
	}

	for (const docType of readiness.missingRequiredDocuments) {
		const docLabels: Record<string, string> = {
			ats: "ATS (Análisis de Trabajo Seguro)",
			ast: "AST (Análisis de Seguridad en el Trabajo)",
			ptw: "PTW (Permiso de Trabajo)",
			procedimiento: "Procedimiento de trabajo",
			instructivo: "Instructivo",
			checklist_equipos: "Checklist de equipos/herramientas",
		};
		blockers.push({
			code: `MISSING_DOC_${docType.toUpperCase()}`,
			message: `Documento faltante: ${docLabels[docType] ?? docType}`,
			severity: "error",
		});
	}

	if (!readiness.hasChecklists) {
		blockers.push({
			code: "MISSING_CHECKLISTS",
			message: "Checklists de tareas críticas no definidos",
			severity: "warning",
		});
	}

	return blockers;
}

/** Get the most severe blocker severity */
export function getMaxBlockerSeverity(
	blockers: PlanningBlocker[],
): "critical" | "error" | "warning" | "none" {
	if (blockers.some((b) => b.severity === "critical")) {
		return "critical";
	}
	if (blockers.some((b) => b.severity === "error")) {
		return "error";
	}
	if (blockers.some((b) => b.severity === "warning")) {
		return "warning";
	}
	return "none";
}

// ─── F14-T044: Readiness calculation ─────────────────────────────────────

export interface ReadinessReport {
	ready: boolean;
	blockers: PlanningBlocker[];
	severity: ReturnType<typeof getMaxBlockerSeverity>;
}

/**
 * Calculate full readiness report from a PlanningReadiness view.
 * Returns explicit blockers for missing tools, expired certifications,
 * and incomplete documents (F14-T044, F15-T047).
 */
export function calculateReadiness(readiness: PlanningReadiness): ReadinessReport {
	const blockers = getPlanningBlockers(readiness);
	const severity = getMaxBlockerSeverity(blockers);
	return {
		ready: blockers.length === 0,
		blockers,
		severity,
	};
}

// ─── F14-T044: Approval decision ─────────────────────────────────────────

export type ApprovalDecision =
	| { allowed: true; blockers: [] }
	| { allowed: false; blockers: PlanningBlocker[] };

const APPROVAL_ALLOWED_ROLES = ["gerente", "residente"] as const;

/**
 * Determine if a user can approve a planning packet.
 * Checks: readiness completeness, current status, and user role.
 *
 * Approval is allowed when:
 * - Packet is not already approved
 * - Readiness has no blockers (complete schedule, crew, tools, equipment, etc.)
 * - User is gerente or residente
 */
export function canApprovePlanning(
	readiness: PlanningReadiness,
	currentStatus: string,
	userRole: string,
): ApprovalDecision {
	const blockers: PlanningBlocker[] = [];

	if (currentStatus === "approved") {
		blockers.push({
			code: "ALREADY_APPROVED",
			message: "La planeación ya está aprobada.",
			severity: "error",
		});
	}

	const readinessBlockers = getPlanningBlockers(readiness);
	blockers.push(...readinessBlockers);

	if (!(APPROVAL_ALLOWED_ROLES as readonly string[]).includes(userRole)) {
		blockers.push({
			code: "INSUFFICIENT_PERMISSIONS",
			message: "Se requiere rol gerente o residente para aprobar la planeación.",
			severity: "error",
		});
	}

	if (blockers.length > 0) {
		return { allowed: false, blockers };
	}
	return { allowed: true, blockers: [] };
}
