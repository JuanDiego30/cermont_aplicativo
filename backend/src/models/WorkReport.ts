import { type Document, model, Schema, Types } from "mongoose";

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
		orderId: { type: Types.ObjectId, ref: "Order", required: true, unique: true, index: true },
		title: { type: String, required: true, trim: true, maxlength: 200 },
		summary: { type: String, required: true, trim: true, maxlength: 2000 },
		status: { type: String, enum: WORK_REPORT_STATUSES, default: "draft", index: true },
		generatedBy: { type: Types.ObjectId, ref: "User", required: true },
		approvedBy: { type: Types.ObjectId, ref: "User" },
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
