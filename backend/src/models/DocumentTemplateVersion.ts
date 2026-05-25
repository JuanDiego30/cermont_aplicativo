import type {
	CermontOperationalStepCode,
	DocumentTemplateVersionStatus,
	TemplateExportLayout,
	TemplatePermission,
	TemplateRule,
	TemplateSection,
	TemplateTable,
} from "@cermont/shared-types";
import { type Document, model, Schema, type Types } from "mongoose";

/**
 * DocumentTemplateVersion Mongoose Model
 *
 * Represents a version of a document template.
 * Maps to @cermont/shared-types/schemas/document-template-version.schema.ts
 */

export interface IDocumentTemplateVersionDocument extends Document {
	_id: Types.ObjectId;
	documentTemplateId: Types.ObjectId;
	versionNumber: number;
	status: DocumentTemplateVersionStatus;
	sections: TemplateSection[];
	tables?: TemplateTable[];
	rules?: TemplateRule[];
	permissions?: TemplatePermission[];
	exportLayout?: TemplateExportLayout;
	targetStepCode?: CermontOperationalStepCode;
	sourceFileId?: Types.ObjectId;
	sourceFileHash?: string;
	confidenceScore?: number;
	importNotes?: string;
	publishedAt?: Date;
	publishedBy?: Types.ObjectId;
	deprecatedAt?: Date;
	deprecatedBy?: Types.ObjectId;
	deprecationReason?: string;
	createdBy?: Types.ObjectId;
	updatedBy?: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const DocumentTemplateVersionSchema = new Schema<IDocumentTemplateVersionDocument>(
	{
		documentTemplateId: {
			type: Schema.Types.ObjectId,
			ref: "DocumentTemplate",
			required: true,
		},
		versionNumber: { type: Number, required: true },
		status: {
			type: String,
			enum: ["draft", "review_required", "approved", "published", "deprecated", "archived"],
			default: "draft",
		},
		sections: { type: Schema.Types.Mixed, required: true },
		tables: { type: Schema.Types.Mixed, default: [] },
		rules: { type: Schema.Types.Mixed, default: [] },
		permissions: { type: Schema.Types.Mixed, default: [] },
		exportLayout: { type: Schema.Types.Mixed },
		targetStepCode: { type: String, index: true },
		sourceFileId: { type: Schema.Types.ObjectId, ref: "Document" },
		sourceFileHash: { type: String },
		confidenceScore: { type: Number, min: 0, max: 1 },
		importNotes: { type: String, maxlength: 5000 },
		publishedAt: { type: Date },
		publishedBy: { type: Schema.Types.ObjectId, ref: "User" },
		deprecatedAt: { type: Date },
		deprecatedBy: { type: Schema.Types.ObjectId, ref: "User" },
		deprecationReason: { type: String, maxlength: 1000 },
		createdBy: { type: Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

DocumentTemplateVersionSchema.index({ documentTemplateId: 1, versionNumber: 1 }, { unique: true });
DocumentTemplateVersionSchema.index({ status: 1 });
DocumentTemplateVersionSchema.index({ sourceFileId: 1 });
DocumentTemplateVersionSchema.index({ createdBy: 1, createdAt: -1 });

DocumentTemplateVersionSchema.set("toJSON", {
	transform: (_doc, ret: { __v?: number }) => {
		delete ret.__v;
		return ret;
	},
});

export const DocumentTemplateVersion = model<IDocumentTemplateVersionDocument>(
	"DocumentTemplateVersion",
	DocumentTemplateVersionSchema,
);
