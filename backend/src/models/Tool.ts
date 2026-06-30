import { type Document, model, Schema, type Types } from "mongoose";

import { type FileAssetRef, FileAssetRefSchema } from "./sub-schemas/FileAssetRefSchema";

/**
 * Tool Mongoose Model (Advanced Tool Management)
 *
 * Extended resource model with certifications, documents, and evidence requirements.
 * Supports tracking of calibration, inspections, and compliance documents.
 *
 * Maps to @cermont/shared-types/schemas/resource.schema.ts
 */

// ─── Subdocument Schemas ─────────────────────────────────────────────────────────

// Certification
const _CertificationSchema = new Schema(
	{
		id: { type: String },
		type: {
			type: String,
			enum: ["calibration", "inspection", "safety", "training", "license", "other"],
			required: true,
		},
		name: { type: String, required: true, maxlength: 200 },
		issuedAt: { type: Date, required: true },
		expiresAt: { type: Date, required: true },
		status: { type: String, enum: ["valid", "expired", "pending", "revoked"], default: "valid" },
		issuer: { type: String, maxlength: 200 },
		documentId: { type: Schema.Types.ObjectId, ref: "Document" },
	},
	{ _id: false },
);

// Resource Evidence Requirement
const _ResourceEvidenceRequirementSchema = new Schema(
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

// Resource File Attachment
const _ResourceFileAttachmentSchema = new Schema(
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

// ─── Subdocument Types ──────────────────────────────────────────────────────────

export interface ToolCertification {
	certificationId: string;
	type: "calibration" | "inspection" | "safety" | "training" | "license" | "other";
	name?: string;
	issuedAt: Date;
	expiresAt: Date;
	status: "valid" | "expired" | "pending" | "revoked";
	issuer?: string;
	documentId?: string;
}

interface ToolResourceFileAttachment {
	documentId: string;
	name: string;
	type?: string;
	fileId?: string;
	url?: string;
	mimeType?: string;
	size?: number;
	uploadedAt?: Date;
}

interface ToolEvidenceRequirement {
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

// ─── Main Document Interface ───────────────────────────────────────────────────

export interface IToolDocument extends Document {
	_id: Types.ObjectId;
	name: string;
	type: "tool" | "vehicle" | "equipment";
	status: "available" | "assigned" | "maintenance" | "expired" | "inactive";
	description?: string;
	serialNumber?: string;
	brand?: string;
	modelName?: string;
	purchaseDate?: Date;
	maintenanceDate?: Date;
	lastCalibratedAt?: Date;
	nextCalibrationAt?: Date;
	category?: string;
	image?: FileAssetRef;
	gallery: FileAssetRef[];
	certifications: ToolCertification[];
	documents: ToolResourceFileAttachment[];
	usageHistory: Array<{
		orderId: Types.ObjectId;
		orderCode?: string;
		usedAt: Date;
		returnedAt?: Date;
		usedBy?: Types.ObjectId;
	}>;
	fileAssets: FileAssetRef[];
	evidenceRequirements: ToolEvidenceRequirement[];
	dynamicForms: Types.ObjectId[];
	createdBy?: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
	__v?: number;
}

// ─── Main Schema ────────────────────────────────────────────────────────────────

const ToolSchema = new Schema<IToolDocument>(
	{
		name: { type: String, required: true, maxlength: 200 },
		type: {
			type: String,
			enum: ["tool", "vehicle", "equipment"],
			required: true,
		},
		status: {
			type: String,
			enum: ["available", "assigned", "maintenance", "expired", "inactive"],
			default: "available",
		},
		description: { type: String },
		serialNumber: { type: String },
		brand: { type: String, maxlength: 100 },
		modelName: { type: String, maxlength: 100 },
		purchaseDate: { type: Date },
		maintenanceDate: { type: Date },
		lastCalibratedAt: { type: Date },
		nextCalibrationAt: { type: Date, index: true },
		category: { type: String, maxlength: 100 },
		image: { type: FileAssetRefSchema },
		gallery: { type: [FileAssetRefSchema], default: [] },
		certifications: { type: Schema.Types.Mixed, default: [] },
		documents: { type: Schema.Types.Mixed, default: [] },
		fileAssets: { type: [FileAssetRefSchema], default: [] },
		usageHistory: {
			type: [
				{
					orderId: { type: Schema.Types.ObjectId, ref: "Order" },
					orderCode: { type: String, maxlength: 40 },
					usedAt: { type: Date, required: true },
					returnedAt: { type: Date },
					usedBy: { type: Schema.Types.ObjectId, ref: "User" },
				},
			],
			default: [],
		},
		evidenceRequirements: { type: Schema.Types.Mixed, default: [] },
		dynamicForms: [{ type: Schema.Types.ObjectId, ref: "DocumentTemplate" }],
		createdBy: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

// ─── Indexes ───────────────────────────────────────────────────────────────────

ToolSchema.index({ status: 1 });
ToolSchema.index({ type: 1 });
ToolSchema.index({ category: 1 });
ToolSchema.index({ serialNumber: 1 });
ToolSchema.index({ "certifications.expiresAt": 1 });
ToolSchema.index({ createdBy: 1, createdAt: -1 });

// ─── Virtual for expired certifications ───────────────────────────────────────

ToolSchema.virtual("hasExpiredCertifications").get(function () {
	return this.certifications.some(
		(cert: ToolCertification) => cert.expiresAt && new Date(cert.expiresAt) < new Date(),
	);
});

// ─── toJSON Transform ───────────────────────────────────────────────────────────

ToolSchema.set("toJSON", {
	transform: (_doc, ret) => {
		delete ret.__v;
		return ret;
	},
});

// ─── Model Export ───────────────────────────────────────────────────────────────

export const Tool = model<IToolDocument>("Tool", ToolSchema);
