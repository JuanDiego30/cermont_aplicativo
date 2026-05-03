/**
 * Work Order State Machine (FSM)
 *
 * Defines valid status transitions and business rules for work orders.
 * Shared between backend and frontend as Single Source of Truth.
 *
 * IMPORTANT: The authoritative validator is backend/src/orders/domain/rules.ts.
 * This file is a client-side read-only mirror — MUST be kept in sync.
 */

import { z } from "zod";
import type { OrderStatus } from "./order.schema";

export { ORDER_STATUS_LABELS_ES as STATUS_LABELS_ES } from "../constants/labels";

export type { OrderStatus } from "./order.schema";

export const ORDER_PIPELINE_STAGE_VALUES = [
	"request_received",
	"proposal_draft",
	"proposal_sent",
	"proposal_approved",
	"planning",
	"assigned",
	"in_progress",
	"report_pending",
	"report_generated",
	"acta_signed",
	"ses_pending",
	"ses_sent",
	"invoice_sent",
	"invoice_approved",
	"paid",
] as const;

export const OrderPipelineStageSchema = z.enum(ORDER_PIPELINE_STAGE_VALUES);
export type OrderPipelineStage = z.infer<typeof OrderPipelineStageSchema>;

export const ORDER_PIPELINE_TRANSITIONS: Record<OrderPipelineStage, OrderPipelineStage[]> = {
	request_received: ["proposal_draft", "planning"],
	proposal_draft: ["proposal_sent"],
	proposal_sent: ["proposal_approved", "proposal_draft"],
	proposal_approved: ["planning"],
	planning: ["assigned"],
	assigned: ["in_progress"],
	in_progress: ["report_pending"],
	report_pending: ["report_generated"],
	report_generated: ["acta_signed"],
	acta_signed: ["ses_pending"],
	ses_pending: ["ses_sent"],
	ses_sent: ["invoice_sent"],
	invoice_sent: ["invoice_approved"],
	invoice_approved: ["paid"],
	paid: [],
};

export function isValidPipelineTransition(
	from: OrderPipelineStage,
	to: OrderPipelineStage,
): boolean {
	return ORDER_PIPELINE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getAllowedPipelineTransitions(stage: OrderPipelineStage): OrderPipelineStage[] {
	return ORDER_PIPELINE_TRANSITIONS[stage] ?? [];
}

/**
 * Terminal states — no further transitions allowed
 */
export const TERMINAL_STATES: OrderStatus[] = ["closed", "cancelled"];

/**
 * Active states — order is currently being worked on
 */
export const ACTIVE_STATES: OrderStatus[] = ["in_progress", "on_hold", "planning", "assigned"];

/**
 * Editable states — order details can be modified
 */
export const EDITABLE_STATES: OrderStatus[] = [
	"open",
	"proposal_sent",
	"proposal_approved",
	"planning",
	"assigned",
];

/**
 * Valid state transitions — mirrors backend/src/orders/domain/rules.ts
 *
 * Pipeline sequence:
 * open -> proposal_sent -> proposal_approved -> planning -> assigned -> in_progress
 * -> report_pending -> completed -> ready_for_invoicing -> acta_signed
 * -> ses_sent -> invoice_approved -> paid -> closed
 */
export const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
	open: ["proposal_sent", "planning", "assigned", "cancelled"],
	proposal_sent: ["proposal_approved", "cancelled"],
	proposal_approved: ["planning", "assigned", "cancelled"],
	planning: ["assigned", "cancelled"],
	assigned: ["in_progress", "on_hold", "cancelled"],
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

export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
	return TRANSITIONS[from]?.includes(to) ?? false;
}

export function getAllowedTransitions(status: OrderStatus): OrderStatus[] {
	return TRANSITIONS[status] ?? [];
}

export function getTransitionRules(): Record<OrderStatus, OrderStatus[]> {
	return { ...TRANSITIONS };
}
