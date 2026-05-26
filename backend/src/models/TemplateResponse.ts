import type {
	TemplateResponseAssociation,
	TemplateResponseAttachment,
	TemplateResponseGpsPoint,
	TemplateResponsePhoto,
	TemplateResponseSection,
	TemplateResponseSignature,
} from "@cermont/shared-types";
import { type Document, model, Schema, type Types } from "mongoose";

/**
 * TemplateResponse Mongoose Model
 *
 * Stores responses to dynamic forms based on published templates.
 * Supports photos, signatures, GPS, tables, and offline sync.
 *
 * Maps to @cermont/shared-types/schemas/template-response.schema.ts
 */

// ─── Subdocument Schemas ─────────────────────────────────────────────────────────

// GPS Point
const GpsPointSchema = new Schema(
	{
		latitude: { type: Number, required: true, min: -90, max: 90 },
		longitude: { type: Number, required: true, min: -180, max: 180 },
		altitude: { type: Number },
		accuracy: { type: Number },
		timestamp: { type: Date, required: true },
		provider: { type: String },
	},
	{ _id: false },
);

// Signature
const SignatureSchema = new Schema(
	{
		signatureId: { type: String, required: true },
		imageData: { type: String, required: true }, // Base64 encoded
		imageFormat: { type: String, enum: ["svg", "png"], required: true },
		signedAt: { type: Date, required: true },
		signedBy: { type: String, required: true },
		signedByName: { type: String, required: true },
		ipAddress: { type: String },
		deviceInfo: { type: String },
		confirmed: { type: Boolean, default: false },
	},
	{ _id: false },
);

// Attachment
const AttachmentSchema = new Schema(
	{
		attachmentId: { type: String, required: true },
		type: { type: String, enum: ["photo", "document", "audio", "video"], required: true },
		fileName: { type: String, required: true },
		mimeType: { type: String, required: true },
		sizeBytes: { type: Number, required: true, min: 0 },
		fileHash: { type: String },
		storagePath: { type: String },
		thumbnailPath: { type: String },
		uploadedAt: { type: Date, required: true },
		uploadedBy: { type: String, required: true },
		gpsPoint: { type: GpsPointSchema },
		metadata: { type: Schema.Types.Mixed },
	},
	{ _id: false },
);

// Field Value
const FieldValueSchema = new Schema(
	{
		fieldId: { type: String, required: true },
		sectionId: { type: String, required: true },
		value: { type: Schema.Types.Mixed },
		displayValue: { type: String },
		calculatedValue: { type: Schema.Types.Mixed },
		metadata: { type: Schema.Types.Mixed },
		attachments: { type: [AttachmentSchema], default: [] },
		signature: { type: SignatureSchema },
		gpsPoint: { type: GpsPointSchema },
		validation: {
			isValid: { type: Boolean },
			errors: [{ type: String }],
			warnings: [{ type: String }],
		},
		modifiedAt: { type: Date, required: true },
		modifiedBy: { type: String, required: true },
	},
	{ _id: false },
);

// Section Response
const _SectionResponseSchema = new Schema(
	{
		sectionId: { type: String, required: true },
		order: { type: Number, required: true, min: 0 },
		fields: { type: [FieldValueSchema], required: true },
		completionStatus: {
			type: String,
			enum: ["empty", "partial", "complete", "na"],
			default: "empty",
		},
		notes: { type: String, maxlength: 5000 },
		attachments: { type: [AttachmentSchema], default: [] },
	},
	{ _id: false },
);

// Association
const _AssociationSchema = new Schema(
	{
		entityType: {
			type: String,
			enum: [
				"workRequest",
				"siteVisit",
				"proposal",
				"workOrder",
				"planningPacket",
				"executionSession",
				"technicalReport",
				"deliveryRecord",
				"serviceEntrySheet",
				"invoice",
				"asset",
				"maintenanceEvent",
			],
			required: true,
		},
		entityId: { type: String, required: true },
		associationType: { type: String, enum: ["required", "attached", "generated"], required: true },
	},
	{ _id: false },
);

// ─── Main Document Interface ───────────────────────────────────────────────────

export interface ITemplateResponseDocument extends Document {
	_id: Types.ObjectId;
	documentTemplateId: Types.ObjectId;
	documentTemplateVersionId: Types.ObjectId;
	versionNumber: number;
	versionHash?: string;
	linkedEntityType?: string;
	linkedEntityId?: Types.ObjectId;
	stage?: string;
	templateName?: string;
	sections: TemplateResponseSection[];
	values?: Record<string, unknown>;
	attachments: TemplateResponseAttachment[];
	photos: TemplateResponsePhoto[];
	signatures: TemplateResponseSignature[];
	gpsPoints: TemplateResponseGpsPoint[];
	associations: TemplateResponseAssociation[];
	progress?: {
		totalFields: number;
		completedFields: number;
		requiredFields: number;
		requiredCompleted: number;
		percentage: number;
	};
	status: "draft" | "in_progress" | "submitted" | "validated" | "rejected" | "synced" | "conflict";
	offlineMetadata?: {
		isOfflineCreated: boolean;
		clientMutationId?: string;
		syncAttempts: number;
		lastSyncAttempt?: Date;
		syncError?: string;
		pendingAttachments: number;
	};
	conflictData?: {
		serverVersion?: Record<string, unknown>;
		localVersion?: Record<string, unknown>;
		conflictFields?: string[];
		resolvedAt?: Date;
		resolvedBy?: string;
		resolution?: "keep_local" | "keep_server" | "merged";
	};
	globalSignature?: TemplateResponseSignature;
	startGpsPoint?: TemplateResponseGpsPoint;
	endGpsPoint?: TemplateResponseGpsPoint;
	startedAt: Date;
	submittedAt?: Date;
	validatedAt?: Date;
	validatedBy?: string;
	submittedBy?: string;
	approvedBy?: string;
	approvedAt?: Date;
	deviceInfo?: {
		deviceId?: string;
		platform?: string;
		appVersion?: string;
	};
	createdBy: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

// ─── Main Schema ────────────────────────────────────────────────────────────────

const TemplateResponseSchema = new Schema<ITemplateResponseDocument>(
	{
		documentTemplateId: { type: Schema.Types.ObjectId, ref: "DocumentTemplate", required: true },
		documentTemplateVersionId: {
			type: Schema.Types.ObjectId,
			ref: "DocumentTemplateVersion",
			required: true,
		},
		versionNumber: { type: Number, required: true, min: 1 },
		versionHash: { type: String },
		linkedEntityType: { type: String },
		linkedEntityId: { type: Schema.Types.ObjectId },
		stage: { type: String },
		templateName: { type: String },
		sections: { type: Schema.Types.Mixed, required: true },
		values: { type: Schema.Types.Mixed },
		attachments: { type: Schema.Types.Mixed, default: [] },
		photos: { type: Schema.Types.Mixed, default: [] },
		signatures: { type: Schema.Types.Mixed, default: [] },
		gpsPoints: { type: Schema.Types.Mixed, default: [] },
		associations: { type: Schema.Types.Mixed, default: [] },
		progress: {
			totalFields: { type: Number, min: 0 },
			completedFields: { type: Number, min: 0 },
			requiredFields: { type: Number, min: 0 },
			requiredCompleted: { type: Number, min: 0 },
			percentage: { type: Number, min: 0, max: 100 },
		},
		status: {
			type: String,
			enum: ["draft", "in_progress", "submitted", "validated", "rejected", "synced", "conflict"],
			default: "draft",
		},
		offlineMetadata: {
			isOfflineCreated: { type: Boolean, default: false },
			clientMutationId: { type: String },
			syncAttempts: { type: Number, default: 0, min: 0 },
			lastSyncAttempt: { type: Date },
			syncError: { type: String },
			pendingAttachments: { type: Number, default: 0, min: 0 },
		},
		conflictData: {
			serverVersion: { type: Schema.Types.Mixed },
			localVersion: { type: Schema.Types.Mixed },
			conflictFields: [{ type: String }],
			resolvedAt: { type: Date },
			resolvedBy: { type: String },
			resolution: { type: String, enum: ["keep_local", "keep_server", "merged"] },
		},
		globalSignature: { type: SignatureSchema },
		startGpsPoint: { type: GpsPointSchema },
		endGpsPoint: { type: GpsPointSchema },
		startedAt: { type: Date, required: true },
		submittedAt: { type: Date },
		validatedAt: { type: Date },
		validatedBy: { type: String },
		submittedBy: { type: String },
		approvedBy: { type: String },
		approvedAt: { type: Date },
		deviceInfo: {
			deviceId: { type: String },
			platform: { type: String },
			appVersion: { type: String },
		},
		createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

// ─── Indexes ───────────────────────────────────────────────────────────────────

TemplateResponseSchema.index({ documentTemplateId: 1 });
TemplateResponseSchema.index({ status: 1 });
TemplateResponseSchema.index({ linkedEntityType: 1, linkedEntityId: 1 });
TemplateResponseSchema.index({ createdBy: 1, createdAt: -1 });
TemplateResponseSchema.index(
	{ "offlineMetadata.clientMutationId": 1 },
	{ unique: true, sparse: true },
);

// ─── toJSON Transform ───────────────────────────────────────────────────────────

TemplateResponseSchema.set("toJSON", {
	transform: (_doc, ret: Partial<ITemplateResponseDocument> & { __v?: number }) => {
		delete ret.__v;
		return ret;
	},
});

// ─── Model Export ───────────────────────────────────────────────────────────────

export const TemplateResponse = model<ITemplateResponseDocument>(
	"TemplateResponse",
	TemplateResponseSchema,
);
