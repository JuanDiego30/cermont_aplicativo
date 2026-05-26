import type { DocumentAttachmentEntityType, DocumentAttachmentType } from "@cermont/shared-types";
import { type Document, model, Schema, type Types } from "mongoose";

export interface IDocumentAttachmentDocument extends Document {
	_id: Types.ObjectId;
	documentId: Types.ObjectId;
	entityType: DocumentAttachmentEntityType;
	entityId: Types.ObjectId;
	label: string;
	type: DocumentAttachmentType;
	required: boolean;
	notes?: string;
	createdBy: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const DocumentAttachmentSchema = new Schema<IDocumentAttachmentDocument>(
	{
		documentId: {
			type: Schema.Types.ObjectId,
			ref: "Document",
			required: true,
		},
		entityType: {
			type: String,
			enum: ["kit", "tool", "resource", "equipment", "maintenance", "planning", "order"],
			required: true,
		},
		entityId: {
			type: Schema.Types.ObjectId,
			required: true,
		},
		label: {
			type: String,
			required: true,
			trim: true,
			maxlength: 200,
		},
		type: {
			type: String,
			enum: [
				"manual",
				"datasheet",
				"certificate",
				"procedure",
				"checklist",
				"format",
				"safety",
				"technical_sheet",
				"calibration_certificate",
				"other",
			],
			required: true,
		},
		required: {
			type: Boolean,
			default: false,
		},
		notes: {
			type: String,
			trim: true,
			maxlength: 1000,
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

DocumentAttachmentSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
DocumentAttachmentSchema.index({ documentId: 1, entityType: 1, entityId: 1 });
DocumentAttachmentSchema.index(
	{ documentId: 1, entityType: 1, entityId: 1, label: 1 },
	{ unique: true },
);

export const DocumentAttachment = model<IDocumentAttachmentDocument>(
	"DocumentAttachment",
	DocumentAttachmentSchema,
);
