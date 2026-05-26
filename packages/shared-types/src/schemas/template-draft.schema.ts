/**
 * Template Draft Schema — Human-reviewed proposal before publication
 *
 * Represents a proposed template generated from extracted layout data.
 * Must be reviewed and approved by an administrator before conversion
 * to a published DocumentTemplateVersion.
 *
 * Phase 1: Cross-cutting Document Ingestion Layer
 */

import { z } from "zod";
import { CermontOperationalStepCodeSchema } from "./cermont-operational-step.schema";
import { ObjectIdSchema } from "./common.schema";
import { DetectedFieldKindSchema, ValidationRuleSchema } from "./extracted-document-layout.schema";

// ─── Service Types ─────────────────────────────────────────────────────────────

export const ServiceTypeSchema = z.enum([
	"construction",
	"maintenance",
	"civil_works",
	"electricity",
	"refrigeration",
	"telecommunications",
	"assembly",
	"cctv",
	"lifeline",
	"sg_sst",
	"material_supply",
	"equipment_supply",
	"personnel_supply",
]);
export type ServiceType = z.infer<typeof ServiceTypeSchema>;

// ─── Stage ─────────────────────────────────────────────────────────────────────

export const WorkflowStageSchema = z.enum([
	"work_request",
	"site_visit",
	"proposal",
	"purchase_order",
	"planning",
	"execution",
	"technical_report",
	"delivery_record",
	"service_entry_sheet",
	"invoice",
	"payment",
	"asset",
	"maintenance",
]);
export type WorkflowStage = z.infer<typeof WorkflowStageSchema>;

// ─── Draft Status ──────────────────────────────────────────────────────────────

export const TemplateDraftStatusSchema = z.enum([
	"draft",
	"review_required",
	"approved",
	"rejected",
	"converted_to_template",
]);
export type TemplateDraftStatus = z.infer<typeof TemplateDraftStatusSchema>;

// ─── Draft Field ───────────────────────────────────────────────────────────────

export const TemplateDraftFieldSchema = z
	.object({
		fieldId: z.string().min(1),
		label: z.string().min(1).max(500),
		normalizedName: z.string().min(1).max(200),
		fieldKind: DetectedFieldKindSchema,
		required: z.boolean().default(false),
		order: z.number().int().min(0).default(0),
		confidence: z.number().min(0).max(1).optional(),
		options: z.array(z.string()).default([]),
		allowOtherOption: z.boolean().default(false),
		otherOptionLabel: z.string().max(200).optional(),
		validationRules: z.array(ValidationRuleSchema).default([]),
		helpText: z.string().max(1000).optional(),
		placeholder: z.string().max(500).optional(),
		defaultValue: z.string().max(1000).optional(),
		readOnly: z.boolean().default(false),
		visible: z.boolean().default(true),
		visibleWhen: z.record(z.string(), z.unknown()).optional(),
		requiredWhen: z.record(z.string(), z.unknown()).optional(),
		sourceReference: z.string().max(500).optional(),
	})
	.strict();

export type TemplateDraftField = z.infer<typeof TemplateDraftFieldSchema>;

// ─── Draft Table Column ────────────────────────────────────────────────────────

export const TemplateDraftTableColumnSchema = z
	.object({
		columnId: z.string().min(1),
		name: z.string().min(1).max(200),
		fieldKind: DetectedFieldKindSchema,
		required: z.boolean().default(false),
		options: z.array(z.string()).optional(),
		width: z.string().max(50).optional(),
	})
	.strict();

export type TemplateDraftTableColumn = z.infer<typeof TemplateDraftTableColumnSchema>;

// ─── Draft Table ─────────────────────────────────────────────────────────────────

export const TemplateDraftTableSchema = z
	.object({
		tableId: z.string().min(1),
		title: z.string().min(1).max(200),
		description: z.string().max(1000).optional(),
		columns: z.array(TemplateDraftTableColumnSchema).min(1),
		allowAddRows: z.boolean().default(true),
		allowDeleteRows: z.boolean().default(true),
		maxRows: z.number().int().min(1).optional(),
		sourceReference: z.string().max(500).optional(),
	})
	.strict();

export type TemplateDraftTable = z.infer<typeof TemplateDraftTableSchema>;

// ─── Draft Section ───────────────────────────────────────────────────────────────

export const TemplateDraftSectionSchema = z
	.object({
		sectionId: z.string().min(1),
		title: z.string().min(1).max(200),
		description: z.string().max(1000).optional(),
		order: z.number().int().min(0),
		fields: z.array(TemplateDraftFieldSchema).default([]),
		tables: z.array(TemplateDraftTableSchema).default([]),
		repeatable: z.boolean().default(false),
		required: z.boolean().default(false),
		sourceReference: z.string().max(500).optional(),
	})
	.strict();

export type TemplateDraftSection = z.infer<typeof TemplateDraftSectionSchema>;

// ─── Draft Rule ──────────────────────────────────────────────────────────────────

export const TemplateDraftRuleSchema = z
	.object({
		ruleId: z.string().min(1),
		name: z.string().min(1).max(200),
		description: z.string().max(1000).optional(),
		trigger: z.enum(["on_load", "on_change", "on_submit"]),
		condition: z.string().max(2000),
		action: z.enum(["show", "hide", "enable", "disable", "set_value", "require"]),
		targetFieldId: z.string().optional(),
		value: z.string().max(1000).optional(),
		priority: z.number().int().min(0).default(0),
		active: z.boolean().default(true),
	})
	.strict();

export type TemplateDraftRule = z.infer<typeof TemplateDraftRuleSchema>;

// ─── Export Hint ─────────────────────────────────────────────────────────────────

export const TemplateDraftExportHintSchema = z
	.object({
		format: z.enum(["pdf", "xlsx", "csv", "json", "html"]),
		orientation: z.enum(["portrait", "landscape"]).default("portrait"),
		pageSize: z.enum(["A4", "Letter", "Legal"]).default("A4"),
		showHeader: z.boolean().default(true),
		showFooter: z.boolean().default(true),
		showLogo: z.boolean().default(true),
		showPageNumbers: z.boolean().default(true),
	})
	.strict();

export type TemplateDraftExportHint = z.infer<typeof TemplateDraftExportHintSchema>;

// ─── Create ──────────────────────────────────────────────────────────────────────

export const CreateTemplateDraftSchema = z
	.object({
		documentSourceFileId: ObjectIdSchema,
		extractionJobId: ObjectIdSchema,
		name: z.string().min(1).max(200),
		description: z.string().max(2000).optional(),
		serviceTypes: z.array(ServiceTypeSchema).default([]),
		targetStages: z.array(WorkflowStageSchema).default([]),
		targetStepCode: CermontOperationalStepCodeSchema.optional(),
		sections: z.array(TemplateDraftSectionSchema).min(1),
		tables: z.array(TemplateDraftTableSchema).default([]),
		rules: z.array(TemplateDraftRuleSchema).default([]),
		exportHints: z.array(TemplateDraftExportHintSchema).default([]),
		confidence: z.number().min(0).max(1).optional(),
	})
	.strict();

export type CreateTemplateDraft = z.infer<typeof CreateTemplateDraftSchema>;

// ─── Update ──────────────────────────────────────────────────────────────────────

export const UpdateTemplateDraftSchema = z
	.object({
		name: z.string().min(1).max(200).optional(),
		description: z.string().max(2000).optional(),
		serviceTypes: z.array(ServiceTypeSchema).optional(),
		targetStages: z.array(WorkflowStageSchema).optional(),
		targetStepCode: CermontOperationalStepCodeSchema.optional(),
		sections: z.array(TemplateDraftSectionSchema).optional(),
		tables: z.array(TemplateDraftTableSchema).optional(),
		rules: z.array(TemplateDraftRuleSchema).optional(),
		exportHints: z.array(TemplateDraftExportHintSchema).optional(),
		confidence: z.number().min(0).max(1).optional(),
	})
	.strict();

export type UpdateTemplateDraft = z.infer<typeof UpdateTemplateDraftSchema>;

// ─── Approve ───────────────────────────────────────────────────────────────────────

export const ApproveTemplateDraftSchema = z
	.object({
		reviewerNotes: z.string().max(2000).optional(),
	})
	.strict();

export type ApproveTemplateDraft = z.infer<typeof ApproveTemplateDraftSchema>;

// ─── Reject ──────────────────────────────────────────────────────────────────────

export const RejectTemplateDraftSchema = z
	.object({
		rejectionReason: z.string().min(1).max(2000),
	})
	.strict();

export type RejectTemplateDraft = z.infer<typeof RejectTemplateDraftSchema>;

// ─── Full Record ─────────────────────────────────────────────────────────────────

export const TemplateDraftSchema = z
	.object({
		_id: ObjectIdSchema,
		documentSourceFileId: ObjectIdSchema,
		extractionJobId: ObjectIdSchema,
		name: z.string(),
		description: z.string().optional(),
		serviceTypes: z.array(ServiceTypeSchema),
		targetStages: z.array(WorkflowStageSchema),
		targetStepCode: CermontOperationalStepCodeSchema.optional(),
		sections: z.array(TemplateDraftSectionSchema),
		rules: z.array(TemplateDraftRuleSchema),
		exportHints: z.array(TemplateDraftExportHintSchema),
		confidence: z.number().min(0).max(1).optional(),
		status: TemplateDraftStatusSchema,
		reviewerId: ObjectIdSchema.optional(),
		reviewedAt: z.string().datetime().optional(),
		reviewerNotes: z.string().max(2000).optional(),
		rejectionReason: z.string().optional(),
		convertedTemplateVersionId: ObjectIdSchema.optional(),
		createdBy: ObjectIdSchema,
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type TemplateDraft = z.infer<typeof TemplateDraftSchema>;

// ─── ID Params ───────────────────────────────────────────────────────────────────

export const TemplateDraftIdSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export type TemplateDraftIdParams = z.infer<typeof TemplateDraftIdSchema>;

// ─── List Query ──────────────────────────────────────────────────────────────────

export const TemplateDraftListQuerySchema = z
	.object({
		status: z.union([TemplateDraftStatusSchema, z.literal("")]).optional(),
		serviceType: z.union([ServiceTypeSchema, z.literal("")]).optional(),
		targetStage: z.union([WorkflowStageSchema, z.literal("")]).optional(),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
	})
	.strict();

export type TemplateDraftListQuery = z.infer<typeof TemplateDraftListQuerySchema>;
