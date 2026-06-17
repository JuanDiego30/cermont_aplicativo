/**
 * FSSM Standard Workflow Definition
 *
 * Field Service Management workflow with geofence requirements
 * for technician location validation.
 */
import type { ExtendedFSMDefinition } from "../workflow-variant-registry";

export const fssmStandardWorkflow: ExtendedFSMDefinition = {
	workflowId: "fssm-standard",
	variant: { id: "fssm", label: "FSSM Standard" },
	entityType: "WorkOrder",
	states: [
		"dispatch",
		"en_route",
		"on_site",
		"in_progress",
		"completed",
		"invoiced",
		"paid",
		"cancelled",
	],
	transitions: [
		{ from: "dispatch", to: ["en_route", "cancelled"] },
		{ from: "en_route", to: ["on_site", "cancelled"] },
		{ from: "on_site", to: ["in_progress", "cancelled"] },
		{ from: "in_progress", to: ["completed", "cancelled"] },
		{ from: "completed", to: ["invoiced", "cancelled"] },
		{ from: "invoiced", to: ["paid", "cancelled"] },
		{ from: "paid", to: [] },
		{ from: "cancelled", to: [] },
	],
	terminalStates: ["paid", "cancelled"],
	geofenceRequirements: [
		{
			type: "distance",
			radiusMeters: 100,
			action: "arrive_on_site",
			message: "Technician must be within 100m of job site to mark arrival",
		},
		{
			type: "distance",
			radiusMeters: 50,
			action: "start_work",
			message: "Technician must be within 50m of job site to start work",
		},
	],
	description: "FSSM Standard: dispatch to payment with geofence validation",
};
