/**
 * Template Stage Requirement Schema — Connect templates to workflow stages
 *
 * Defines which template versions are required at each stage of the
 * operational pipeline. Enables dynamic blocker detection and
 * stage-gated document collection.
 *
 * Phase 1: Cross-cutting Document Ingestion Layer
 */

import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";
import { ServiceTypeSchema, WorkflowStageSchema } from "./template-draft.schema";

// ─── Create ──────────────────────────────────────────────────────────────────────

export const CreateTemplateStageRequirementSchema = z
	.object({
		serviceType: ServiceTypeSchema,
		stage: WorkflowStageSchema,
		templateVersionId: ObjectIdSchema,
		required: z.boolean().default(true),
		blocksTransition: z.boolean().default(false),
		allowedRoles: z
			.array(
				z.enum([
					"manager",
					"resident_engineer",
					"hse_coordinator",
					"supervisor",
					"operator",
					"technician",
					"administrator",
					"client",
				]),
			)
			.default([]),
		offlineRequired: z.boolean().default(false),
		evidenceRequired: z.boolean().default(false),
		signatureRequired: z.boolean().default(false),
		gpsRequired: z.boolean().default(false),
		order: z.number().int().min(0).default(0),
	})
	.strict();

export type CreateTemplateStageRequirement = z.infer<typeof CreateTemplateStageRequirementSchema>;

// ─── Update ──────────────────────────────────────────────────────────────────────

export const UpdateTemplateStageRequirementSchema = z
	.object({
		serviceType: ServiceTypeSchema.optional(),
		stage: WorkflowStageSchema.optional(),
		templateVersionId: ObjectIdSchema.optional(),
		required: z.boolean().optional(),
		blocksTransition: z.boolean().optional(),
		allowedRoles: z
			.array(
				z.enum([
					"manager",
					"resident_engineer",
					"hse_coordinator",
					"supervisor",
					"operator",
					"technician",
					"administrator",
					"client",
				]),
			)
			.optional(),
		offlineRequired: z.boolean().optional(),
		evidenceRequired: z.boolean().optional(),
		signatureRequired: z.boolean().optional(),
		gpsRequired: z.boolean().optional(),
		order: z.number().int().min(0).optional(),
	})
	.strict();

export type UpdateTemplateStageRequirement = z.infer<typeof UpdateTemplateStageRequirementSchema>;

// ─── Full Record ─────────────────────────────────────────────────────────────────

export const TemplateStageRequirementSchema = z
	.object({
		_id: ObjectIdSchema,
		serviceType: ServiceTypeSchema,
		stage: WorkflowStageSchema,
		templateVersionId: ObjectIdSchema,
		required: z.boolean(),
		blocksTransition: z.boolean(),
		allowedRoles: z.array(
			z.enum([
				"manager",
				"resident_engineer",
				"hse_coordinator",
				"supervisor",
				"operator",
				"technician",
				"administrator",
				"client",
			]),
		),
		offlineRequired: z.boolean(),
		evidenceRequired: z.boolean(),
		signatureRequired: z.boolean(),
		gpsRequired: z.boolean(),
		order: z.number().int().min(0),
		createdBy: ObjectIdSchema,
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type TemplateStageRequirement = z.infer<typeof TemplateStageRequirementSchema>;

// ─── ID Params ───────────────────────────────────────────────────────────────────

export const TemplateStageRequirementIdSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export type TemplateStageRequirementIdParams = z.infer<typeof TemplateStageRequirementIdSchema>;

// ─── List Query ──────────────────────────────────────────────────────────────────

export const TemplateStageRequirementListQuerySchema = z
	.object({
		serviceType: z.union([ServiceTypeSchema, z.literal("")]).optional(),
		stage: z.union([WorkflowStageSchema, z.literal("")]).optional(),
		templateVersionId: ObjectIdSchema.optional(),
		required: z.boolean().optional(),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(50),
	})
	.strict();

export type TemplateStageRequirementListQuery = z.infer<
	typeof TemplateStageRequirementListQuerySchema
>;

// ─── Entity Requirement Check ────────────────────────────────────────────────────

export const EntityTemplateRequirementCheckSchema = z
	.object({
		entityType: z.enum([
			"service_case",
			"work_order",
			"planning_packet",
			"execution_session",
			"technical_report",
			"delivery_record",
			"service_entry_sheet",
			"invoice",
		]),
		entityId: ObjectIdSchema,
		serviceType: ServiceTypeSchema,
	})
	.strict();

export type EntityTemplateRequirementCheck = z.infer<typeof EntityTemplateRequirementCheckSchema>;

export const EntityTemplateRequirementResultSchema = z
	.object({
		entityType: z.string(),
		entityId: z.string(),
		requirements: z.array(
			z.object({
				requirementId: z.string(),
				templateVersionId: z.string(),
				templateName: z.string(),
				stage: z.string(),
				required: z.boolean(),
				blocksTransition: z.boolean(),
				isFulfilled: z.boolean(),
				responseId: z.string().optional(),
				responseStatus: z.string().optional(),
			}),
		),
		blockers: z.array(
			z.object({
				code: z.string(),
				message: z.string(),
				requirementId: z.string(),
			}),
		),
		canProceed: z.boolean(),
	})
	.strict();

export type EntityTemplateRequirementResult = z.infer<typeof EntityTemplateRequirementResultSchema>;
