/**
 * FSM Engine — Finite State Machine centralizado
 *
 * Handles state-transition validation for every entity in the system.
 * Cada entidad define sus propias reglas de transición.
 * El engine valida, registra en audit log y retorna errores tipados.
 */

import { AppError } from "../errors/AppError";

// ─── Tipos ──────────────────────────────────────────────────────────────────

export type FsmEntityType =
	| "WorkRequest"
	| "SiteVisit"
	| "Proposal"
	| "PurchaseOrder"
	| "WorkOrder"
	| "PlanningPacket"
	| "ExecutionSession"
	| "Evidence"
	| "TechnicalReport"
	| "DeliveryRecord"
	| "ServiceEntrySheet"
	| "Invoice"
	| "InvoiceApproval"
	| "Payment";

export interface FsmTransitionRule {
	from: string;
	to: string[];
}

export interface FsmDefinition {
	entityType: FsmEntityType;
	states: string[];
	transitions: FsmTransitionRule[];
	terminalStates?: string[];
	description?: string;
}

export interface FsmTransitionResult {
	valid: boolean;
	from: string;
	to: string;
	entityType: FsmEntityType;
	error?: string;
}

// ─── Registry ───────────────────────────────────────────────────────────────

const registry = new Map<FsmEntityType, FsmDefinition>();

export function registerFsm(fsm: FsmDefinition): void {
	if (registry.has(fsm.entityType)) {
		throw new Error(`FSM already registered for entity: ${fsm.entityType}`);
	}
	registry.set(fsm.entityType, fsm);
}

export function getFsm(entityType: FsmEntityType): FsmDefinition | undefined {
	return registry.get(entityType);
}

// ─── Validation ─────────────────────────────────────────────────────────────

export function validateTransition(
	entityType: FsmEntityType,
	from: string,
	to: string,
): FsmTransitionResult {
	const fsm = registry.get(entityType);

	if (!fsm) {
		return {
			valid: false,
			from,
			to,
			entityType,
			error: `No FSM definition found for entity: ${entityType}`,
		};
	}

	// Validate source state
	if (!fsm.states.includes(from)) {
		return {
			valid: false,
			from,
			to,
			entityType,
			error: `Invalid source state '${from}' for ${entityType}. Valid states: ${fsm.states.join(", ")}`,
		};
	}

	// Validate target state
	if (!fsm.states.includes(to)) {
		return {
			valid: false,
			from,
			to,
			entityType,
			error: `Invalid target state '${to}' for ${entityType}. Valid states: ${fsm.states.join(", ")}`,
		};
	}

	// Check terminal state
	if (fsm.terminalStates?.includes(from)) {
		return {
			valid: false,
			from,
			to,
			entityType,
			error: `Cannot transition from terminal state '${from}' for ${entityType}`,
		};
	}

	// Find the transition rule
	const rule = fsm.transitions.find((t) => t.from === from);
	if (!rule) {
		return {
			valid: false,
			from,
			to,
			entityType,
			error: `No transition rules defined from state '${from}' for ${entityType}`,
		};
	}

	if (!rule.to.includes(to)) {
		return {
			valid: false,
			from,
			to,
			entityType,
			error: `Invalid transition from '${from}' to '${to}' for ${entityType}. Allowed targets: ${rule.to.join(", ")}`,
		};
	}

	return {
		valid: true,
		from,
		to,
		entityType,
	};
}

/**
 * Validate transition and throw AppError if invalid.
 * Use this in services for clean validation with error codes.
 */
export function requireValidTransition(
	entityType: FsmEntityType,
	from: string,
	to: string,
	entityId?: string,
): void {
	const result = validateTransition(entityType, from, to);

	if (!result.valid) {
		const message = entityId
			? `Invalid state transition for ${entityType}(${entityId}): ${result.error}`
			: `Invalid state transition for ${entityType}: ${result.error}`;

		throw new AppError(message, 409, "INVALID_FSM_TRANSITION");
	}
}

/**
 * Get allowed target states from a given state
 */
export function getAllowedTransitions(entityType: FsmEntityType, currentState: string): string[] {
	const fsm = registry.get(entityType);
	if (!fsm) {
		return [];
	}

	const rule = fsm.transitions.find((t) => t.from === currentState);
	return rule?.to ?? [];
}

/**
 * Check if a state is a terminal state for the entity
 */
export function isTerminalState(entityType: FsmEntityType, state: string): boolean {
	const fsm = registry.get(entityType);
	if (!fsm) {
		return false;
	}
	return fsm.terminalStates?.includes(state) ?? false;
}

// ─── Built-in FSM Definitions ───────────────────────────────────────────────

export function registerAllFsms(): void {
	// WorkRequest
	registerFsm({
		entityType: "WorkRequest",
		states: ["draft", "submitted", "qualified", "visit_required", "proposal_pending", "cancelled"],
		transitions: [
			{ from: "draft", to: ["submitted", "cancelled"] },
			{ from: "submitted", to: ["qualified", "visit_required", "cancelled"] },
			{ from: "qualified", to: ["visit_required", "proposal_pending", "cancelled"] },
			{ from: "visit_required", to: ["proposal_pending", "cancelled"] },
			{ from: "proposal_pending", to: ["cancelled"] },
			{ from: "cancelled", to: [] },
		],
		terminalStates: ["cancelled"],
		description: "Solicitud de trabajo: desde la creación hasta la calificación",
	});

	// SiteVisit
	registerFsm({
		entityType: "SiteVisit",
		states: ["pending", "scheduled", "in_progress", "completed", "cancelled"],
		transitions: [
			{ from: "pending", to: ["scheduled", "cancelled"] },
			{ from: "scheduled", to: ["in_progress", "cancelled"] },
			{ from: "in_progress", to: ["completed", "cancelled"] },
			{ from: "completed", to: [] },
			{ from: "cancelled", to: [] },
		],
		terminalStates: ["completed", "cancelled"],
		description: "Visita técnica: agendamiento, ejecución y finalización",
	});

	// Proposal
	registerFsm({
		entityType: "Proposal",
		states: ["draft", "sent", "approved", "rejected", "expired"],
		transitions: [
			{ from: "draft", to: ["sent", "expired"] },
			{ from: "sent", to: ["approved", "rejected", "expired"] },
			{ from: "approved", to: ["expired"] },
			{ from: "rejected", to: ["draft"] },
			{ from: "expired", to: [] },
		],
		terminalStates: ["expired"],
		description: "Propuesta comercial: envío, aprobación y vencimiento",
	});

	// PurchaseOrder
	registerFsm({
		entityType: "PurchaseOrder",
		states: ["pending", "received", "approved", "rejected"],
		transitions: [
			{ from: "pending", to: ["received", "rejected"] },
			{ from: "received", to: ["approved", "rejected"] },
			{ from: "approved", to: [] },
			{ from: "rejected", to: ["received"] },
		],
		terminalStates: ["approved"],
		description: "Orden de compra: recepción, aprobación y rechazo",
	});

	// WorkOrder
	registerFsm({
		entityType: "WorkOrder",
		states: [
			"open",
			"proposal_sent",
			"proposal_approved",
			"planning",
			"assigned",
			"ready_for_execution",
			"execution_in_progress",
			"execution_completed",
			"in_progress",
			"report_pending",
			"on_hold",
			"completed",
			"ready_for_invoicing",
			"acta_signed",
			"ses_sent",
			"invoice_approved",
			"paid",
			"closed",
			"cancelled",
		],
		transitions: [
			{ from: "open", to: ["proposal_sent", "planning", "assigned", "cancelled"] },
			{ from: "proposal_sent", to: ["proposal_approved", "cancelled"] },
			{ from: "proposal_approved", to: ["planning", "assigned", "cancelled"] },
			{ from: "planning", to: ["assigned", "ready_for_execution", "cancelled"] },
			{ from: "assigned", to: ["ready_for_execution", "in_progress", "on_hold", "cancelled"] },
			{
				from: "ready_for_execution",
				to: ["execution_in_progress", "in_progress", "on_hold", "cancelled"],
			},
			{
				from: "execution_in_progress",
				to: ["execution_completed", "report_pending", "on_hold", "cancelled"],
			},
			{ from: "execution_completed", to: ["report_pending", "completed", "cancelled"] },
			{ from: "in_progress", to: ["report_pending", "completed", "on_hold", "cancelled"] },
			{ from: "report_pending", to: ["completed", "cancelled"] },
			{ from: "on_hold", to: ["in_progress", "cancelled"] },
			{ from: "completed", to: ["ready_for_invoicing", "acta_signed", "closed", "cancelled"] },
			{ from: "ready_for_invoicing", to: ["acta_signed", "closed", "cancelled"] },
			{ from: "acta_signed", to: ["ses_sent", "closed", "cancelled"] },
			{ from: "ses_sent", to: ["invoice_approved", "closed", "cancelled"] },
			{ from: "invoice_approved", to: ["paid", "closed", "cancelled"] },
			{ from: "paid", to: ["closed"] },
			{ from: "closed", to: [] },
			{ from: "cancelled", to: [] },
		],
		terminalStates: ["closed", "cancelled"],
		description: "Orden de trabajo: ciclo de vida completo de 14 pasos",
	});

	// PlanningPacket
	registerFsm({
		entityType: "PlanningPacket",
		states: ["draft", "ready", "approved"],
		transitions: [
			{ from: "draft", to: ["ready"] },
			{ from: "ready", to: ["approved", "draft"] },
			{ from: "approved", to: ["draft"] },
		],
		terminalStates: [],
		description: "Paquete de planeación: borrador, listo y aprobado",
	});

	// ExecutionSession
	registerFsm({
		entityType: "ExecutionSession",
		states: [
			"draft",
			"ready",
			"in_progress",
			"paused",
			"completed",
			"cancelled",
			"sync_pending",
			"sync_failed",
		],
		transitions: [
			{ from: "draft", to: ["ready", "cancelled"] },
			{ from: "ready", to: ["in_progress", "cancelled"] },
			{ from: "in_progress", to: ["paused", "completed", "cancelled"] },
			{ from: "paused", to: ["in_progress", "cancelled"] },
			{ from: "completed", to: ["sync_pending"] },
			{ from: "sync_pending", to: ["sync_failed", "completed"] },
			{ from: "sync_failed", to: ["sync_pending", "completed"] },
			{ from: "cancelled", to: [] },
		],
		terminalStates: ["completed", "cancelled"],
		description: "Sesión de ejecución: inicio, pausa, reanudación y finalización",
	});

	// Evidence
	registerFsm({
		entityType: "Evidence",
		states: ["pending", "uploaded", "verified", "rejected"],
		transitions: [
			{ from: "pending", to: ["uploaded"] },
			{ from: "uploaded", to: ["verified", "rejected"] },
			{ from: "verified", to: [] },
			{ from: "rejected", to: ["uploaded"] },
		],
		terminalStates: ["verified"],
		description: "Evidencia: carga, verificación y rechazo",
	});

	// TechnicalReport
	registerFsm({
		entityType: "TechnicalReport",
		states: ["not_created", "draft", "generated", "reviewed", "approved", "rejected", "cancelled"],
		transitions: [
			{ from: "not_created", to: ["draft"] },
			{ from: "draft", to: ["generated", "cancelled"] },
			{ from: "generated", to: ["reviewed", "approved", "rejected", "cancelled"] },
			{ from: "reviewed", to: ["approved", "rejected", "cancelled"] },
			{ from: "approved", to: ["cancelled"] },
			{ from: "rejected", to: ["draft", "cancelled"] },
			{ from: "cancelled", to: [] },
		],
		terminalStates: ["approved", "cancelled"],
		description: "Informe técnico: generación, revisión y aprobación",
	});

	// DeliveryRecord
	registerFsm({
		entityType: "DeliveryRecord",
		states: ["not_created", "draft", "sent", "signed", "rejected", "cancelled"],
		transitions: [
			{ from: "not_created", to: ["draft"] },
			{ from: "draft", to: ["sent", "cancelled"] },
			{ from: "sent", to: ["signed", "rejected", "cancelled"] },
			{ from: "signed", to: [] },
			{ from: "rejected", to: ["draft", "cancelled"] },
			{ from: "cancelled", to: [] },
		],
		terminalStates: ["signed", "cancelled"],
		description: "Acta de entrega: envío, firma y rechazo",
	});

	// ServiceEntrySheet
	registerFsm({
		entityType: "ServiceEntrySheet",
		states: ["not_created", "draft", "created", "submitted", "approved", "rejected", "cancelled"],
		transitions: [
			{ from: "not_created", to: ["draft"] },
			{ from: "draft", to: ["created", "cancelled"] },
			{ from: "created", to: ["submitted", "cancelled"] },
			{ from: "submitted", to: ["approved", "rejected", "cancelled"] },
			{ from: "approved", to: [] },
			{ from: "rejected", to: ["draft", "cancelled"] },
			{ from: "cancelled", to: [] },
		],
		terminalStates: ["approved", "cancelled"],
		description: "Hoja de entrada de servicio: creación, envío y aprobación",
	});

	// Invoice
	registerFsm({
		entityType: "Invoice",
		states: [
			"draft",
			"issued",
			"sent",
			"submitted",
			"approved",
			"accepted",
			"rejected",
			"partially_paid",
			"paid",
			"cancelled",
			"void",
		],
		transitions: [
			{ from: "draft", to: ["issued", "cancelled"] },
			{ from: "issued", to: ["sent", "cancelled"] },
			{ from: "sent", to: ["submitted", "approved", "rejected", "cancelled"] },
			{ from: "submitted", to: ["approved", "rejected", "cancelled"] },
			{ from: "approved", to: ["accepted", "partially_paid", "paid", "cancelled"] },
			{ from: "accepted", to: ["partially_paid", "paid", "cancelled"] },
			{ from: "rejected", to: ["draft", "cancelled"] },
			{ from: "partially_paid", to: ["paid", "cancelled"] },
			{ from: "paid", to: [] },
			{ from: "cancelled", to: [] },
			{ from: "void", to: [] },
		],
		terminalStates: ["paid", "cancelled", "void"],
		description: "Factura: ciclo de vida desde borrador hasta pago",
	});

	// InvoiceApproval
	registerFsm({
		entityType: "InvoiceApproval",
		states: ["pending", "approved", "rejected", "cancelled"],
		transitions: [
			{ from: "pending", to: ["approved", "rejected", "cancelled"] },
			{ from: "approved", to: [] },
			{ from: "rejected", to: ["pending"] },
			{ from: "cancelled", to: [] },
		],
		terminalStates: ["approved", "cancelled"],
		description: "Aprobación de factura: pendiente, aprobada o rechazada",
	});

	// Payment
	registerFsm({
		entityType: "Payment",
		states: ["not_due", "due", "recorded", "reconciled", "rejected"],
		transitions: [
			{ from: "not_due", to: ["due"] },
			{ from: "due", to: ["recorded", "rejected"] },
			{ from: "recorded", to: ["reconciled", "rejected"] },
			{ from: "reconciled", to: [] },
			{ from: "rejected", to: ["recorded"] },
		],
		terminalStates: ["reconciled"],
		description: "Pago: registro y conciliación bancaria",
	});
}
