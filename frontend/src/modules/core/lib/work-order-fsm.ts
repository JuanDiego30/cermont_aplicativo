import type { OrderStatus } from "@cermont/shared-types";

export type WorkOrderStatus = OrderStatus;

export const TERMINAL_STATES: WorkOrderStatus[] = ["closed", "cancelled"];

export const ACTIVE_STATES: WorkOrderStatus[] = [
	"ready_for_execution",
	"execution_in_progress",
	"execution_completed",
	"in_progress",
	"on_hold",
	"report_pending",
];

export const EDITABLE_STATES: WorkOrderStatus[] = [
	"open",
	"proposal_sent",
	"proposal_approved",
	"planning",
	"assigned",
	"ready_for_execution",
];

const TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
	open: ["proposal_sent", "planning", "assigned", "cancelled"],
	proposal_sent: ["proposal_approved", "cancelled"],
	proposal_approved: ["planning", "assigned", "cancelled"],
	planning: ["assigned", "ready_for_execution", "cancelled"],
	assigned: ["ready_for_execution", "in_progress", "on_hold", "cancelled"],
	ready_for_execution: ["execution_in_progress", "in_progress", "on_hold", "cancelled"],
	execution_in_progress: ["execution_completed", "report_pending", "on_hold", "cancelled"],
	execution_completed: ["report_pending", "completed", "cancelled"],
	in_progress: ["report_pending", "completed", "on_hold", "cancelled"],
	report_pending: ["completed", "cancelled"],
	on_hold: ["in_progress", "cancelled"],
	completed: ["ready_for_invoicing", "acta_signed", "closed", "cancelled"],
	ready_for_invoicing: ["acta_signed", "closed", "cancelled"],
	acta_signed: ["ses_sent", "closed", "cancelled"],
	ses_sent: ["invoice_approved", "closed", "cancelled"],
	invoice_approved: ["paid", "closed", "cancelled"],
	paid: ["closed"],
	closed: [],
	cancelled: [],
};

export const STATUS_LABELS_ES: Record<WorkOrderStatus, string> = {
	open: "Abierta",
	proposal_sent: "Propuesta enviada",
	proposal_approved: "Propuesta aprobada",
	planning: "En planeación",
	assigned: "Asignada",
	ready_for_execution: "Lista para ejecución",
	execution_in_progress: "Ejecución en campo",
	execution_completed: "Ejecución completada",
	in_progress: "En Progreso",
	on_hold: "En Pausa",
	report_pending: "Informe pendiente",
	completed: "Completada",
	ready_for_invoicing: "Lista para facturación",
	acta_signed: "Acta firmada",
	ses_sent: "SES enviada",
	invoice_approved: "Factura aprobada",
	paid: "Pagada",
	closed: "Cerrada",
	cancelled: "Cancelada",
};

export function isValidTransition(from: WorkOrderStatus, to: WorkOrderStatus): boolean {
	return TRANSITIONS[from]?.includes(to) ?? false;
}

export function getAllowedTransitions(status: WorkOrderStatus): WorkOrderStatus[] {
	return TRANSITIONS[status] ?? [];
}

export function getTransitionRules(): Record<WorkOrderStatus, WorkOrderStatus[]> {
	return { ...TRANSITIONS };
}

export function getTransitionErrorMessage(from: WorkOrderStatus, to: WorkOrderStatus): string {
	if (!isValidTransition(from, to)) {
		return `No se puede cambiar de ${STATUS_LABELS_ES[from]} a ${STATUS_LABELS_ES[to]}`;
	}
	return "";
}

export function getTransitionRequirements(_to: WorkOrderStatus): string[] {
	if (_to === "ready_for_invoicing") {
		return ["Registrar costos", "Aprobar informe de trabajo"];
	}

	if (_to === "closed") {
		return ["La orden debe estar lista para facturación"];
	}

	return [];
}
