/**
 * GMAO/CSM Maintenance Workflow Definition
 *
 * Computerized Maintenance Management workflow for
 * scheduled and corrective maintenance operations.
 */
import type { ExtendedFSMDefinition } from "../workflow-variant-registry";

export const gmaoMaintenanceWorkflow: ExtendedFSMDefinition = {
	workflowId: "gmao-maintenance",
	variant: { id: "gmao_csm", label: "GMAO/CSM Maintenance" },
	entityType: "WorkOrder",
	states: [
		"scheduled",
		"parts_ordered",
		"ready",
		"in_progress",
		"completed",
		"verified",
		"closed",
		"cancelled",
	],
	transitions: [
		{ from: "scheduled", to: ["parts_ordered", "ready", "cancelled"] },
		{ from: "parts_ordered", to: ["ready", "cancelled"] },
		{ from: "ready", to: ["in_progress", "cancelled"] },
		{ from: "in_progress", to: ["completed", "cancelled"] },
		{ from: "completed", to: ["verified", "cancelled"] },
		{ from: "verified", to: ["closed", "cancelled"] },
		{ from: "closed", to: [] },
		{ from: "cancelled", to: [] },
	],
	terminalStates: ["closed", "cancelled"],
	description: "GMAO/CSM Maintenance: scheduled to closed with parts and verification",
};
