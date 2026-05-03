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

import type { OrderStatus } from "@cermont/shared-types";
import { normalizeUserRole, type UserRole } from "@cermont/shared-types/rbac";
import { BadRequestError, UnauthorizedError } from "../../_shared/common/errors";

// Re-export for backward compatibility with other backend modules
export type { OrderPriority, OrderStatus, OrderType } from "@cermont/shared-types";

/**
 * State transition rules — strict validation
 *
 * Pipeline sequence:
 * open -> proposal_sent -> proposal_approved -> planning -> assigned -> in_progress
 * -> report_pending -> completed -> ready_for_invoicing -> acta_signed
 * -> ses_sent -> invoice_approved -> paid -> closed
 */
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
	open: ["assigned", "cancelled"],
	proposal_sent: ["proposal_approved", "cancelled"],
	proposal_approved: ["planning", "cancelled"],
	planning: ["assigned", "cancelled"],
	assigned: ["in_progress", "on_hold", "cancelled"],
	in_progress: ["completed", "on_hold", "cancelled"],
	on_hold: ["in_progress", "cancelled"],
	report_pending: ["completed", "cancelled"],
	completed: ["ready_for_invoicing", "closed", "cancelled"],
	ready_for_invoicing: ["acta_signed", "closed", "cancelled"],
	acta_signed: ["ses_sent", "cancelled"],
	ses_sent: ["invoice_approved", "cancelled"],
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
	"open->proposal_sent": ["manager", "resident_engineer", "administrator"],
	"open->planning": ["manager", "resident_engineer", "supervisor", "administrator"],
	"open->assigned": ["manager", "resident_engineer", "supervisor", "administrator"],
	"open->cancelled": ["manager", "resident_engineer", "administrator"],

	"proposal_sent->proposal_approved": ["manager", "resident_engineer", "administrator"],
	"proposal_sent->cancelled": ["manager", "resident_engineer", "administrator"],

	"proposal_approved->planning": ["manager", "resident_engineer", "supervisor", "administrator"],
	"proposal_approved->assigned": ["manager", "resident_engineer", "supervisor", "administrator"],
	"proposal_approved->cancelled": ["manager", "resident_engineer", "administrator"],

	"planning->assigned": ["manager", "resident_engineer", "supervisor", "administrator"],
	"planning->cancelled": ["manager", "resident_engineer", "administrator"],

	"assigned->in_progress": [
		"manager",
		"resident_engineer",
		"supervisor",
		"technician",
		"operator",
		"administrator",
	],
	"assigned->on_hold": ["manager", "resident_engineer", "supervisor", "administrator"],
	"assigned->cancelled": ["manager", "resident_engineer", "administrator"],

	"in_progress->report_pending": [
		"manager",
		"resident_engineer",
		"supervisor",
		"technician",
		"operator",
		"administrator",
	],
	"in_progress->completed": [
		"manager",
		"resident_engineer",
		"supervisor",
		"technician",
		"operator",
		"administrator",
	],
	"in_progress->on_hold": ["manager", "resident_engineer", "supervisor", "administrator"],
	"in_progress->cancelled": ["manager", "administrator"],

	"report_pending->completed": [
		"manager",
		"resident_engineer",
		"supervisor",
		"technician",
		"operator",
		"administrator",
	],
	"report_pending->cancelled": ["manager", "administrator"],

	"on_hold->in_progress": ["manager", "resident_engineer", "supervisor", "administrator"],
	"on_hold->cancelled": ["manager", "administrator"],

	"completed->ready_for_invoicing": ["manager", "resident_engineer", "supervisor", "administrator"],
	"completed->acta_signed": ["manager", "resident_engineer", "supervisor", "administrator"],
	"completed->closed": ["manager", "resident_engineer", "supervisor", "administrator"],
	"completed->cancelled": ["manager", "administrator"],

	"ready_for_invoicing->acta_signed": [
		"manager",
		"resident_engineer",
		"supervisor",
		"administrator",
	],
	"ready_for_invoicing->closed": ["manager", "resident_engineer", "supervisor", "administrator"],
	"ready_for_invoicing->cancelled": ["manager", "administrator"],

	"acta_signed->ses_sent": ["manager", "resident_engineer", "administrator"],
	"acta_signed->closed": ["manager", "resident_engineer", "administrator"],
	"acta_signed->cancelled": ["manager", "administrator"],

	"ses_sent->invoice_approved": ["manager", "resident_engineer", "administrator"],
	"ses_sent->closed": ["manager", "resident_engineer", "administrator"],
	"ses_sent->cancelled": ["manager", "administrator"],

	"invoice_approved->paid": ["manager", "resident_engineer", "administrator"],
	"invoice_approved->closed": ["manager", "resident_engineer", "administrator"],
	"invoice_approved->cancelled": ["manager", "administrator"],

	"paid->closed": ["manager", "resident_engineer", "administrator"],
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
	// Check if transition exists
	const validTransitions = VALID_TRANSITIONS[currentStatus];
	if (!validTransitions?.includes(newStatus)) {
		throw new BadRequestError(
			`Invalid state transition: '${currentStatus}' -> '${newStatus}'`,
			"INVALID_STATUS_TRANSITION",
		);
	}

	// Check if role is permitted for this transition
	const transitionKey = `${currentStatus}->${newStatus}`;
	const allowedRoles = TRANSITION_PERMISSIONS[transitionKey];
	const normalizedRole = normalizeUserRole(actorRole);

	if (!allowedRoles || !normalizedRole || !allowedRoles.includes(normalizedRole)) {
		throw new UnauthorizedError(`Role '${actorRole}' cannot perform transition '${transitionKey}'`);
	}
}

/**
 * Get valid transitions for a given status
 */
export function getValidTransitions(status: OrderStatus): OrderStatus[] {
	return VALID_TRANSITIONS[status] || [];
}

/**
 * Check if a status is terminal (no further transitions)
 */
export function isTerminalStatus(status: OrderStatus): boolean {
	return getValidTransitions(status).length === 0;
}
