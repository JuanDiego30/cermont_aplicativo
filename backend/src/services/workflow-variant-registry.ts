/**
 * WorkflowVariantRegistry — Pluggable multi-variant workflow engine
 *
 * Extends the existing FSM engine with workflow variant support.
 * Each variant defines a complete FSM with states, transitions, roles,
 * and optional geofence requirements.
 */
import type { FsmDefinition } from "../common/fsm/fsm-engine";

export interface WorkflowVariant {
	id: string;
	label: string;
}

export interface GeofenceRequirement {
	type: "distance";
	radiusMeters: number;
	action: string;
	message: string;
}

export interface ExtendedFSMDefinition extends FsmDefinition {
	workflowId: string;
	variant: WorkflowVariant;
	geofenceRequirements?: GeofenceRequirement[];
}

export class WorkflowVariantRegistry {
	private definitions = new Map<string, ExtendedFSMDefinition>();

	register(def: ExtendedFSMDefinition): void {
		this.definitions.set(def.workflowId, def);
	}

	get(workflowId: string): ExtendedFSMDefinition | null {
		return this.definitions.get(workflowId) ?? null;
	}

	getByVariant(variantId: string): ExtendedFSMDefinition[] {
		return Array.from(this.definitions.values()).filter((d) => d.variant.id === variantId);
	}

	listVariants(): WorkflowVariant[] {
		return Array.from(
			new Map(Array.from(this.definitions.values()).map((d) => [d.variant.id, d.variant])).values(),
		);
	}

	getGeofenceRequirement(workflowId: string, action: string): GeofenceRequirement | null {
		const def = this.definitions.get(workflowId);
		if (!def?.geofenceRequirements) {
			return null;
		}
		return def.geofenceRequirements.find((g) => g.action === action) ?? null;
	}
}

export const workflowRegistry = new WorkflowVariantRegistry();
