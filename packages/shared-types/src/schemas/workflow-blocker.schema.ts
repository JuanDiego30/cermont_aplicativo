/**
 * WorkflowBlocker — Convenience aliases over DomainBlocker
 *
 * This file provides the field names described in the refactor plan
 * (docs/plans/refactor-cermont-14-pasos/01_PLAN_PACKAGES_CONTRATOS_DOMINIO.md)
 * without duplicating the existing DomainBlocker implementation.
 *
 * Both schemas are equivalent; prefer DomainBlocker for new code.
 * Use WorkflowBlocker only when the plan's API shape is required.
 */

import { z } from "zod";
import { CermontOperationalStepCodeSchema } from "./cermont-operational-step.schema";
import { DomainBlockerCodeSchema } from "./domain-blocker.schema";

export const WorkflowBlockerSeveritySchema = z.enum(["info", "warning", "blocking"]);
export type WorkflowBlockerSeverity = z.infer<typeof WorkflowBlockerSeveritySchema>;

export const WorkflowBlockerSchema = z.object({
	code: DomainBlockerCodeSchema,
	severity: WorkflowBlockerSeveritySchema,
	stepId: CermontOperationalStepCodeSchema.optional(),
	title: z.string().min(1),
	description: z.string().min(1),
	missingArtifactType: z.string().optional(),
	actionLabel: z.string().optional(),
	actionHref: z.string().optional(),
});
export type WorkflowBlocker = z.infer<typeof WorkflowBlockerSchema>;

/**
 * Converts a DomainBlocker to the WorkflowBlocker shape.
 * Use when the frontend expects the plan's API naming.
 */
export function domainBlockerToWorkflowBlocker(
	blocker: import("./domain-blocker.schema").DomainBlocker,
): WorkflowBlocker {
	return {
		code: blocker.code,
		severity: blocker.severity as WorkflowBlockerSeverity,
		stepId: blocker.stepCode,
		title: blocker.message,
		description: blocker.recommendedAction,
		missingArtifactType: blocker.artifactType,
		actionLabel: blocker.recommendedAction,
		actionHref: undefined,
	};
}
