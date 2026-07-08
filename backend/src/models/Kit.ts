/**
 * Kit Mongoose Model — Professional Kit Templates
 *
 * Full-featured kit system with categorized items, PDF attachments, checklists,
 * documents, readiness rules, and versioned lifecycle.
 *
 * Maps to @cermont/shared-types/schemas/kit.schema.ts
 */

import { type Document, model, Schema, type Types } from "mongoose";

// ─── Interfaces ────────────────────────────────────────────────────────────

export interface KitItem {
	id?: string;
	category:
		| "tool"
		| "electrical_tool"
		| "construction_equipment"
		| "height_safety"
		| "material"
		| "epp"
		| "instrument"
		| "vehicle"
		| "document"
		| "checklist";
	name: string;
	description?: string;
	quantity: number;
	unit: string;
	isCritical: boolean;
	isOptional: boolean;
	requiresCertification: boolean;
	certificationType?: string;
	calibrationRequired: boolean;
	calibrationValidityDays?: number;
	estimatedUnitCost?: number;
	inventoryItemId?: string;
	assetId?: string;
	notes?: string;
}

export interface KitAttachment {
	id?: string;
	fileName: string;
	originalName: string;
	mimeType: string;
	fileSize: number;
	url: string;
	purpose:
		| "tool_list_pdf"
		| "manual"
		| "procedure"
		| "safety_instruction"
		| "checklist_template"
		| "photo_reference"
		| "other";
	uploadedBy?: string;
	uploadedAt?: Date;
}

export interface KitChecklistRequirement {
	id?: string;
	name: string;
	description?: string;
	isRequired: boolean;
	stage: "planning" | "execution" | "closure";
	checklistTemplateId?: string;
}

export interface KitDocumentRequirement {
	id?: string;
	name: string;
	description?: string;
	isRequired: boolean;
	documentType?: string;
}

export interface KitReadinessRule {
	id?: string;
	name: string;
	condition: string;
	message: string;
	severity: "warning" | "blocker";
	active: boolean;
}

export interface KitUsageRecord {
	planningId: string;
	appliedAt: Date;
	appliedBy: string;
	readinessScore?: number;
	readinessStatus?: "ready" | "missing_non_critical" | "missing_critical" | "blocked";
}

// ─── Main Document Interface ───────────────────────────────────────────────

export interface IKitDocument extends Document {
	_id: Types.ObjectId;
	code?: string;
	name: string;
	description?: string;
	activityType:
		| "electrico"
		| "mecanico"
		| "civil"
		| "instrumentacion"
		| "telecomunicaciones"
		| "hse"
		| "general";
	serviceCategory?:
		| "mantenimiento"
		| "instalacion"
		| "inspeccion"
		| "reparacion"
		| "construccion"
		| "montaje"
		| "limpieza"
		| "otro";
	businessUnit?:
		| "industrial"
		| "comercial"
		| "residencial"
		| "mineria"
		| "energia"
		| "hidrocarburos"
		| "general";
	status: "draft" | "active" | "archived" | "voided";
	version: number;
	isDefault: boolean;
	tags: string[];
	estimatedDurationHours?: number;
	riskLevel: "low" | "medium" | "high" | "critical";

	tools: KitItem[];
	electricalTools: KitItem[];
	constructionEquipment: KitItem[];
	heightSafetyKit: KitItem[];
	materials: KitItem[];
	epp: KitItem[];
	instruments: KitItem[];
	vehicles: KitItem[];

	documents: KitDocumentRequirement[];
	attachments: KitAttachment[];

	checklists: KitChecklistRequirement[];
	readinessRules: KitReadinessRule[];

	requiredCertifications: string[];
	requiredPermits: string[];
	requiredAst: boolean;
	requiredEvidenceTypes: string[];

	usageCount: number;
	lastUsedAt?: Date;
	usageHistory: KitUsageRecord[];

	createdBy?: Types.ObjectId;
	updatedBy?: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

// ─── Subdocument Schemas ───────────────────────────────────────────────────

const KitItemSchema = new Schema<KitItem>(
	{
		id: { type: String },
		category: {
			type: String,
			enum: [
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
			],
			required: true,
		},
		name: { type: String, required: true, maxlength: 200 },
		description: { type: String, maxlength: 500 },
		quantity: { type: Number, required: true, min: 0 },
		unit: { type: String, required: true, maxlength: 50 },
		isCritical: { type: Boolean, default: false },
		isOptional: { type: Boolean, default: false },
		requiresCertification: { type: Boolean, default: false },
		certificationType: { type: String, maxlength: 100 },
		calibrationRequired: { type: Boolean, default: false },
		calibrationValidityDays: { type: Number },
		estimatedUnitCost: { type: Number, min: 0 },
		inventoryItemId: { type: String },
		assetId: { type: String },
		notes: { type: String, maxlength: 1000 },
	},
	{ _id: false },
);

const KitAttachmentSchema = new Schema<KitAttachment>(
	{
		id: { type: String },
		fileName: { type: String, required: true, maxlength: 255 },
		originalName: { type: String, required: true, maxlength: 255 },
		mimeType: { type: String, required: true, maxlength: 127 },
		fileSize: { type: Number, required: true, min: 0 },
		url: { type: String, required: true },
		purpose: {
			type: String,
			enum: [
				"tool_list_pdf",
				"manual",
				"procedure",
				"safety_instruction",
				"checklist_template",
				"photo_reference",
				"other",
			],
			required: true,
		},
		uploadedBy: { type: String },
		uploadedAt: { type: Date },
	},
	{ _id: false },
);

const KitChecklistRequirementSchema = new Schema<KitChecklistRequirement>(
	{
		id: { type: String },
		name: { type: String, required: true, maxlength: 200 },
		description: { type: String, maxlength: 1000 },
		isRequired: { type: Boolean, default: true },
		stage: { type: String, enum: ["planning", "execution", "closure"], default: "execution" },
		checklistTemplateId: { type: String },
	},
	{ _id: false },
);

const KitDocumentRequirementSchema = new Schema<KitDocumentRequirement>(
	{
		id: { type: String },
		name: { type: String, required: true, maxlength: 200 },
		description: { type: String, maxlength: 1000 },
		isRequired: { type: Boolean, default: true },
		documentType: { type: String, maxlength: 100 },
	},
	{ _id: false },
);

const KitReadinessRuleSchema = new Schema<KitReadinessRule>(
	{
		id: { type: String },
		name: { type: String, required: true, maxlength: 200 },
		condition: { type: String, required: true, maxlength: 2000 },
		message: { type: String, required: true, maxlength: 500 },
		severity: { type: String, enum: ["warning", "blocker"], default: "warning" },
		active: { type: Boolean, default: true },
	},
	{ _id: false },
);

const KitUsageRecordSchema = new Schema<KitUsageRecord>(
	{
		planningId: { type: String, required: true },
		appliedAt: { type: Date, required: true },
		appliedBy: { type: String, required: true },
		readinessScore: { type: Number, min: 0, max: 100 },
		readinessStatus: {
			type: String,
			enum: ["ready", "missing_non_critical", "missing_critical", "blocked"],
		},
	},
	{ _id: false },
);

// ─── Main Schema ───────────────────────────────────────────────────────────

const KitSchema = new Schema<IKitDocument>(
	{
		code: { type: String, maxlength: 50 },
		name: { type: String, required: true, maxlength: 200 },
		description: { type: String, maxlength: 2000 },
		activityType: {
			type: String,
			enum: [
				"electrico",
				"mecanico",
				"civil",
				"instrumentacion",
				"telecomunicaciones",
				"hse",
				"general",
			],
			required: true,
		},
		serviceCategory: {
			type: String,
			enum: [
				"mantenimiento",
				"instalacion",
				"inspeccion",
				"reparacion",
				"construccion",
				"montaje",
				"limpieza",
				"otro",
			],
		},
		businessUnit: {
			type: String,
			enum: [
				"industrial",
				"comercial",
				"residencial",
				"mineria",
				"energia",
				"hidrocarburos",
				"general",
			],
		},
		status: {
			type: String,
			enum: ["draft", "active", "archived", "voided"],
			default: "draft",
		},
		version: { type: Number, required: true, min: 1, default: 1 },
		isDefault: { type: Boolean, default: false },
		tags: { type: [String], default: [] },
		estimatedDurationHours: { type: Number, min: 0 },
		riskLevel: {
			type: String,
			enum: ["low", "medium", "high", "critical"],
			default: "low",
		},

		tools: { type: [KitItemSchema], default: [] },
		electricalTools: { type: [KitItemSchema], default: [] },
		constructionEquipment: { type: [KitItemSchema], default: [] },
		heightSafetyKit: { type: [KitItemSchema], default: [] },
		materials: { type: [KitItemSchema], default: [] },
		epp: { type: [KitItemSchema], default: [] },
		instruments: { type: [KitItemSchema], default: [] },
		vehicles: { type: [KitItemSchema], default: [] },

		documents: { type: [KitDocumentRequirementSchema], default: [] },
		attachments: { type: [KitAttachmentSchema], default: [] },

		checklists: { type: [KitChecklistRequirementSchema], default: [] },
		readinessRules: { type: [KitReadinessRuleSchema], default: [] },

		requiredCertifications: { type: [String], default: [] },
		requiredPermits: { type: [String], default: [] },
		requiredAst: { type: Boolean, default: false },
		requiredEvidenceTypes: { type: [String], default: [] },

		usageCount: { type: Number, default: 0, min: 0 },
		lastUsedAt: { type: Date },
		usageHistory: { type: [KitUsageRecordSchema], default: [] },

		createdBy: { type: Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

// ─── Indexes ───────────────────────────────────────────────────────────────

KitSchema.index({ status: 1 });
KitSchema.index({ activityType: 1 });
KitSchema.index({ riskLevel: 1 });
KitSchema.index({ tags: 1 });
KitSchema.index({ name: "text", description: "text" });
KitSchema.index({ createdBy: 1, createdAt: -1 });

// ─── toJSON Transform ──────────────────────────────────────────────────────

KitSchema.set("toJSON", {
	transform: (_doc, ret) => {
		const { __v, ...result } = ret;
		return result;
	},
});

// ─── Model Export ──────────────────────────────────────────────────────────

export const Kit = model<IKitDocument>("Kit", KitSchema);
