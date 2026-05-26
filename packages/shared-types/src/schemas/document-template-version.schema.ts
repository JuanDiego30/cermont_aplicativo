/**
 * Document Template Version Schema — Zod validation for versioned document templates
 *
 * Phase 2: Versioned Templates SSOT
 * Maps to backend model: backend/src/document-template-versions/infrastructure/model.ts
 *
 * Key principles:
 * - A published template version cannot be edited directly
 * - Each change creates a new version
 * - Old responses preserve their original version
 * - No historical data is deleted
 * - Deprecation replaces deletion
 */

import { z } from "zod";
import { CermontOperationalStepCodeSchema } from "./cermont-operational-step.schema";
import { ObjectIdSchema } from "./common.schema";

// ─── Field Types ───────────────────────────────────────────────────────────────

export const TemplateFieldTypeEnum = z.enum([
	"text",
	"textarea",
	"number",
	"currency",
	"date",
	"datetime",
	"boolean",
	"select",
	"multi_select",
	"checkbox",
	"radio",
	"photo",
	"signature",
	"gps",
	"file",
	"table",
	"checklist",
	"calculated",
	"section",
	"repeatable_group",
	"evidence_block",
]);
export type TemplateFieldType = z.infer<typeof TemplateFieldTypeEnum>;

// ─── Version Status ────────────────────────────────────────────────────────────

export const DocumentTemplateVersionStatusEnum = z.enum([
	"draft",
	"review_required",
	"approved",
	"published",
	"deprecated",
	"archived",
]);
export type DocumentTemplateVersionStatus = z.infer<typeof DocumentTemplateVersionStatusEnum>;

// ─── Field Definition ─────────────────────────────────────────────────────────

export const TemplateFieldSchema = z
	.object({
		fieldId: z.string().min(1), // stable identifier within the version
		name: z.string().min(1).max(200),
		type: TemplateFieldTypeEnum,
		label: z.string().min(1).max(500),
		description: z.string().max(2000).optional(),
		placeholder: z.string().max(500).optional(),
		defaultValue: z.string().max(1000).optional(),
		required: z.boolean().default(false),
		readOnly: z.boolean().default(false),
		visible: z.boolean().default(true),
		options: z.array(z.string()).optional(), // for select, multi_select, radio
		allowOtherOption: z.boolean().default(false),
		otherOptionLabel: z.string().max(200).optional(),
		visibleWhen: z.record(z.string(), z.unknown()).optional(),
		requiredWhen: z.record(z.string(), z.unknown()).optional(),
		helpText: z.string().max(1000).optional(),
		order: z.number().int().min(0).optional(),
		validation: z
			.object({
				min: z.number().optional(),
				max: z.number().optional(),
				pattern: z.string().max(200).optional(),
				minLength: z.number().optional(),
				maxLength: z.number().optional(),
			})
			.optional(),
		metadata: z.record(z.string(), z.unknown()).optional(),
	})
	.strict();

export type TemplateField = z.infer<typeof TemplateFieldSchema>;

// ─── Section Definition ────────────────────────────────────────────────────────

export const TemplateSectionSchema = z
	.object({
		sectionId: z.string().min(1),
		name: z.string().min(1).max(200),
		description: z.string().max(1000).optional(),
		order: z.number().int().min(0),
		fields: z.array(TemplateFieldSchema),
		repeatable: z.boolean().default(false),
		collapsible: z.boolean().default(false),
		metadata: z.record(z.string(), z.unknown()).optional(),
	})
	.strict();

export type TemplateSection = z.infer<typeof TemplateSectionSchema>;

// ─── Table Definition ──────────────────────────────────────────────────────────

export const TemplateTableSchema = z
	.object({
		tableId: z.string().min(1),
		name: z.string().min(1).max(200),
		description: z.string().max(1000).optional(),
		columns: z
			.array(
				z.object({
					columnId: z.string().min(1),
					name: z.string().min(1).max(200),
					type: TemplateFieldTypeEnum,
					required: z.boolean().default(false),
					width: z.string().max(50).optional(),
				}),
			)
			.min(1),
		allowAddRows: z.boolean().default(true),
		allowDeleteRows: z.boolean().default(true),
		maxRows: z.number().int().min(1).optional(),
		metadata: z.record(z.string(), z.unknown()).optional(),
	})
	.strict();

export type TemplateTable = z.infer<typeof TemplateTableSchema>;

// ─── Rule Definition ───────────────────────────────────────────────────────────

export const TemplateRuleSchema = z
	.object({
		ruleId: z.string().min(1),
		name: z.string().min(1).max(200),
		description: z.string().max(1000).optional(),
		trigger: z.enum(["on_load", "on_change", "on_submit"]),
		condition: z.string().max(2000), // JSON logic or expression
		action: z.enum(["show", "hide", "enable", "disable", "set_value", "require"]),
		targetFieldId: z.string().optional(), // field or section to act upon
		value: z.string().max(1000).optional(),
		priority: z.number().int().min(0).default(0),
		active: z.boolean().default(true),
	})
	.strict();

export type TemplateRule = z.infer<typeof TemplateRuleSchema>;

// ─── Permission Definition ────────────────────────────────────────────────────

export const TemplatePermissionSchema = z
	.object({
		role: z.enum([
			"gerente",
			"residente",
			"hes",
			"supervisor",
			"operador",
			"tecnico",
			"administrativo",
			"cliente",
		]),
		canView: z.boolean().default(true),
		canCreate: z.boolean().default(false),
		canUpdate: z.boolean().default(false),
		canDelete: z.boolean().default(false),
		canApprove: z.boolean().default(false),
		restrictedFields: z.array(z.string()).optional(), // fieldIds
	})
	.strict();

export type TemplatePermission = z.infer<typeof TemplatePermissionSchema>;

// ─── Export Layout Definition ─────────────────────────────────────────────────

export const TemplateExportLayoutSchema = z
	.object({
		format: z.enum(["pdf", "xlsx", "csv", "json", "html"]),
		orientation: z.enum(["portrait", "landscape"]).default("portrait"),
		pageSize: z.enum(["A4", "Letter", "Legal"]).default("A4"),
		showHeader: z.boolean().default(true),
		showFooter: z.boolean().default(true),
		showLogo: z.boolean().default(true),
		logoUrl: z.string().max(500).optional(),
		showPageNumbers: z.boolean().default(true),
		showWatermark: z.boolean().default(false),
		watermarkText: z.string().max(200).optional(),
		includeSections: z.array(z.string()).optional(), // sectionIds to include
		excludeSections: z.array(z.string()).optional(),
		customCss: z.string().max(5000).optional(),
		metadata: z.record(z.string(), z.unknown()).optional(),
	})
	.strict();

export type TemplateExportLayout = z.infer<typeof TemplateExportLayoutSchema>;

// ─── Document Template Version ────────────────────────────────────────────────

export const DocumentTemplateVersionSchema = z
	.object({
		_id: z.string().optional(), // present when from DB
		documentTemplateId: z.string().min(1), // parent template
		versionNumber: z.number().int().min(1),
		status: DocumentTemplateVersionStatusEnum.default("draft"),
		sections: z.array(TemplateSectionSchema),
		tables: z.array(TemplateTableSchema).optional().default([]),
		rules: z.array(TemplateRuleSchema).optional().default([]),
		permissions: z.array(TemplatePermissionSchema).optional().default([]),
		exportLayout: TemplateExportLayoutSchema.optional(),
		targetStepCode: CermontOperationalStepCodeSchema.optional(),
		sourceFileId: z.string().optional(), // original uploaded file
		sourceFileHash: z.string().optional(), // hash for integrity
		confidenceScore: z.number().min(0).max(1).optional(),
		importNotes: z.string().max(5000).optional(),
		publishedAt: z.string().datetime().optional(),
		publishedBy: z.string().optional(),
		deprecatedAt: z.string().datetime().optional(),
		deprecatedBy: z.string().optional(),
		deprecationReason: z.string().max(1000).optional(),
		createdAt: z.string().datetime().optional(),
		updatedAt: z.string().datetime().optional(),
		createdBy: z.string().optional(),
		updatedBy: z.string().optional(),
	})
	.strict();

export type DocumentTemplateVersion = z.infer<typeof DocumentTemplateVersionSchema>;

// ─── Create Version ─────────────────────────────────────────────────────────────

export const CreateDocumentTemplateVersionSchema = z
	.object({
		documentTemplateId: z.string().min(1),
		sections: z.array(TemplateSectionSchema).min(1),
		tables: z.array(TemplateTableSchema).optional().default([]),
		rules: z.array(TemplateRuleSchema).optional().default([]),
		permissions: z.array(TemplatePermissionSchema).optional().default([]),
		exportLayout: TemplateExportLayoutSchema.optional(),
		targetStepCode: CermontOperationalStepCodeSchema.optional(),
		sourceFileId: z.string().optional(),
		sourceFileHash: z.string().optional(),
		importNotes: z.string().max(5000).optional(),
	})
	.strict();

export type CreateDocumentTemplateVersion = z.infer<typeof CreateDocumentTemplateVersionSchema>;

// ─── Update Version (Draft Only) ───────────────────────────────────────────────

export const UpdateDocumentTemplateVersionSchema = z
	.object({
		sections: z.array(TemplateSectionSchema).optional(),
		tables: z.array(TemplateTableSchema).optional(),
		rules: z.array(TemplateRuleSchema).optional(),
		permissions: z.array(TemplatePermissionSchema).optional(),
		exportLayout: TemplateExportLayoutSchema.optional(),
		targetStepCode: CermontOperationalStepCodeSchema.optional(),
		importNotes: z.string().max(5000).optional(),
	})
	.strict();

export type UpdateDocumentTemplateVersion = z.infer<typeof UpdateDocumentTemplateVersionSchema>;

// ─── Publish Version ──────────────────────────────────────────────────────────

export const PublishDocumentTemplateVersionSchema = z.object({}).strict();
export type PublishDocumentTemplateVersion = z.infer<typeof PublishDocumentTemplateVersionSchema>;

// ─── Deprecate Version ─────────────────────────────────────────────────────────

export const DeprecateDocumentTemplateVersionSchema = z
	.object({
		reason: z.string().min(1).max(1000),
	})
	.strict();

export type DeprecateDocumentTemplateVersion = z.infer<
	typeof DeprecateDocumentTemplateVersionSchema
>;

// ─── Clone Version ────────────────────────────────────────────────────────────

export const CloneDocumentTemplateVersionSchema = z.object({}).strict();
export type CloneDocumentTemplateVersion = z.infer<typeof CloneDocumentTemplateVersionSchema>;

// ─── Query Params ─────────────────────────────────────────────────────────────

export const DocumentTemplateVersionIdSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export type DocumentTemplateVersionIdParams = z.infer<typeof DocumentTemplateVersionIdSchema>;

export const DocumentTemplateVersionListQuerySchema = z
	.object({
		documentTemplateId: z.string().optional(),
		status: DocumentTemplateVersionStatusEnum.optional(),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(50),
	})
	.strict();

export type DocumentTemplateVersionListQuery = z.infer<
	typeof DocumentTemplateVersionListQuerySchema
>;

// ─── Document Template with Versions ─────────────────────────────────────────

export const DocumentTemplateWithVersionsSchema = z.object({
	documentTemplate: z.record(z.string(), z.unknown()),
	versions: z.array(DocumentTemplateVersionSchema),
	publishedVersion: DocumentTemplateVersionSchema.optional(),
	latestVersion: DocumentTemplateVersionSchema.optional(),
});

export type DocumentTemplateWithVersions = z.infer<typeof DocumentTemplateWithVersionsSchema>;
