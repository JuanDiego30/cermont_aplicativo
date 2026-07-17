import type { UserRole } from "../roles";
import { hasRole } from "../roles";
import {
	CERMONT_OPERATIONAL_STEPS,
	type CermontOperationalStep,
	type CermontOperationalStepStatus,
	getOperationalStepByKey,
} from "./operational-steps";

export type StepRequirementKind = "document" | "evidence" | "approval" | "cost";

export interface StepRequirement {
	id: string;
	label: string;
	kind: StepRequirementKind;
	required: boolean;
}

export interface WorkflowBlocker {
	code: string;
	message: string;
	stepKey: string;
	severity: "critical" | "warning";
}

export interface WorkflowContext {
	availableDocuments: readonly string[];
	availableEvidences: readonly string[];
	approvals: readonly string[];
	hasCostBaseline: boolean;
	hasActualCosts: boolean;
}

export interface WorkflowAction {
	actionKey: string;
	label: string;
	stepKey: string;
	enabled: boolean;
	blockedReason: string;
}

export interface ServiceCaseWorkflowSnapshot {
	currentStepKey: string;
	stepStatuses: Readonly<Record<string, CermontOperationalStepStatus>>;
}

const EMPTY_CONTEXT: WorkflowContext = {
	availableDocuments: [],
	availableEvidences: [],
	approvals: [],
	hasCostBaseline: false,
	hasActualCosts: false,
};

const ACTION_LABELS: Readonly<Record<string, string>> = {
	work_request: "Nueva solicitud",
	site_visit: "Nueva visita",
	proposal: "Nueva propuesta",
	purchase_order: "Registrar PO",
	planning: "Nueva planeación",
	execution: "Iniciar ejecución",
	evidences: "Subir evidencia",
	technical_report: "Generar informe",
	delivery_record: "Generar acta",
	client_signature: "Registrar firma",
	ses: "Crear SES",
	invoice: "Crear factura",
	invoice_approval: "Aprobar factura",
	payment: "Registrar pago",
};

const STEP_REQUIREMENTS: Readonly<Record<string, readonly StepRequirement[]>> = {
	work_request: [
		{
			id: "formal_request",
			label: "Solicitud formal registrada",
			kind: "document",
			required: true,
		},
	],
	site_visit: [
		{ id: "visit_report", label: "Reporte de visita técnica", kind: "document", required: true },
		{ id: "visit_evidence", label: "Evidencia de visita", kind: "evidence", required: true },
	],
	proposal: [
		{ id: "economic_proposal", label: "Propuesta económica", kind: "document", required: true },
	],
	purchase_order: [
		{ id: "client_po", label: "Orden de compra aprobada", kind: "approval", required: true },
		{
			id: "proposal_approved",
			label: "Propuesta aprobada por el cliente",
			kind: "approval",
			required: true,
		},
	],
	planning: [
		{ id: "ats", label: "ATS", kind: "document", required: true },
		{ id: "ptw", label: "Permiso de trabajo", kind: "document", required: true },
		{ id: "checklist", label: "Checklist operativo", kind: "document", required: true },
		{ id: "kit", label: "Kit/materiales confirmados", kind: "document", required: true },
		{ id: "cost_baseline", label: "Costo estimado congelado", kind: "cost", required: true },
	],
	execution: [
		{
			id: "execution_started",
			label: "Sesión de ejecución iniciada",
			kind: "approval",
			required: true,
		},
		{
			id: "planning_approved",
			label: "Planeación aprobada sin bloqueos críticos",
			kind: "approval",
			required: true,
		},
	],
	evidences: [
		{
			id: "execution_evidence",
			label: "Evidencias de ejecución",
			kind: "evidence",
			required: true,
		},
		{ id: "actual_costs", label: "Costos reales registrados", kind: "cost", required: true },
		{
			id: "session_completed",
			label: "Sesión de ejecución completada",
			kind: "approval",
			required: true,
		},
	],
	technical_report: [
		{ id: "technical_report", label: "Informe técnico", kind: "document", required: true },
	],
	delivery_record: [
		{ id: "delivery_record", label: "Acta de entrega", kind: "document", required: true },
		{
			id: "report_approved",
			label: "Informe técnico aprobado",
			kind: "approval",
			required: true,
		},
	],
	client_signature: [
		{
			id: "client_signature",
			label: "Firma o recibo del cliente",
			kind: "approval",
			required: true,
		},
	],
	ses: [
		{ id: "ses_approved", label: "SES / Ariba aprobada", kind: "approval", required: true },
		{
			id: "acceptance_registered",
			label: "Aceptación del servicio registrada por el cliente",
			kind: "approval",
			required: true,
		},
	],
	invoice: [
		{ id: "invoice", label: "Factura emitida", kind: "document", required: true },
		{
			id: "ses_approved",
			label: "SES / Ariba aprobada",
			kind: "approval",
			required: true,
		},
	],
	invoice_approval: [
		{ id: "invoice_approved", label: "Factura aprobada", kind: "approval", required: true },
	],
	payment: [
		{ id: "payment_record", label: "Pago registrado", kind: "approval", required: true },
		{
			id: "invoice_approved",
			label: "Factura aprobada para pago",
			kind: "approval",
			required: true,
		},
	],
};

function normalizeStepKey(stepKey: string): string {
	if (stepKey.startsWith("step_")) {
		const parts = stepKey.split("_").slice(2);
		return parts.join("_");
	}
	return stepKey;
}

function includesToken(values: readonly string[], token: string): boolean {
	return values.some((value) => value === token);
}

function isRequirementSatisfied(requirement: StepRequirement, context: WorkflowContext): boolean {
	switch (requirement.kind) {
		case "document":
			return includesToken(context.availableDocuments, requirement.id);
		case "evidence":
			return includesToken(context.availableEvidences, requirement.id);
		case "approval":
			return includesToken(context.approvals, requirement.id);
		case "cost":
			return requirement.id === "actual_costs" ? context.hasActualCosts : context.hasCostBaseline;
	}
}

function getCompletedStatus(
	serviceCase: ServiceCaseWorkflowSnapshot,
	step: CermontOperationalStep,
): CermontOperationalStepStatus {
	return serviceCase.stepStatuses[step.key] ?? "pending";
}

export function getStepRequirements(stepKey: string): readonly StepRequirement[] {
	return STEP_REQUIREMENTS[normalizeStepKey(stepKey)] ?? [];
}

export function buildBlockers(
	serviceCase: ServiceCaseWorkflowSnapshot,
	context: WorkflowContext = EMPTY_CONTEXT,
): readonly WorkflowBlocker[] {
	const currentStepKey = normalizeStepKey(serviceCase.currentStepKey);
	const currentStep = getOperationalStepByKey(currentStepKey) ?? CERMONT_OPERATIONAL_STEPS[0];
	const blockers: WorkflowBlocker[] = [];

	for (const precondition of currentStep.preconditions) {
		if (
			getCompletedStatus(serviceCase, getOperationalStepByKey(precondition) ?? currentStep) !==
			"completed"
		) {
			blockers.push({
				code: `missing_${precondition}`,
				message: `Debe completar el paso previo: ${precondition}`,
				stepKey: precondition,
				severity: "critical",
			});
		}
	}

	for (const requirement of getStepRequirements(currentStep.key)) {
		if (requirement.required && !isRequirementSatisfied(requirement, context)) {
			blockers.push({
				code: `missing_${requirement.id}`,
				message: `Falta requisito: ${requirement.label}`,
				stepKey: currentStep.key,
				severity: "critical",
			});
		}
	}

	return blockers;
}

export function canAdvanceStep(
	serviceCase: ServiceCaseWorkflowSnapshot,
	context: WorkflowContext = EMPTY_CONTEXT,
) {
	const blockers = buildBlockers(serviceCase, context);
	return {
		allowed: blockers.length === 0,
		blockers,
	};
}

export function getAllowedActions(
	serviceCase: ServiceCaseWorkflowSnapshot,
	role: UserRole,
): readonly WorkflowAction[] {
	const currentStepKey = normalizeStepKey(serviceCase.currentStepKey);
	const currentStep = getOperationalStepByKey(currentStepKey) ?? CERMONT_OPERATIONAL_STEPS[0];
	const roleAllowed = hasRole(role, currentStep.allowedRoles as UserRole[]);
	const previousStepsComplete = currentStep.preconditions.every((stepKey) => {
		const step = getOperationalStepByKey(stepKey);
		return step ? getCompletedStatus(serviceCase, step) === "completed" : false;
	});
	const enabled = roleAllowed && previousStepsComplete;

	return [
		{
			actionKey: currentStep.key,
			label: ACTION_LABELS[currentStep.key] ?? `Continuar ${currentStep.label}`,
			stepKey: currentStep.key,
			enabled,
			blockedReason: enabled ? "" : "El rol o los pasos previos no permiten esta acción",
		},
	];
}
