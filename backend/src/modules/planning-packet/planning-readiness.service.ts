/**
 * Planning Readiness Service — Readiness gate evaluation for planning packets
 *
 * Resolves whether a planning packet is ready for execution and, critically,
 * WHY it is not: explicit blocking reasons so field crews know exactly which
 * tools, documents, certifications or responsibles are missing before leaving
 * to the work site (LTG failure #1/#2 — incomplete tools at execution time).
 */

import type {
	PlanningPacketStatus,
	PlanningReadinessCheck,
	PlanningReadinessReport,
} from "@cermont/shared-types";
import { AppError } from "../../common/errors";
import { PlanningPacket } from "../../models/PlanningPacket";

const REQUIRED_PLANNING_RESPONSIBLE_ROLES = [
	"ingeniero_residente",
	"tecnico_electricista",
	"hes",
] as const;

const RESPONSIBLE_ROLE_LABELS: Record<string, string> = {
	ingeniero_residente: "Ingeniero residente",
	tecnico_electricista: "Técnico electricista",
	hes: "HES",
};

export type PlanningReferenceValue = string | Date | { toString(): string };
type PlanningBlockerReadiness = { resolved: boolean };
export type PlanningPacketReadinessView = {
	status: PlanningPacketStatus;
	responsibleInspectorId?: PlanningReferenceValue;
	responsibleInspectorName?: string;
	place?: string;
	plannedDate?: Date | string;
	businessUnit?: string;
	scope?: string;
	schedule?: { plannedStartAt?: Date | string };
	crew: Array<{ name?: string; role?: string }>;
	materials: Array<{ description?: string; quantity?: number }>;
	tools: Array<{ name?: string; available: boolean }>;
	equipment: Array<{ name?: string; available: boolean; certificateRequired?: boolean }>;
	safetyElements: Array<{ description?: string; quantity?: number }>;
	workerRequirements?: {
		electricistas?: number;
		tecnicosTelecomunicacion?: number;
		instrumentistas?: number;
		obreros?: number;
	};
	responsibles: Array<{
		role: string;
		status?: string;
		userId?: PlanningReferenceValue;
		name?: string;
		signatureEvidenceId?: PlanningReferenceValue;
	}>;
	requiredCertifications: Array<{ verified: boolean; name?: string }>;
	astRequired: boolean;
	ptwRequired: boolean;
	supportDocuments: Array<{ documentType: string; required: boolean }>;
	readinessChecklist: Array<{ checked: boolean }>;
	blockers: PlanningBlockerReadiness[];
};

type EvaluatedReadinessCheck = PlanningReadinessCheck & { reasons: string[] };

function evaluateChecklist(packet: PlanningPacketReadinessView): EvaluatedReadinessCheck {
	const pendingCount = packet.readinessChecklist.filter((item) => !item.checked).length;
	return {
		key: "readiness_checklist",
		label: "Checklist de alistamiento",
		passed: pendingCount === 0,
		reasons:
			pendingCount === 0
				? []
				: [`${pendingCount} ítem(s) del checklist de alistamiento sin confirmar.`],
	};
}

function evaluateBlockers(packet: PlanningPacketReadinessView): EvaluatedReadinessCheck {
	const unresolvedCount = packet.blockers.filter((blocker) => !blocker.resolved).length;
	return {
		key: "blockers",
		label: "Bloqueos de planeación",
		passed: unresolvedCount === 0,
		reasons:
			unresolvedCount === 0 ? [] : [`${unresolvedCount} bloqueo(s) de planeación sin resolver.`],
	};
}

function evaluatePlanningHeader(packet: PlanningPacketReadinessView): EvaluatedReadinessCheck {
	const reasons: string[] = [];
	if (!packet.responsibleInspectorId && !packet.responsibleInspectorName) {
		reasons.push("Falta el responsable de la inspección.");
	}
	if (!packet.place || packet.place.trim().length < 3) {
		reasons.push("Falta el lugar de ejecución.");
	}
	if (!packet.plannedDate && !packet.schedule?.plannedStartAt) {
		reasons.push("Falta la fecha planeada de ejecución.");
	}
	if (!packet.businessUnit) {
		reasons.push("Falta la unidad de negocio.");
	}
	if (!packet.scope || packet.scope.trim().length < 20) {
		reasons.push("El alcance debe describirse con al menos 20 caracteres.");
	}
	return {
		key: "planning_header",
		label: "Datos generales de la planeación",
		passed: reasons.length === 0,
		reasons,
	};
}

function describeResourceGaps(
	resources: Array<{ name?: string; available: boolean }>,
	labels: { empty: string; unavailablePrefix: string; unavailableFallback: string },
): string[] {
	if (resources.length === 0) {
		return [labels.empty];
	}
	const unavailable = resources.filter((resource) => !resource.available);
	if (unavailable.length === 0) {
		return [];
	}
	const names = unavailable
		.map((resource) => resource.name)
		.filter((name): name is string => Boolean(name))
		.join(", ");
	return [
		names
			? `${labels.unavailablePrefix}: ${names}.`
			: `${unavailable.length} ${labels.unavailableFallback}.`,
	];
}

function countRequiredWorkers(packet: PlanningPacketReadinessView): number {
	const workerRequirements = packet.workerRequirements;
	return (
		(workerRequirements?.electricistas ?? 0) +
		(workerRequirements?.tecnicosTelecomunicacion ?? 0) +
		(workerRequirements?.instrumentistas ?? 0) +
		(workerRequirements?.obreros ?? 0)
	);
}

function evaluateResourcePlan(packet: PlanningPacketReadinessView): EvaluatedReadinessCheck {
	const reasons: string[] = [];
	if (packet.crew.length === 0) {
		reasons.push("No hay cuadrilla asignada.");
	}
	if (packet.materials.length === 0) {
		reasons.push("No hay materiales registrados.");
	}
	reasons.push(
		...describeResourceGaps(packet.tools, {
			empty: "No hay herramientas registradas.",
			unavailablePrefix: "Herramientas no disponibles",
			unavailableFallback: "herramienta(s) no disponible(s)",
		}),
		...describeResourceGaps(packet.equipment, {
			empty: "No hay equipos registrados.",
			unavailablePrefix: "Equipos no disponibles",
			unavailableFallback: "equipo(s) no disponible(s)",
		}),
	);
	if (packet.safetyElements.length === 0) {
		reasons.push("No hay elementos de seguridad (EPP) registrados.");
	}
	if (countRequiredWorkers(packet) === 0) {
		reasons.push("No se definió el número de trabajadores requeridos.");
	}
	return {
		key: "resource_plan",
		label: "Recursos: cuadrilla, materiales, herramientas y equipos",
		passed: reasons.length === 0,
		reasons,
	};
}

function evaluateResponsibles(packet: PlanningPacketReadinessView): EvaluatedReadinessCheck {
	const missingRoles = REQUIRED_PLANNING_RESPONSIBLE_ROLES.filter(
		(role) =>
			!packet.responsibles.some(
				(responsible) =>
					responsible.role === role &&
					responsible.status !== "pending" &&
					Boolean(responsible.userId || responsible.name || responsible.signatureEvidenceId),
			),
	);
	return {
		key: "responsibles",
		label: "Responsables de la planeación",
		passed: missingRoles.length === 0,
		reasons: missingRoles.map(
			(role) => `Falta confirmar el responsable: ${RESPONSIBLE_ROLE_LABELS[role] ?? role}.`,
		),
	};
}

function evaluateReferenceDocuments(packet: PlanningPacketReadinessView): EvaluatedReadinessCheck {
	const reasons: string[] = [];
	const hasRequiredAst =
		!packet.astRequired ||
		packet.supportDocuments.some(
			(document) =>
				(document.documentType === "ats" || document.documentType === "ast") && document.required,
		);
	if (!hasRequiredAst) {
		reasons.push("Falta el AST requerido para la actividad.");
	}
	const hasRequiredPtw =
		!packet.ptwRequired ||
		packet.supportDocuments.some(
			(document) => document.documentType === "ptw" && document.required,
		);
	if (!hasRequiredPtw) {
		reasons.push("Falta el permiso de trabajo (PTW) requerido.");
	}
	return {
		key: "reference_documents",
		label: "Documentos de apoyo (AST / PTW)",
		passed: reasons.length === 0,
		reasons,
	};
}

function evaluateCertifications(packet: PlanningPacketReadinessView): EvaluatedReadinessCheck {
	const reasons: string[] = [];
	const unverified = packet.requiredCertifications.filter(
		(certification) => !certification.verified,
	);
	if (unverified.length > 0) {
		const names = unverified
			.map((certification) => certification.name)
			.filter((name): name is string => Boolean(name))
			.join(", ");
		reasons.push(
			names
				? `Certificaciones sin verificar: ${names}.`
				: `${unverified.length} certificación(es) sin verificar.`,
		);
	}
	const equipmentRequiresCertification = packet.equipment.some(
		(equipment) => equipment.certificateRequired,
	);
	if (equipmentRequiresCertification && packet.requiredCertifications.length === 0) {
		reasons.push("Hay equipos que exigen certificación y no se registró ninguna.");
	}
	return {
		key: "certifications",
		label: "Certificaciones de equipos y personal",
		passed: reasons.length === 0,
		reasons,
	};
}

function evaluateReadinessChecks(packet: PlanningPacketReadinessView): EvaluatedReadinessCheck[] {
	return [
		evaluateChecklist(packet),
		evaluateBlockers(packet),
		evaluatePlanningHeader(packet),
		evaluateResourcePlan(packet),
		evaluateResponsibles(packet),
		evaluateReferenceDocuments(packet),
		evaluateCertifications(packet),
	];
}

export function resolvePlanningReadinessStatus(
	packet: PlanningPacketReadinessView,
): PlanningPacketStatus {
	const checks = evaluateReadinessChecks(packet);
	return checks.every((check) => check.passed) ? "ready" : "incomplete";
}

export function buildPlanningReadinessReport(
	planningPacketId: string,
	packet: PlanningPacketReadinessView,
): PlanningReadinessReport {
	const checks = evaluateReadinessChecks(packet);
	const blockingReasons = checks.flatMap((check) => check.reasons);
	return {
		planningPacketId,
		status: blockingReasons.length === 0 ? "ready" : "incomplete",
		canExecute: blockingReasons.length === 0,
		blockingReasons,
		checks: checks.map(({ key, label, passed }) => ({ key, label, passed })),
		generatedAt: new Date().toISOString(),
	};
}

/**
 * Read-only readiness report: does NOT mutate the packet status.
 * Use POST /:id/validate-readiness to persist the recomputed status.
 */
export async function getPlanningReadinessReport(id: string): Promise<PlanningReadinessReport> {
	const planningPacket = await PlanningPacket.findById(id).lean<PlanningPacketReadinessView>();

	if (!planningPacket) {
		throw new AppError("Planning packet not found", 404, "PLANNING_PACKET_NOT_FOUND");
	}

	return buildPlanningReadinessReport(id, planningPacket);
}
