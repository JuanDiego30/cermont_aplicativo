import { type Document, model, Schema, type Types } from "mongoose";

// ═══════════════════════════════════════════════════════════════════════════════
// MaintenanceKit Model — Per DOC-09 §7 (Diccionario de Datos)
//
// ALIGNMENT WITH @cermont/shared-types:
// ✓ name: string, required, unique
// ✓ activity_type: enum ['electrical', 'mechanical', 'civil', 'telecommunications', 'hse']
// ✓ tools: [{name, quantity, specifications}]
// ✓ equipment: [{name, quantity, certificate_required}]
// ✓ is_active: boolean, default true
// ✓ created_by: ObjectId ref to User
// ✓ timestamps: createdAt, updatedAt
//
// NOTE: Mongoose schema is SSOT for persistence. shared-types schema is SSOT for API contracts.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Enums ────────────────────────────────────────────────────────────────────

export const ACTIVITY_TYPES = [
	"electrical",
	"mechanical",
	"civil",
	"telecommunications",
	"hse",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

const MAINTENANCE_CLASSIFICATIONS = [
	"preventive",
	"corrective",
	"predictive",
	"inspection",
	"overhaul",
] as const;

const KIT_RISK_CLASSIFICATIONS = ["low", "medium", "high", "critical"] as const;

const JOB_STEP_TYPES = [
	"action",
	"measurement",
	"reading",
	"photo_evidence",
	"signature",
	"yes_no",
] as const;

const MATERIAL_UNITS = ["unit", "meter", "liter", "kg", "roll", "box"] as const;
const CHECKLIST_TIMINGS = ["before_start", "during_execution", "after_finish"] as const;
const REQUIRED_SPECIALTIES = [
	"electrician",
	"mechanic",
	"welder",
	"hes_specialist",
	"instrumentation",
	"civil",
	"telecom",
] as const;
const PERMIT_TYPES = [
	"heights",
	"confined_space",
	"hot_work",
	"electrical_loto",
	"lifting",
] as const;
const PPE_TYPES = [
	"helmet",
	"safety_glasses",
	"dielectric_gloves",
	"harness",
	"steel_toe_boots",
	"hearing_protection",
	"face_shield",
	"tyvek_suit",
] as const;
const SPECIFIC_RISKS = [
	"electrical",
	"fall",
	"explosion",
	"chemical_contamination",
	"entrapment",
] as const;

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface ITool {
	name: string;
	quantity: number;
	specifications?: string;
}

export interface IEquipment {
	name: string;
	quantity: number;
	certificate_required: boolean;
}

export interface IMaintenanceKit extends Document {
	name: string;
	code?: string;
	activity_type: ActivityType;
	subtype?: string;
	description?: string;
	estimated_hours?: number;
	maintenance_classification?: (typeof MAINTENANCE_CLASSIFICATIONS)[number];
	asset_scopes: string[];
	tools: ITool[];
	equipment: IEquipment[];
	procedure_steps: unknown[];
	materials: unknown[];
	base_material_cost: number;
	safety?: unknown;
	linked_checklists: unknown[];
	assignment_rules?: unknown;
	version?: string;
	version_history: unknown[];
	validated_by?: Types.ObjectId;
	lastReviewedAt?: Date;
	nextReviewAt?: Date;
	internal_notes?: string;
	is_active: boolean;
	created_by: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

// ── Sub-schemas ──────────────────────────────────────────────────────────────

const toolSchema = new Schema<ITool>(
	{
		name: { type: String, required: true, trim: true },
		quantity: { type: Number, required: true, min: 1 },
		specifications: { type: String, trim: true },
	},
	{ _id: false },
);

const equipmentSchema = new Schema<IEquipment>(
	{
		name: { type: String, required: true, trim: true },
		quantity: { type: Number, required: true, min: 1 },
		certificate_required: { type: Boolean, default: false },
	},
	{ _id: false },
);

const procedureStepSchema = new Schema(
	{
		order: { type: Number, required: true, min: 1 },
		description: { type: String, required: true, trim: true, maxlength: 500 },
		type: { type: String, enum: JOB_STEP_TYPES, required: true },
		expected_value: { type: String, trim: true, maxlength: 200 },
		estimated_minutes: { type: Number, min: 0 },
		required: { type: Boolean, default: true },
		reference_document_id: { type: Schema.Types.ObjectId, ref: "Document" },
	},
	{ _id: false },
);

const kitMaterialSchema = new Schema(
	{
		name: { type: String, required: true, trim: true, maxlength: 200 },
		sku: { type: String, trim: true, maxlength: 120 },
		estimated_quantity: { type: Number, required: true, min: 0 },
		unit: { type: String, enum: MATERIAL_UNITS, required: true },
		estimated_unit_cost: { type: Number, min: 0 },
		critical: { type: Boolean, default: false },
	},
	{ _id: false },
);

const kitSafetySchema = new Schema(
	{
		minimum_ppe: { type: [String], enum: PPE_TYPES, default: [] },
		required_permits: { type: [String], enum: PERMIT_TYPES, default: [] },
		risk_classification: { type: String, enum: KIT_RISK_CLASSIFICATIONS, required: true },
		specific_risks: { type: [String], enum: SPECIFIC_RISKS, default: [] },
		safety_observations: { type: String, trim: true, maxlength: 2000 },
		requires_loto: { type: Boolean, default: false },
	},
	{ _id: false },
);

const linkedChecklistSchema = new Schema(
	{
		template_id: { type: String, required: true, trim: true },
		timing: { type: String, enum: CHECKLIST_TIMINGS, required: true },
		blocking: { type: Boolean, default: false },
	},
	{ _id: false },
);

const assignmentRulesSchema = new Schema(
	{
		required_specialty: { type: String, enum: REQUIRED_SPECIALTIES },
		required_certifications: { type: [String], default: [] },
		minimum_people: { type: Number, min: 1, default: 1 },
		requires_on_site_supervisor: { type: Boolean, default: false },
	},
	{ _id: false },
);

const versionHistorySchema = new Schema(
	{
		version: { type: String, required: true },
		changedAt: { type: Date, required: true },
		changed_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
		reason: { type: String, required: true, trim: true, maxlength: 1000 },
	},
	{ _id: false },
);

// ── Main schema ──────────────────────────────────────────────────────────────

const kitTipicoSchema = new Schema<IMaintenanceKit>(
	{
		name: {
			type: String,
			required: [true, "Kit name is required"],
			unique: true,
			trim: true,
		},
		code: {
			type: String,
			unique: true,
			sparse: true,
			trim: true,
			index: true,
		},
		activity_type: {
			type: String,
			enum: ACTIVITY_TYPES,
			required: [true, "Activity type is required"],
			index: true,
		},
		subtype: { type: String, trim: true, maxlength: 120 },
		description: { type: String, trim: true, maxlength: 3000 },
		estimated_hours: { type: Number, min: 0 },
		maintenance_classification: {
			type: String,
			enum: MAINTENANCE_CLASSIFICATIONS,
			index: true,
		},
		asset_scopes: { type: [String], default: [] },
		tools: {
			type: [toolSchema],
			default: [],
			validate: {
				validator: (v: ITool[]) => v.length > 0,
				message: "Kit must have at least one tool",
			},
		},
		equipment: {
			type: [equipmentSchema],
			default: [],
		},
		procedure_steps: { type: [procedureStepSchema], default: [] },
		materials: { type: [kitMaterialSchema], default: [] },
		base_material_cost: { type: Number, min: 0, default: 0 },
		safety: { type: kitSafetySchema },
		linked_checklists: { type: [linkedChecklistSchema], default: [] },
		assignment_rules: { type: assignmentRulesSchema, default: () => ({}) },
		version: { type: String, default: "v1.0" },
		version_history: { type: [versionHistorySchema], default: [] },
		validated_by: { type: Schema.Types.ObjectId, ref: "User" },
		lastReviewedAt: { type: Date },
		nextReviewAt: { type: Date, index: true },
		internal_notes: { type: String, trim: true, maxlength: 3000 },
		is_active: {
			type: Boolean,
			default: true,
			index: true,
		},
		created_by: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
		toJSON: {
			transform(_doc, ret) {
				const json = ret as Record<string, unknown>;
				delete json.__v;
				return ret;
			},
		},
	},
);

// Compound indexes for common queries
kitTipicoSchema.index({ activity_type: 1, is_active: 1 });
kitTipicoSchema.index({ "safety.risk_classification": 1 });
kitTipicoSchema.index({ maintenance_classification: 1 });
kitTipicoSchema.index({ name: "text" });

export const MaintenanceKit = model<IMaintenanceKit>("MaintenanceKit", kitTipicoSchema);

// Legacy alias for backward compatibility
export const KitTipico = MaintenanceKit;
