/**
 * Kit Schema — Zod validation for Professional Kit Templates
 *
 * Full-featured kit system with categorized items, PDF attachments, checklists,
 * documents, readiness rules, and versioned lifecycle (draft → active → archived → voided).
 * SSOT for all kit-related contracts.
 *
 * Maps to backend model: backend/src/models/Kit.ts
 */

import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

// ─── Enums ─────────────────────────────────────────────────────────────────

export const KitItemCategoryEnum = z.enum([
	"tool",
	"electrical_tool",
	"construction_equipment",
	"height_safety",
	"material",
	"epp",
	"instrument",
	"vehicle",
	"document",
	"checklist",
]);
export type KitItemCategory = z.infer<typeof KitItemCategoryEnum>;

export const KitStatusEnum = z.enum(["draft", "active", "archived", "voided"]);
export type KitStatus = z.infer<typeof KitStatusEnum>;

export const KitRiskLevelEnum = z.enum(["low", "medium", "high", "critical"]);
export type KitRiskLevel = z.infer<typeof KitRiskLevelEnum>;

export const KitAttachmentPurposeEnum = z.enum([
	"tool_list_pdf",
	"manual",
	"procedure",
	"safety_instruction",
	"checklist_template",
	"photo_reference",
	"other",
]);
export type KitAttachmentPurpose = z.infer<typeof KitAttachmentPurposeEnum>;

export const KitActivityTypeEnum = z.enum([
	"electrico",
	"mecanico",
	"civil",
	"instrumentacion",
	"telecomunicaciones",
	"hse",
	"general",
]);
export type KitActivityType = z.infer<typeof KitActivityTypeEnum>;

export const KitServiceCategoryEnum = z.enum([
	"mantenimiento",
	"instalacion",
	"inspeccion",
	"reparacion",
	"construccion",
	"montaje",
	"limpieza",
	"otro",
]);
export type KitServiceCategory = z.infer<typeof KitServiceCategoryEnum>;

export const KitBusinessUnitEnum = z.enum([
	"industrial",
	"comercial",
	"residencial",
	"mineria",
	"energia",
	"hidrocarburos",
	"general",
]);
export type KitBusinessUnit = z.infer<typeof KitBusinessUnitEnum>;

// ─── Sub-Entities ──────────────────────────────────────────────────────────

export const KitItemSchema = z.object({
	id: z.string().optional(),
	category: KitItemCategoryEnum,
	name: z.string().min(1, "Item name is required").max(200),
	description: z.string().max(500).optional(),
	quantity: z.number().int().min(1, "Quantity must be at least 1"),
	unit: z.string().min(1, "Unit is required").max(50),
	isCritical: z.boolean().default(false),
	isOptional: z.boolean().default(false),
	requiresCertification: z.boolean().default(false),
	certificationType: z.string().max(100).optional(),
	calibrationRequired: z.boolean().default(false),
	calibrationValidityDays: z.number().int().positive().optional(),
	estimatedUnitCost: z.number().nonnegative().optional(),
	inventoryItemId: z.string().optional(),
	assetId: z.string().optional(),
	notes: z.string().max(1000).optional(),
});
export type KitItem = z.infer<typeof KitItemSchema>;

export const KitAttachmentSchema = z.object({
	id: z.string().optional(),
	fileName: z.string().min(1).max(255),
	originalName: z.string().min(1).max(255),
	mimeType: z.string().min(1).max(127),
	fileSize: z.number().int().nonnegative(),
	url: z.string().min(1),
	purpose: KitAttachmentPurposeEnum,
	uploadedBy: z.string().optional(),
	uploadedAt: z.string().datetime().optional(),
});
export type KitAttachment = z.infer<typeof KitAttachmentSchema>;

export const KitChecklistRequirementSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1).max(200),
	description: z.string().max(1000).optional(),
	isRequired: z.boolean().default(true),
	stage: z.enum(["planning", "execution", "closure"]).default("execution"),
	checklistTemplateId: z.string().optional(),
});
export type KitChecklistRequirement = z.infer<typeof KitChecklistRequirementSchema>;

export const KitDocumentRequirementSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1).max(200),
	description: z.string().max(1000).optional(),
	isRequired: z.boolean().default(true),
	documentType: z.string().max(100).optional(),
});
export type KitDocumentRequirement = z.infer<typeof KitDocumentRequirementSchema>;

export const KitReadinessRuleSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1).max(200),
	condition: z.string().max(2000),
	message: z.string().max(500),
	severity: z.enum(["warning", "blocker"]).default("warning"),
	active: z.boolean().default(true),
});
export type KitReadinessRule = z.infer<typeof KitReadinessRuleSchema>;

export const KitUsageRecordSchema = z.object({
	planningId: z.string(),
	appliedAt: z.string().datetime(),
	appliedBy: z.string(),
	readinessScore: z.number().min(0).max(100).optional(),
	readinessStatus: z
		.enum(["ready", "missing_non_critical", "missing_critical", "blocked"])
		.optional(),
});
export type KitUsageRecord = z.infer<typeof KitUsageRecordSchema>;

// ─── Spec-015: Safety requirements & enriched items ────────────────────────

export const KitSafetyRequirementsSchema = z.object({
	eppList: z.array(z.string().max(200)).default([]),
	requiresAST: z.boolean().default(false),
	requiresPTW: z.boolean().default(false),
	ptwTypes: z.array(z.string().max(100)).default([]),
	heightsWorkLevel: z.enum(["none", "basic", "advanced", "rescue"]).default("none"),
	riskAssessmentRequired: z.boolean().default(false),
	minimumTechnicianCertifications: z.array(z.string().max(200)).default([]),
	medevacRequired: z.boolean().default(false),
});
export type KitSafetyRequirements = z.infer<typeof KitSafetyRequirementsSchema>;

export const KitItemEnrichedSchema = KitItemSchema.extend({
	isBillable: z.boolean().optional(),
	unitCostCOP: z.number().min(0).optional(),
	catalogItemId: z.string().optional(),
});
export type KitItemEnriched = z.infer<typeof KitItemEnrichedSchema>;

// ─── Main Kit Template ─────────────────────────────────────────────────────

export const KitTemplateSchema = z.object({
	_id: z.string(),
	code: z.string().optional(),
	name: z.string().min(1).max(200),
	description: z.string().max(2000).optional(),
	activityType: KitActivityTypeEnum,
	serviceCategory: KitServiceCategoryEnum.optional(),
	businessUnit: KitBusinessUnitEnum.optional(),
	status: KitStatusEnum.default("draft"),
	version: z.number().int().min(1).default(1),
	isDefault: z.boolean().default(false),
	tags: z.array(z.string().max(50)).default([]),
	estimatedDurationHours: z.number().nonnegative().optional(),
	riskLevel: KitRiskLevelEnum.default("low"),
	safetyRequirements: KitSafetyRequirementsSchema.optional(),

	// Categorized items
	tools: z.array(KitItemSchema).default([]),
	electricalTools: z.array(KitItemSchema).default([]),
	constructionEquipment: z.array(KitItemSchema).default([]),
	heightSafetyKit: z.array(KitItemSchema).default([]),
	materials: z.array(KitItemSchema).default([]),
	epp: z.array(KitItemSchema).default([]),
	instruments: z.array(KitItemSchema).default([]),
	vehicles: z.array(KitItemSchema).default([]),

	// Documents & attachments
	documents: z.array(KitDocumentRequirementSchema).default([]),
	attachments: z.array(KitAttachmentSchema).default([]),

	// Checklists & readiness
	checklists: z.array(KitChecklistRequirementSchema).default([]),
	readinessRules: z.array(KitReadinessRuleSchema).default([]),

	// Certifications & permits
	requiredCertifications: z.array(z.string()).default([]),
	requiredPermits: z.array(z.string()).default([]),
	requiredAst: z.boolean().default(false),
	requiredEvidenceTypes: z.array(z.string()).default([]),

	// Usage tracking
	usageCount: z.number().int().nonnegative().default(0),
	lastUsedAt: z.string().datetime().optional(),
	usageHistory: z.array(KitUsageRecordSchema).default([]),

	// Audit
	createdBy: z.string().optional(),
	updatedBy: z.string().optional(),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});
export type KitTemplate = z.infer<typeof KitTemplateSchema>;

// ─── Create / Update Inputs ────────────────────────────────────────────────

export const CreateKitSchema = KitTemplateSchema.omit({
	_id: true,
	version: true,
	usageCount: true,
	lastUsedAt: true,
	usageHistory: true,
	createdAt: true,
	updatedAt: true,
}).extend({
	items: z.array(KitItemSchema).optional(),
});
export type CreateKitInput = z.infer<typeof CreateKitSchema>;

export const UpdateKitSchema = CreateKitSchema.partial();
export type UpdateKitInput = z.infer<typeof UpdateKitSchema>;

// ─── Params & Queries ──────────────────────────────────────────────────────

export const KitIdParamsSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();
export type KitIdParams = z.infer<typeof KitIdParamsSchema>;

export const KitListQuerySchema = z
	.object({
		status: KitStatusEnum.optional(),
		activityType: KitActivityTypeEnum.optional(),
		serviceCategory: KitServiceCategoryEnum.optional(),
		riskLevel: KitRiskLevelEnum.optional(),
		search: z.string().optional(),
		tags: z.string().optional(),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
	})
	.strict();
export type KitListQuery = z.infer<typeof KitListQuerySchema>;

// ─── Actions ───────────────────────────────────────────────────────────────

export const ArchiveKitSchema = z
	.object({
		reason: z.string().min(1, "Archive reason is required when kit has been used").max(500),
	})
	.strict();
export type ArchiveKitInput = z.infer<typeof ArchiveKitSchema>;

export const ActivateKitSchema = z.object({}).strict();
export type ActivateKitInput = z.infer<typeof ActivateKitSchema>;

export const DuplicateKitSchema = z
	.object({
		name: z.string().min(1).max(200).optional(),
	})
	.strict();
export type DuplicateKitInput = z.infer<typeof DuplicateKitSchema>;

export const ApplyKitToPlanningSchema = z
	.object({
		planningId: ObjectIdSchema,
	})
	.strict();
export type ApplyKitToPlanningInput = z.infer<typeof ApplyKitToPlanningSchema>;

export const ApplyKitToPlanningResultSchema = z.object({
	planningId: z.string(),
	kitId: z.string(),
	addedItems: z.number().int().nonnegative(),
	duplicatedItems: z.number().int().nonnegative(),
	missingCriticalItems: z.array(z.string()),
	readinessScore: z.number().min(0).max(100),
	readinessStatus: z.enum(["ready", "missing_non_critical", "missing_critical", "blocked"]),
});
export type ApplyKitToPlanningResult = z.infer<typeof ApplyKitToPlanningResultSchema>;

export const KitDeleteResultSchema = z.object({
	deleted: z.boolean(),
	message: z.string(),
	reason: z.string().optional(),
});
export type KitDeleteResult = z.infer<typeof KitDeleteResultSchema>;

// ─── Catalog Options (preselected catalog values) ──────────────────────────

export const KitCatalogOptionsSchema = z.object({
	toolCategories: z.array(z.object({ value: z.string(), label: z.string() })),
	equipmentCategories: z.array(z.object({ value: z.string(), label: z.string() })),
	eppCategories: z.array(z.object({ value: z.string(), label: z.string() })),
	materialCategories: z.array(z.object({ value: z.string(), label: z.string() })),
	documentTypes: z.array(z.object({ value: z.string(), label: z.string() })),
	checklistTypes: z.array(z.object({ value: z.string(), label: z.string() })),
	permitTypes: z.array(z.object({ value: z.string(), label: z.string() })),
	astTypes: z.array(z.object({ value: z.string(), label: z.string() })),
});
export type KitCatalogOptions = z.infer<typeof KitCatalogOptionsSchema>;
