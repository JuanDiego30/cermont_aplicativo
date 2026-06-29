import { type Document, model, Schema } from "mongoose";

export interface IPrivacyRequest extends Document {
	userId: string;
	type: "access" | "rectification" | "erasure" | "restriction" | "portability";
	status: "pending" | "in_progress" | "completed" | "rejected";
	description: string;
	submittedAt: Date;
	resolvedAt?: Date;
	resolvedBy?: string;
	resolutionNotes?: string;
}

const PrivacyRequestSchema = new Schema<IPrivacyRequest>(
	{
		userId: { type: String, required: true, index: true },
		type: {
			type: String,
			required: true,
			enum: ["access", "rectification", "erasure", "restriction", "portability"],
		},
		status: {
			type: String,
			required: true,
			enum: ["pending", "in_progress", "completed", "rejected"],
			default: "pending",
		},
		description: { type: String, required: true, maxlength: 2000 },
		submittedAt: { type: Date, default: Date.now },
		resolvedAt: { type: Date },
		resolvedBy: { type: String },
		resolutionNotes: { type: String },
	},
	{ timestamps: true },
);

PrivacyRequestSchema.index({ userId: 1, status: 1 });
PrivacyRequestSchema.index({ status: 1, submittedAt: -1 });

export const PrivacyRequest = model<IPrivacyRequest>("PrivacyRequest", PrivacyRequestSchema);
