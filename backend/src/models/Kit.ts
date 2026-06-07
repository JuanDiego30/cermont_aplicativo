import { type Document, model, Schema, type Types } from "mongoose";

import { FileAssetRefSchema, type FileAssetRef } from "./sub-schemas/FileAssetRefSchema";

/**
 * Kit Mongoose Model (New Generation)
 *
 * Dynamic kit system with items, documents, forms, evidence requirements, and rules.
 * Supports versioning and status workflow (draft -> published -> archived).
 *
 * Maps to @cermont/shared-types/schemas/kit.schema.ts
 */

// ─── Concrete Interfaces (replacing Record<string, unknown>) ─────────────────

export interface KitItem {
	id?: string;
	type: "tool" | "equipment" | "material" | "ppe" | "document" | "form";
	name: string;
	code?: string;
	description?: string;
	quantity: number;
	unit: string;
	unitCost?: number;
	required?: boolean;
	critical?: boolean;
	image?: FileAssetRef;
}

export interface KitFileAttachment {
	id?: string;
	name: string;
	fileId?: string;
	fileUrl?: string;
	mimeType?: string;
	size?: number;
	uploadedAt?: string | Date;
}

export interface KitRule {
	id?: string;
	name: string;
	condition: string;
	action: "warn" | "block" | "require_evidence";
	message: string;
	severity: "low" | "medium" | "high";
	active?: boolean;
}

export interface KitFormBinding {
	id?: string;
	templateId: string | Types.ObjectId;
	templateName: string;
	required?: boolean;
	stage?: string;
}

export interface EvidenceRequirement {
	id?: string;
	name: string;
	description?: string;
	type:
		| "photo_before"
		| "photo_during"
		| "photo_after"
		| "signature"
		| "document"
		| "gps"
		| "checklist";
	required?: boolean;
	stage?: string;
	component?: string;
}

// ─── Subdocument Schemas ─────────────────────────────────────────────────────────

// Kit Item
const _KitItemSchema = new Schema<KitItem>(
	{
		id: { type: String },
		type: {
			type: String,
			enum: ["tool", "equipment", "material", "ppe", "document", "form"],
			required: true,
		},
		name: { type: String, required: true, maxlength: 200 },
		code: { type: String, maxlength: 50 },
		description: { type: String, maxlength: 500 },
		quantity: { type: Number, required: true, min: 1 },
		unit: { type: String, required: true },
		unitCost: { type: Number, min: 0 },
		required: { type: Boolean, default: false },
		critical: { type: Boolean, default: false },
	},
	{ _id: false },
);

// Kit File Attachment
const _KitFileAttachmentSchema = new Schema<KitFileAttachment>(
	{
		id: { type: String },
		name: { type: String, required: true, maxlength: 200 },
		fileId: { type: Schema.Types.ObjectId, ref: "Document" },
		fileUrl: { type: String },
		mimeType: { type: String, maxlength: 100 },
		size: { type: Number, min: 0 },
		uploadedAt: { type: Date },
	},
	{ _id: false },
);

// Kit Rule
const _KitRuleSchema = new Schema<KitRule>(
	{
		id: { type: String },
		name: { type: String, required: true, maxlength: 200 },
		condition: { type: String, required: true, maxlength: 2000 },
		action: { type: String, enum: ["warn", "block", "require_evidence"], required: true },
		message: { type: String, required: true, maxlength: 1000 },
		severity: { type: String, enum: ["low", "medium", "high"], required: true },
		active: { type: Boolean, default: true },
	},
	{ _id: false },
);

// Kit Form Binding
const _KitFormBindingSchema = new Schema<KitFormBinding>(
	{
		id: { type: String },
		templateId: { type: Schema.Types.ObjectId, ref: "DocumentTemplate", required: true },
		templateName: { type: String, required: true, maxlength: 200 },
		required: { type: Boolean, default: false },
		stage: { type: String },
	},
	{ _id: false },
);

// Evidence Requirement
const _EvidenceRequirementSchema = new Schema<EvidenceRequirement>(
	{
		id: { type: String },
		name: { type: String, required: true, maxlength: 200 },
		description: { type: String, maxlength: 1000 },
		type: {
			type: String,
			enum: [
				"photo_before",
				"photo_during",
				"photo_after",
				"signature",
				"document",
				"gps",
				"checklist",
			],
			required: true,
		},
		required: { type: Boolean, default: false },
		stage: { type: String },
		component: { type: String, maxlength: 200 },
	},
	{ _id: false },
);

// ─── Main Document Interface ───────────────────────────────────────────────────

export interface IKitDocument extends Document {
	_id: Types.ObjectId;
	name: string;
	description?: string;
	category: string;
	version: number;
	status: "draft" | "published" | "archived";
	serviceTypes: string[];
	items: KitItem[];
	documents: KitFileAttachment[];
	fileAssets: FileAssetRef[];
	forms: KitFormBinding[];
	evidenceRequirements: EvidenceRequirement[];
	rules: KitRule[];
	isActive: boolean;
	createdBy?: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

// ─── Main Schema ────────────────────────────────────────────────────────────────

const KitSchema = new Schema<IKitDocument>(
	{
		name: { type: String, required: true, maxlength: 200 },
		description: { type: String, maxlength: 500 },
		category: {
			type: String,
			enum: ["electrico", "mecanico", "civil", "instrumentacion", "general"],
			required: true,
		},
		version: { type: Number, required: true, min: 1, default: 1 },
		status: {
			type: String,
			enum: ["draft", "published", "archived"],
			default: "draft",
		},
		serviceTypes: { type: [String], default: [] },
		items: { type: Schema.Types.Mixed, required: true },
		documents: { type: Schema.Types.Mixed, default: [] },
		fileAssets: { type: [FileAssetRefSchema], default: [] },
		forms: { type: Schema.Types.Mixed, default: [] },
		evidenceRequirements: { type: Schema.Types.Mixed, default: [] },
		rules: { type: Schema.Types.Mixed, default: [] },
		isActive: { type: Boolean, default: true },
		createdBy: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

// ─── Indexes ───────────────────────────────────────────────────────────────────

KitSchema.index({ status: 1 });
KitSchema.index({ serviceTypes: 1 });
KitSchema.index({ category: 1 });
KitSchema.index({ createdBy: 1, createdAt: -1 });

// ─── toJSON Transform ───────────────────────────────────────────────────────────

KitSchema.set("toJSON", {
	transform: (_doc, ret) => {
		const result = ret as unknown as Record<string, unknown>;
		delete result.__v;
		return result;
	},
});

// ─── Model Export ───────────────────────────────────────────────────────────────

export const Kit = model<IKitDocument>("Kit", KitSchema);
