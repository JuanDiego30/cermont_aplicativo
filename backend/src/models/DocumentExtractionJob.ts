import { type Document, model, Schema, type Types } from "mongoose";

/**
 * DocumentExtractionJob Mongoose Model
 *
 * Represents an active background task that extracts layouts, fields, and tables from an ingested document.
 * Maps to @cermont/shared-types/schemas/document-ingestion.schema.ts
 */

export interface IDocumentExtractionJobDocument extends Document {
	_id: Types.ObjectId;
	documentSourceFileId: Types.ObjectId;
	adapter:
		| "sheetjs"
		| "pdf_basic"
		| "docling_sidecar"
		| "paddleocr_sidecar"
		| "unstructured_sidecar"
		| "manual";
	status: "queued" | "processing" | "completed" | "failed" | "cancelled";
	startedAt?: Date;
	finishedAt?: Date;
	errorCode?: string;
	errorMessage?: string;
	retryCount: number;
	confidence?: number;
	requiresHumanReview: boolean;
	createdBy: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const DocumentExtractionJobSchema = new Schema<IDocumentExtractionJobDocument>(
	{
		documentSourceFileId: { type: Schema.Types.ObjectId, ref: "Document", required: true },
		adapter: {
			type: String,
			enum: [
				"sheetjs",
				"pdf_basic",
				"docling_sidecar",
				"paddleocr_sidecar",
				"unstructured_sidecar",
				"manual",
			],
			required: true,
		},
		status: {
			type: String,
			enum: ["queued", "processing", "completed", "failed", "cancelled"],
			default: "queued",
		},
		startedAt: { type: Date },
		finishedAt: { type: Date },
		errorCode: { type: String },
		errorMessage: { type: String },
		retryCount: { type: Number, default: 0 },
		confidence: { type: Number },
		requiresHumanReview: { type: Boolean, default: false },
		createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

DocumentExtractionJobSchema.index({ status: 1 });
DocumentExtractionJobSchema.index({ documentSourceFileId: 1 });

export const DocumentExtractionJob = model<IDocumentExtractionJobDocument>(
	"DocumentExtractionJob",
	DocumentExtractionJobSchema,
);
