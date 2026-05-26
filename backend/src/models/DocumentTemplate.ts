import type { DocumentTemplateSourceType, DocumentTemplateStatus } from "@cermont/shared-types";
import { type Document, model, Schema, type Types } from "mongoose";

/**
 * DocumentTemplate Mongoose Model
 *
 * Represents an entry in the document template inventory.
 * Maps to @cermont/shared-types/schemas/document-template.schema.ts
 */

export interface IDocumentTemplateDocument extends Document {
	_id: Types.ObjectId;
	templateName: string;
	description?: string;
	serviceType?: string;
	businessUnit?: string;
	sourceType: DocumentTemplateSourceType;
	frequencyOfUse?: string;
	billingCriticality?: string;
	layoutStability?: string;
	requiresSignature: boolean;
	requiresPhotos: boolean;
	requiresGps: boolean;
	requiresOffline: boolean;
	status: DocumentTemplateStatus;
	createdBy?: Types.ObjectId;
	updatedBy?: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const DocumentTemplateSchema = new Schema<IDocumentTemplateDocument>(
	{
		templateName: { type: String, required: true, maxlength: 200 },
		description: { type: String, maxlength: 2000 },
		serviceType: { type: String, maxlength: 100 },
		businessUnit: { type: String, maxlength: 100 },
		sourceType: {
			type: String,
			enum: ["xlsx", "xls", "pdf", "docx", "image", "manual"],
			required: true,
		},
		frequencyOfUse: { type: String, maxlength: 100 },
		billingCriticality: { type: String, maxlength: 100 },
		layoutStability: { type: String, maxlength: 100 },
		requiresSignature: { type: Boolean, default: false },
		requiresPhotos: { type: Boolean, default: false },
		requiresGps: { type: Boolean, default: false },
		requiresOffline: { type: Boolean, default: false },
		status: {
			type: String,
			enum: ["draft", "classified", "ready_for_import", "archived"],
			default: "draft",
		},
		createdBy: { type: Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

DocumentTemplateSchema.index({ status: 1 });
DocumentTemplateSchema.index({ sourceType: 1 });
DocumentTemplateSchema.index({ serviceType: 1 });
DocumentTemplateSchema.index({ createdBy: 1, createdAt: -1 });

DocumentTemplateSchema.set("toJSON", {
	transform: (_doc, ret: { __v?: number }) => {
		delete ret.__v;
		return ret;
	},
});

export const DocumentTemplate = model<IDocumentTemplateDocument>(
	"DocumentTemplate",
	DocumentTemplateSchema,
);
