import { type Document, model, Schema, type Types } from "mongoose";

/**
 * EvidenceCollection Mongoose Model
 *
 * Structured evidence collection linked to entities (orders, planning, execution, kits, tools).
 * Supports component and stage-based organization of evidence items.
 *
 * Maps to @cermont/shared-types/schemas/evidence.schema.ts extension
 */

// ─── Subdocument Schemas ─────────────────────────────────────────────────────────

// Evidence Item
const _EvidenceItemSchema = new Schema(
	{
		itemId: { type: String, required: true },
		type: {
			type: String,
			enum: [
				"photo_before",
				"photo_during",
				"photo_after",
				"finding",
				"corrective_action",
				"signature",
				"document",
				"checklist",
			],
			required: true,
		},
		stage: {
			type: String,
			enum: ["before", "during", "after", "finding", "corrective_action"],
			required: true,
		},
		component: { type: String, maxlength: 200 },
		description: { type: String, maxlength: 1000 },
		fileId: { type: Schema.Types.ObjectId, ref: "Document" },
		fileUrl: { type: String },
		mimeType: { type: String, maxlength: 100 },
		size: { type: Number, min: 0 },
		location: {
			latitude: { type: Number, min: -90, max: 90 },
			longitude: { type: Number, min: -180, max: 180 },
			address: { type: String },
		},
		capturedAt: { type: Date, required: true },
		capturedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
		linkedFieldKey: { type: String },
		linkedChecklistItemId: { type: String },
		metadata: { type: Schema.Types.Mixed },
	},
	{ _id: false },
);

export interface IEvidenceItemRecord {
	itemId: string;
	type: string;
	stage?: string;
	component?: string;
	description?: string;
	fileId?: Types.ObjectId;
	fileUrl?: string;
	mimeType?: string;
	size?: number;
	location?: {
		latitude?: number;
		longitude?: number;
		address?: string;
	};
	capturedAt: Date;
	capturedBy: Types.ObjectId;
	linkedFieldKey?: string;
	linkedChecklistItemId?: string;
	metadata?: unknown;
}

// ─── Main Document Interface ───────────────────────────────────────────────────

export interface IEvidenceCollectionDocument extends Document {
	_id: Types.ObjectId;
	entityType: "workOrder" | "planning" | "execution" | "kit" | "tool" | "templateResponse";
	entityId: Types.ObjectId;
	title: string;
	description?: string;
	evidenceItems: IEvidenceItemRecord[];
	createdBy: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

// ─── Main Schema ────────────────────────────────────────────────────────────────

const EvidenceCollectionSchema = new Schema<IEvidenceCollectionDocument>(
	{
		entityType: {
			type: String,
			enum: ["workOrder", "planning", "execution", "kit", "tool", "templateResponse"],
			required: true,
		},
		entityId: { type: Schema.Types.ObjectId, required: true },
		title: { type: String, required: true, maxlength: 200 },
		description: { type: String, maxlength: 1000 },
		evidenceItems: { type: Schema.Types.Mixed, default: [] },
		createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

// ─── Indexes ───────────────────────────────────────────────────────────────────

EvidenceCollectionSchema.index({ entityType: 1, entityId: 1 });
EvidenceCollectionSchema.index({ "evidenceItems.component": 1 });
EvidenceCollectionSchema.index({ "evidenceItems.stage": 1 });
EvidenceCollectionSchema.index({ createdBy: 1, createdAt: -1 });

// ─── toJSON Transform ───────────────────────────────────────────────────────────

EvidenceCollectionSchema.set("toJSON", {
	transform: (_doc, ret) => {
		const serialized = ret as unknown as Record<string, unknown>;
		delete serialized.__v;
		return serialized;
	},
});

// ─── Model Export ───────────────────────────────────────────────────────────────

export const EvidenceCollection = model<IEvidenceCollectionDocument>(
	"EvidenceCollection",
	EvidenceCollectionSchema,
);
