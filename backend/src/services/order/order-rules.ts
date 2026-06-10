/**
 * Order State Machine & Rules
 *
 * Defines:
 * - Order status types
 * - Valid state transitions
 * - Role-based permissions for transitions
 * - Transition validation logic
 *
 * DOC-10 §4: State machine with strict validation
 */

import { isAuthenticatedRole, type UserRole } from "@cermont/domain";
import type { OrderStatus } from "@cermont/shared-types";
import { BadRequestError, UnauthorizedError } from "../../common/errors/AppError";

// Re-export for backward compatibility with other backend modules
export type { OrderPriority, OrderStatus, OrderType } from "@cermont/shared-types";

const LEGACY_STATUS_ALIASES: Readonly<Record<string, OrderStatus>> = {
	"in-progress": "in_progress",
	"on-hold": "on_hold",
	"ready-for-invoicing": "ready_for_invoicing",
	ready_for_invoice: "ready_for_invoicing",
	canceled: "cancelled",
};

function normalizeOrderStatus(status: OrderStatus): OrderStatus {
	return LEGACY_STATUS_ALIASES[status] ?? status;
}

/**
 * State transition rules — strict validation
 *
 * Defines the 19-state order lifecycle with ALL valid transitions:
 *
 * open → proposal_sent, planning, assigned, cancelled
 * proposal_sent → proposal_approved, cancelled
 * proposal_approved → planning, assigned, cancelled
 * planning → assigned, ready_for_execution, cancelled
 * assigned → ready_for_execution, in_progress, on_hold, cancelled
 * ready_for_execution → execution_in_progress, in_progress, on_hold, cancelled
 * execution_in_progress → execution_completed, report_pending, on_hold, cancelled
 * execution_completed → report_pending, completed, cancelled
 * in_progress → report_pending, completed, on_hold, cancelled
 * report_pending → completed, cancelled
 * on_hold → in_progress, cancelled
 * completed → ready_for_invoicing, acta_signed, closed, cancelled
 * ready_for_invoicing → acta_signed, closed, cancelled
 * acta_signed → ses_sent, closed, cancelled
 * ses_sent → invoice_approved, closed, cancelled
 * invoice_approved → paid, closed, cancelled
 * paid → closed
 * closed → (terminal state — no transitions)
 * cancelled → (terminal state — no transitions)
 */
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
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

/**
 * Role-based permission for state transitions
 *
 * Defines which roles can execute each transition.
 * More granular than route-level RBAC.
 */
const TRANSITION_PERMISSIONS: Record<string, readonly UserRole[]> = {
	"open→assigned": ["gerente", "residente", "supervisor"],
	"open→cancelled": ["gerente", "residente"],
	"open→proposal_sent": ["gerente", "residente"],
	"open→planning": ["gerente", "residente", "supervisor"],
	"proposal_sent→proposal_approved": ["gerente", "residente"],
	"proposal_sent→cancelled": ["gerente", "residente"],
	"proposal_approved→planning": ["gerente", "residente", "supervisor"],
	"proposal_approved→assigned": ["gerente", "residente", "supervisor"],
	"proposal_approved→cancelled": ["gerente", "residente"],
	"planning→assigned": ["gerente", "residente", "supervisor"],
	"planning→ready_for_execution": ["gerente", "residente", "supervisor"],
	"planning→cancelled": ["gerente", "residente"],
	"assigned→ready_for_execution": ["gerente", "residente", "supervisor"],
	"assigned→in_progress": ["gerente", "residente", "supervisor", "tecnico", "operador"],
	"assigned→on_hold": ["gerente", "residente", "supervisor"],
	"assigned→cancelled": ["gerente", "residente"],
	"ready_for_execution→execution_in_progress": [
		"gerente",
		"residente",
		"supervisor",
		"tecnico",
		"operador",
	],
	"ready_for_execution→in_progress": ["gerente", "residente", "supervisor", "tecnico", "operador"],
	"ready_for_execution→on_hold": ["gerente", "residente", "supervisor"],
	"ready_for_execution→cancelled": ["gerente", "residente"],
	"execution_in_progress→execution_completed": [
		"gerente",
		"residente",
		"supervisor",
		"tecnico",
		"operador",
	],
	"execution_in_progress→report_pending": [
		"gerente",
		"residente",
		"supervisor",
		"tecnico",
		"operador",
	],
	"execution_in_progress→on_hold": ["gerente", "residente", "supervisor"],
	"execution_in_progress→cancelled": ["gerente"],
	"execution_completed→report_pending": ["gerente", "residente", "supervisor"],
	"execution_completed→completed": ["gerente", "residente", "supervisor"],
	"execution_completed→cancelled": ["gerente"],
	"in_progress→report_pending": ["gerente", "residente", "supervisor", "tecnico", "operador"],
	"in_progress→completed": ["gerente", "residente", "supervisor", "tecnico", "operador"],
	"in_progress→on_hold": ["gerente", "residente", "supervisor"],
	"in_progress→cancelled": ["gerente"],
	"report_pending→completed": ["gerente", "residente", "supervisor"],
	"report_pending→cancelled": ["gerente"],
	"on_hold→in_progress": ["gerente", "residente", "supervisor"],
	"on_hold→cancelled": ["gerente"],
	"completed→ready_for_invoicing": ["gerente", "residente", "supervisor"],
	"completed→acta_signed": ["gerente", "residente", "supervisor"],
	"completed→closed": ["gerente", "residente", "supervisor"],
	"completed→cancelled": ["gerente"],
	"ready_for_invoicing→acta_signed": ["gerente", "residente", "supervisor"],
	"ready_for_invoicing→closed": ["gerente", "residente", "supervisor"],
	"ready_for_invoicing→cancelled": ["gerente"],
	"acta_signed→ses_sent": ["gerente", "residente", "supervisor"],
	"acta_signed→closed": ["gerente", "residente", "supervisor"],
	"acta_signed→cancelled": ["gerente"],
	"ses_sent→invoice_approved": ["gerente", "residente", "administrativo"],
	"ses_sent→closed": ["gerente", "residente", "administrativo"],
	"ses_sent→cancelled": ["gerente"],
	"invoice_approved→paid": ["gerente", "administrativo"],
	"invoice_approved→closed": ["gerente", "administrativo"],
	"invoice_approved→cancelled": ["gerente"],
	"paid→closed": ["gerente", "administrativo"],
};

/**
 * Validate state transition — throws if invalid
 *
 * @param currentStatus - Current order status
 * @param newStatus - Requested new status
 * @param actorRole - Role of the user requesting transition
 * @throws BadRequestError if transition invalid
 * @throws UnauthorizedError if role not permitted
 */
export function validateStateTransition(
	currentStatus: OrderStatus,
	newStatus: OrderStatus,
	actorRole: string,
): void {
	const normalizedCurrentStatus = normalizeOrderStatus(currentStatus);
	const normalizedNewStatus = normalizeOrderStatus(newStatus);

	if (typeof normalizedCurrentStatus !== "string" || typeof normalizedNewStatus !== "string") {
		throw new BadRequestError("Invalid order status format", "INVALID_STATUS_TRANSITION");
	}

	const from = normalizedCurrentStatus as OrderStatus;
	const to = normalizedNewStatus as OrderStatus;

	// Check if transition exists
	const validTransitions = VALID_TRANSITIONS[from];
	if (!validTransitions?.includes(to)) {
		throw new BadRequestError(
			`Invalid state transition: '${from}' → '${to}'`,
			"INVALID_STATUS_TRANSITION",
		);
	}

	// Check if role is permitted for this transition
	const transitionKey = `${from}→${to}`;
	const allowedRoles = TRANSITION_PERMISSIONS[transitionKey];
	if (!allowedRoles || !isAuthenticatedRole(actorRole) || !allowedRoles.includes(actorRole)) {
		throw new UnauthorizedError(`Role '${actorRole}' cannot perform transition '${transitionKey}'`);
	}
}

/**
 * Get valid transitions for a given status
 */
export function getValidTransitions(status: OrderStatus): OrderStatus[] {
	const normalizedStatus = normalizeOrderStatus(status);
	if (typeof normalizedStatus !== "string") {
		return [];
	}

	return VALID_TRANSITIONS[normalizedStatus as OrderStatus] || [];
}

/**
 * Check if a status is terminal (no further transitions)
 */
export function isTerminalStatus(status: OrderStatus): boolean {
	return getValidTransitions(status).length === 0;
}
