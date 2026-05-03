import type mongoose from "mongoose";
import { type Document, model, Schema, type Types } from "mongoose";

// ═══════════════════════════════════════════════════════════════════════════════
// WorkReport Model — Per DOC-09 §7 (Diccionario de Datos)
// ═══════════════════════════════════════════════════════════════════════════════

export const WORK_REPORT_STATUSES = ["draft", "pending_review", "approved", "rejected"] as const;
export type WorkReportStatus = (typeof WORK_REPORT_STATUSES)[number];

export interface IWorkReportDocument extends Document {
	orderId: Types.ObjectId;
	title: string;
	summary: string;
	status: WorkReportStatus;
	generatedBy: Types.ObjectId;
	approvedBy?: Types.ObjectId;
	approvedAt?: Date;
	rejectionReason?: string;
	pdfPath?: string;
	includesChecklist: boolean;
	includesCosts: boolean;
	includesEvidences: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const WorkReportSchema = new Schema<IWorkReportDocument>(
	{
		orderId: {
			type: Schema.Types.ObjectId,
			ref: "Order",
			required: true,
			unique: true,
			index: true,
		},
		title: { type: String, required: true, trim: true, maxlength: 200 },
		summary: { type: String, required: true, trim: true, maxlength: 2000 },
		status: { type: String, enum: WORK_REPORT_STATUSES, default: "draft", index: true },
		generatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
		approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
		approvedAt: { type: Date },
		rejectionReason: { type: String, trim: true, maxlength: 2000 },
		pdfPath: { type: String, trim: true },
		includesChecklist: { type: Boolean, default: false },
		includesCosts: { type: Boolean, default: false },
		includesEvidences: { type: Boolean, default: false },
	},
	{ timestamps: true, versionKey: false },
);

WorkReportSchema.pre("save", function syncApprovalTimestamp(this: IWorkReportDocument) {
	if (this.isModified("status") && this.status === "approved" && !this.approvedAt) {
		this.approvedAt = new Date();
	}
});

WorkReportSchema.set("toJSON", {
	transform: (_doc, ret) => {
		const obj = ret as unknown as Record<string, unknown>;
		delete obj.__v;
		return obj;
	},
});

export const WorkReport = model<IWorkReportDocument>("WorkReport", WorkReportSchema);

// Legacy Report Model (if still needed by some scripts, otherwise can be removed)
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
}

const ReportSchema = new Schema<IReport>(
	{
		order_id: { type: Schema.Types.ObjectId, ref: "Order", required: true },
		title: { type: String, required: true, trim: true },
		content: { type: String, trim: true },
		report_type: { type: String, enum: REPORT_TYPES, required: true },
		pdf_url: { type: String, trim: true },
		generated_by: { type: Schema.Types.ObjectId, ref: "User" },
		status: { type: String, enum: REPORT_STATUSES, default: "draft" },
		archive_date: { type: Date },
		created_by: { type: Schema.Types.ObjectId, ref: "User" },
		updated_by: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

export const Report = model<IReport>("Report", ReportSchema);
