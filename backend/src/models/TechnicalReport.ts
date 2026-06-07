import { TechnicalReportStatusSchema } from "@cermont/shared-types";
import { type Document, model, Schema, Types } from "mongoose";

import { FileAssetRefSchema, type FileAssetRef } from "./sub-schemas/FileAssetRefSchema";

export interface TechnicalReportDocument extends Document {
	_id: Types.ObjectId;
	code: string;
	workOrderId: Types.ObjectId;
	executionSessionId: Types.ObjectId;
	serviceCaseId?: Types.ObjectId;
	executionSummary: string;
	activitiesPerformed: string[];
	findings: string[];
	deviations: string[];
	evidenceIds: Types.ObjectId[];
	documentIds: Types.ObjectId[];
	generatedPdfUrl?: string;
	generatedBy: Types.ObjectId;
	generatedAt: Date;
	reviewedBy?: Types.ObjectId;
	reviewedAt?: Date;
	approvedBy?: Types.ObjectId;
	approvedAt?: Date;
	rejectedBy?: Types.ObjectId;
	rejectedAt?: Date;
	rejectionReason?: string;
	status: string;
	clientMutationIds: string[];
	fileAssets: FileAssetRef[];
	createdAt: Date;
	updatedAt: Date;
}

const technicalReportSchema = new Schema<TechnicalReportDocument>(
	{
		code: { type: String, required: true, unique: true, index: true, maxlength: 40 },
		workOrderId: { type: Types.ObjectId, ref: "Order", required: true, index: true },
		executionSessionId: {
			type: Types.ObjectId,
			ref: "ExecutionSession",
			required: true,
			index: true,
		},
		serviceCaseId: { type: Types.ObjectId, ref: "ServiceCase", index: true },
		executionSummary: { type: String, required: true, maxlength: 3000 },
		activitiesPerformed: { type: [String], default: [] },
		findings: { type: [String], default: [] },
		deviations: { type: [String], default: [] },
		evidenceIds: [{ type: Types.ObjectId, ref: "Evidence" }],
		documentIds: [{ type: Types.ObjectId, ref: "Document" }],
		generatedPdfUrl: { type: String, maxlength: 500 },
		generatedBy: { type: Types.ObjectId, ref: "User", required: true },
		generatedAt: { type: Date, required: true },
		reviewedBy: { type: Types.ObjectId, ref: "User" },
		reviewedAt: { type: Date },
		approvedBy: { type: Types.ObjectId, ref: "User" },
		approvedAt: { type: Date },
		rejectedBy: { type: Types.ObjectId, ref: "User" },
		rejectedAt: { type: Date },
		rejectionReason: { type: String, maxlength: 1000 },
		status: {
			type: String,
			enum: TechnicalReportStatusSchema.options,
			default: "draft",
			index: true,
		},
		clientMutationIds: { type: [String], default: [], index: true },
		fileAssets: { type: [FileAssetRefSchema], default: [] },
	},
	{ timestamps: true, versionKey: false },
);

technicalReportSchema.index(
	{ executionSessionId: 1 },
	{ unique: true, partialFilterExpression: { status: { $ne: "cancelled" } } },
);
technicalReportSchema.index({ workOrderId: 1, status: 1 });
technicalReportSchema.index({ serviceCaseId: 1 });
technicalReportSchema.index({ createdAt: -1 });

export const TechnicalReport = model<TechnicalReportDocument>(
	"TechnicalReport",
	technicalReportSchema,
);
