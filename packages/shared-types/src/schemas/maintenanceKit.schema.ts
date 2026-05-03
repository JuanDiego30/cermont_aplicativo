/**
 * Maintenance Kit Schema — Zod validation for enterprise maintenance job plans.
 *
 * Maps to backend model: backend/src/maintenance/infrastructure/model.ts
 * Reference: DOC-09 Section Diccionario de Datos, DOC-07 Section Kit Tipico
 */

import { z } from "zod";
import type { MongooseDocument } from "./common.schema";

export const ACTIVITY_TYPE_VALUES = [
	"electrical",
	"mechanical",
	"civil",
	"telecommunications",
	"hse",
] as const;

const ACTIVITY_TYPE_LEGACY_ALIASES: Record<string, (typeof ACTIVITY_TYPE_VALUES)[number]> = {
	electrico: "electrical",
	mecanico: "mechanical",
	telecomunicaciones: "telecommunications",
	// "civil" and "hse" are the same in both languages
};

function normalizeActivityType(value: string): string {
	return ACTIVITY_TYPE_LEGACY_ALIASES[value] ?? value;
}

export const ActivityTypeEnum = z.preprocess(
	(val) => (typeof val === "string" ? normalizeActivityType(val) : val),
	z.enum(["electrical", "mechanical", "civil", "telecommunications", "hse"]),
);
export type ActivityType = z.infer<typeof ActivityTypeEnum>;

export const MaintenanceClassificationSchema = z.enum([
	"preventive",
	"corrective",
	"predictive",
	"inspection",
	"overhaul",
]);
export type MaintenanceClassification = z.infer<typeof MaintenanceClassificationSchema>;

export const KitRiskClassificationSchema = z.enum(["low", "medium", "high", "critical"]);
export type KitRiskClassification = z.infer<typeof KitRiskClassificationSchema>;

export const JobStepTypeSchema = z.enum([
	"action",
	"measurement",
	"reading",
	"photo_evidence",
	"signature",
	"yes_no",
]);
export type JobStepType = z.infer<typeof JobStepTypeSchema>;

export const MaterialUnitSchema = z.enum(["unit", "meter", "liter", "kg", "roll", "box"]);
export type MaterialUnit = z.infer<typeof MaterialUnitSchema>;

export const ChecklistTimingSchema = z.enum(["before_start", "during_execution", "after_finish"]);
export type ChecklistTiming = z.infer<typeof ChecklistTimingSchema>;

export const RequiredSpecialtySchema = z.enum([
	"electrician",
	"mechanic",
	"welder",
	"hes_specialist",
	"instrumentation",
	"civil",
	"telecom",
]);
export type RequiredSpecialty = z.infer<typeof RequiredSpecialtySchema>;

export const KitPermitTypeSchema = z.enum([
	"heights",
	"confined_space",
	"hot_work",
	"electrical_loto",
	"lifting",
]);
export type KitPermitType = z.infer<typeof KitPermitTypeSchema>;

export const PpeTypeSchema = z.enum([
	"helmet",
	"safety_glasses",
	"dielectric_gloves",
	"harness",
	"steel_toe_boots",
	"hearing_protection",
	"face_shield",
	"tyvek_suit",
]);
export type PpeType = z.infer<typeof PpeTypeSchema>;

export const KitSpecificRiskSchema = z.enum([
	"electrical",
	"fall",
	"explosion",
	"chemical_contamination",
	"entrapment",
]);
export type KitSpecificRisk = z.infer<typeof KitSpecificRiskSchema>;

/**
 * Tool within a kit. Tools return to inventory.
 */
export const ToolSchema = z
	.object({
		name: z.string().min(1).max(200),
		quantity: z.number().int().min(1),
		specifications: z.string().max(500).optional(),
	})
	.strip();
export type Tool = z.infer<typeof ToolSchema>;

/**
 * Equipment within a kit. Equipment may require certification/calibration.
 */
export const EquipmentSchema = z
	.object({
		name: z.string().min(1).max(200),
		quantity: z.number().int().min(1),
		certificateRequired: z.boolean().default(false),
	})
	.strip();
export type Equipment = z.infer<typeof EquipmentSchema>;

export const ProcedureStepSchema = z
	.object({
		order: z.number().int().min(1),
		description: z.string().min(3).max(500),
		type: JobStepTypeSchema,
		expectedValue: z.string().max(200).optional(),
		estimatedMinutes: z.number().int().min(0).optional(),
		required: z.boolean().default(true),
		referenceDocumentId: z.string().min(1).optional(),
	})
	.strip()
	.superRefine((value, ctx) => {
		if (value.type === "measurement" && !value.expectedValue?.trim()) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "expectedValue is required for measurement steps",
				path: ["expectedValue"],
			});
		}
	});
export type ProcedureStep = z.infer<typeof ProcedureStepSchema>;

export const KitMaterialSchema = z
	.object({
		name: z.string().min(1).max(200),
		sku: z.string().max(120).optional(),
		estimatedQuantity: z.number().positive(),
		unit: MaterialUnitSchema,
		estimatedUnitCost: z.number().nonnegative().optional(),
		critical: z.boolean().default(false),
	})
	.strip();
export type KitMaterial = z.infer<typeof KitMaterialSchema>;

export const KitSafetySchema = z
	.object({
		minimumPpe: z.array(PpeTypeSchema).default([]),
		requiredPermits: z.array(KitPermitTypeSchema).default([]),
		riskClassification: KitRiskClassificationSchema,
		specificRisks: z.array(KitSpecificRiskSchema).default([]),
		safetyObservations: z.string().max(2000).optional(),
		requiresLoto: z.boolean().default(false),
	})
	.strip();
export type KitSafety = z.infer<typeof KitSafetySchema>;

export const LinkedChecklistSchema = z
	.object({
		templateId: z.string().min(1),
		timing: ChecklistTimingSchema,
		blocking: z.boolean().default(false),
	})
	.strip();
export type LinkedChecklist = z.infer<typeof LinkedChecklistSchema>;

export const AssignmentRulesSchema = z
	.object({
		requiredSpecialty: RequiredSpecialtySchema.optional(),
		requiredCertifications: z.array(z.string().min(1).max(120)).default([]),
		minimumPeople: z.number().int().min(1).default(1),
		requiresOnSiteSupervisor: z.boolean().default(false),
	})
	.strip();
export type AssignmentRules = z.infer<typeof AssignmentRulesSchema>;

export const KitVersionHistorySchema = z
	.object({
		version: z.string().regex(/^v\d+\.\d+$/),
		changedAt: z.string().datetime(),
		changedBy: z.string().min(1),
		reason: z.string().min(3).max(1000),
	})
	.strip();
export type KitVersionHistory = z.infer<typeof KitVersionHistorySchema>;

const operationalUpdateKeys = new Set([
	"name",
	"activityType",
	"subtype",
	"description",
	"estimatedHours",
	"maintenanceClassification",
	"assetScopes",
	"tools",
	"equipment",
	"procedureSteps",
	"materials",
	"safety",
	"linkedChecklists",
	"assignmentRules",
]);

export const CreateMaintenanceKitSchema = z
	.object({
		name: z.string().min(3).max(200),
		code: z
			.string()
			.regex(/^KIT-\d{6}-\d{4}$/)
			.optional(),
		activityType: ActivityTypeEnum,
		subtype: z.string().max(120).optional(),
		description: z.string().min(10).max(3000),
		estimatedHours: z.number().positive(),
		maintenanceClassification: MaintenanceClassificationSchema,
		assetScopes: z.array(z.string().min(1).max(120)).default([]),
		tools: z.array(ToolSchema).min(1, "At least one tool required"),
		equipment: z.array(EquipmentSchema).default([]),
		procedureSteps: z.array(ProcedureStepSchema).min(1, "At least one procedure step required"),
		materials: z.array(KitMaterialSchema).default([]),
		safety: KitSafetySchema,
		linkedChecklists: z.array(LinkedChecklistSchema).default([]),
		assignmentRules: AssignmentRulesSchema.default({
			requiredCertifications: [],
			minimumPeople: 1,
			requiresOnSiteSupervisor: false,
		}),
		validatedBy: z.string().min(1).optional(),
		lastReviewedAt: z.string().datetime().optional(),
		nextReviewAt: z.string().datetime().optional(),
		internalNotes: z.string().max(3000).optional(),
		isActive: z.boolean().default(true),
	})
	.strip();
export type CreateMaintenanceKit = z.infer<typeof CreateMaintenanceKitSchema>;

export const UpdateMaintenanceKitSchema = z
	.object({
		name: z.string().min(3).max(200).optional(),
		activityType: ActivityTypeEnum.optional(),
		subtype: z.string().max(120).optional(),
		description: z.string().min(10).max(3000).optional(),
		estimatedHours: z.number().positive().optional(),
		maintenanceClassification: MaintenanceClassificationSchema.optional(),
		assetScopes: z.array(z.string().min(1).max(120)).optional(),
		tools: z.array(ToolSchema).optional(),
		equipment: z.array(EquipmentSchema).optional(),
		procedureSteps: z.array(ProcedureStepSchema).min(1).optional(),
		materials: z.array(KitMaterialSchema).optional(),
		safety: KitSafetySchema.optional(),
		linkedChecklists: z.array(LinkedChecklistSchema).optional(),
		assignmentRules: AssignmentRulesSchema.optional(),
		validatedBy: z.string().min(1).optional(),
		lastReviewedAt: z.string().datetime().optional(),
		nextReviewAt: z.string().datetime().optional(),
		internalNotes: z.string().max(3000).optional(),
		isActive: z.boolean().optional(),
		changeReason: z.string().min(3).max(1000).optional(),
	})
	.strip()
	.superRefine((value, ctx) => {
		const changesOperationalField = Object.keys(value).some((key) =>
			operationalUpdateKeys.has(key),
		);

		if (changesOperationalField && !value.changeReason?.trim()) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "changeReason is required when operational kit fields change",
				path: ["changeReason"],
			});
		}
	});
export type UpdateMaintenanceKit = z.infer<typeof UpdateMaintenanceKitSchema>;

export const MaintenanceKitOutputDtoSchema = z
	.object({
		_id: z.string(),
		name: z.string(),
		code: z.string().optional(),
		activityType: ActivityTypeEnum,
		subtype: z.string().optional(),
		description: z.string().optional(),
		estimatedHours: z.number().positive().optional(),
		maintenanceClassification: MaintenanceClassificationSchema.optional(),
		assetScopes: z.array(z.string()).default([]),
		tools: z.array(ToolSchema),
		equipment: z.array(EquipmentSchema),
		procedureSteps: z.array(ProcedureStepSchema).default([]),
		materials: z.array(KitMaterialSchema).default([]),
		baseMaterialCost: z.number().nonnegative().default(0),
		safety: KitSafetySchema.optional(),
		linkedChecklists: z.array(LinkedChecklistSchema).default([]),
		assignmentRules: AssignmentRulesSchema.default({
			requiredCertifications: [],
			minimumPeople: 1,
			requiresOnSiteSupervisor: false,
		}),
		version: z
			.string()
			.regex(/^v\d+\.\d+$/)
			.optional(),
		versionHistory: z.array(KitVersionHistorySchema).default([]),
		validatedBy: z.string().optional(),
		lastReviewedAt: z.string().datetime().optional(),
		nextReviewAt: z.string().datetime().optional(),
		internalNotes: z.string().optional(),
		isActive: z.boolean(),
		createdBy: z.string(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strip();

export const MaintenanceKitSchema = MaintenanceKitOutputDtoSchema;
export type MaintenanceKit = z.infer<typeof MaintenanceKitOutputDtoSchema>;

export interface MaintenanceKitDocument<TID = string> extends MongooseDocument<TID> {
	name: string;
	code?: string;
	activity_type: ActivityType;
	subtype?: string;
	description?: string;
	estimated_hours?: number;
	maintenance_classification?: MaintenanceClassification;
	asset_scopes?: string[];
	tools: Array<{
		name: string;
		quantity: number;
		specifications?: string;
	}>;
	equipment: Array<{
		name: string;
		quantity: number;
		certificate_required: boolean;
	}>;
	procedure_steps?: Array<{
		order: number;
		description: string;
		type: JobStepType;
		expected_value?: string;
		estimated_minutes?: number;
		required: boolean;
		reference_document_id?: TID;
	}>;
	materials?: Array<{
		name: string;
		sku?: string;
		estimated_quantity: number;
		unit: MaterialUnit;
		estimated_unit_cost?: number;
		critical: boolean;
	}>;
	base_material_cost?: number;
	safety?: {
		minimum_ppe: PpeType[];
		required_permits: KitPermitType[];
		risk_classification: KitRiskClassification;
		specific_risks: KitSpecificRisk[];
		safety_observations?: string;
		requires_loto: boolean;
	};
	linked_checklists?: Array<{
		template_id: string;
		timing: ChecklistTiming;
		blocking: boolean;
	}>;
	assignment_rules?: {
		required_specialty?: RequiredSpecialty;
		required_certifications: string[];
		minimum_people: number;
		requires_on_site_supervisor: boolean;
	};
	version?: string;
	version_history?: Array<{
		version: string;
		changedAt: Date;
		changed_by: TID;
		reason: string;
	}>;
	validated_by?: TID;
	lastReviewedAt?: Date;
	nextReviewAt?: Date;
	internal_notes?: string;
	is_active: boolean;
	created_by: TID;
}
