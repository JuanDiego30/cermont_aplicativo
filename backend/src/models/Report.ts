import mongoose, { type Document, Schema } from "mongoose";
import { type FileAssetRef, FileAssetRefSchema } from "./sub-schemas/FileAssetRefSchema";

// ═══════════════════════════════════════════════════════════════════════════════
// Report Model — Per DOC-09 §7 (Diccionario de Datos)
//
// ALIGNMENT WITH @cermont/shared-types:
// ✓ order_id: ObjectId ref to Order
// ✓ title: string, required
// ✓ content: string (optional)
// ✓ report_type: enum ['technical', 'delivery', 'inspection']
// ✓ pdf_url: string (optional)
// ✓ generated_by: ObjectId ref to User (optional)
// ✓ status: enum ['draft', 'generated', 'archived']
// ✓ archive_date: date (optional)
// ✓ created_by: ObjectId ref to User (optional)
// ✓ updated_by: ObjectId ref to User (optional)
// ✓ timestamps: created_at, updated_at
//
// NOTE: Mongoose schema is SSOT for persistence. shared-types schema is SSOT for API contracts.
// ═══════════════════════════════════════════════════════════════════════════════

export const REPORT_TYPES = ["technical", "delivery", "inspection"] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export const REPORT_STATUSES = ["draft", "generated", "archived"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export interface IReport extends Document {
	order_id: mongoose.Types.ObjectId;
	title: string;
	content?: string;
	report_type: ReportType;
	pdf_url?: string;
	generated_by?: mongoose.Types.ObjectId;
	status: ReportStatus;
	archive_date?: Date;
	created_at: Date;
	updated_at: Date;
	created_by?: mongoose.Types.ObjectId;
	updated_by?: mongoose.Types.ObjectId;
	fileAssets: FileAssetRef[];
}

const ReportSchema = new Schema<IReport>(
	{
		order_id: {
			type: Schema.Types.ObjectId,
			ref: "Order",
			required: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
		},
		content: {
			type: String,
			trim: true,
		},
		report_type: {
			type: String,
			enum: REPORT_TYPES,
			required: true,
		},
		pdf_url: {
			type: String,
			trim: true,
		},
		generated_by: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		status: {
			type: String,
			enum: REPORT_STATUSES,
			default: "draft",
		},
		archive_date: {
			type: Date,
		},
		created_by: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		updated_by: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		fileAssets: { type: [FileAssetRefSchema], default: [] },
	},
	{
		timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
		toJSON: {
			transform(_doc, ret) {
				const json = ret as Record<string, unknown>;
				delete json.__v;
				return ret;
			},
		},
	},
);

// Indexes
ReportSchema.index({ order_id: 1 });
ReportSchema.index({ report_type: 1 });
ReportSchema.index({ status: 1 });
ReportSchema.index({ created_at: -1 });

const ReportModel = mongoose.model<IReport>("Report", ReportSchema);

export { ReportModel as Report };
