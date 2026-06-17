/**
 * Cermont 14-Step Workflow Definition
 *
 * The complete operational pipeline from work request to payment.
 */
import type { ExtendedFSMDefinition } from "../workflow-variant-registry";

export const cermont14StepWorkflow: ExtendedFSMDefinition = {
	workflowId: "service-case-14step",
	variant: { id: "cermont_14step", label: "Cermont 14-Step Pipeline" },
	entityType: "WorkOrder",
	states: [
		"work_request",
		"site_visit",
		"proposal",
		"purchase_order",
		"planning",
		"execution",
		"evidence",
		"technical_report",
		"delivery_record",
		"client_signature",
		"ses",
		"invoice",
		"invoice_approval",
		"payment",
		"archived",
		"cancelled",
	],
	transitions: [
		{ from: "work_request", to: ["site_visit", "proposal", "cancelled"] },
		{ from: "site_visit", to: ["proposal", "cancelled"] },
		{ from: "proposal", to: ["purchase_order", "cancelled"] },
		{ from: "purchase_order", to: ["planning", "cancelled"] },
		{ from: "planning", to: ["execution", "cancelled"] },
		{ from: "execution", to: ["evidence", "cancelled"] },
		{ from: "evidence", to: ["technical_report", "cancelled"] },
		{ from: "technical_report", to: ["delivery_record", "cancelled"] },
		{ from: "delivery_record", to: ["client_signature", "cancelled"] },
		{ from: "client_signature", to: ["ses", "cancelled"] },
		{ from: "ses", to: ["invoice", "cancelled"] },
		{ from: "invoice", to: ["invoice_approval", "cancelled"] },
		{ from: "invoice_approval", to: ["payment", "cancelled"] },
		{ from: "payment", to: ["archived"] },
		{ from: "archived", to: [] },
		{ from: "cancelled", to: [] },
	],
	terminalStates: ["payment", "archived", "cancelled"],
	description: "Cermont 14-step pipeline: work request to payment",
};
