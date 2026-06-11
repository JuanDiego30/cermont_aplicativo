import type { ASTStatus } from "@cermont/shared-types";
import mongoose, { type Model, Schema } from "mongoose";

export interface ASTStepRecord {
	stepNumber: number;
	taskDescription: string;
	hazards: string[];
	controls: string[];
	responsible?: string;
}

export interface ASTSignatureRecord {
	signatureId: string;
	signedBy: mongoose.Types.ObjectId;
	signedByName: string;
	role: string;
	signatureType: "technician" | "supervisor" | "client" | "hes";
	signatureUrl?: string;
	signedAt: Date;
	confirmed: boolean;
}

export interface SafetyAnalysisRecord {
	orderId: mongoose.Types.ObjectId;
	executionSessionId?: mongoose.Types.ObjectId;
	status: ASTStatus;
	workDescription: string;
	location: string;
	date: Date;
	crewLeader: string;
	crewMembers: string[];
	steps: ASTStepRecord[];
	additionalControls?: string;
	ppeRequired: string[];
	emergencyPlan?: string;
	elaboratedBy?: ASTSignatureRecord;
	reviewedBy?: ASTSignatureRecord;
	approvedBy?: ASTSignatureRecord;
	socializedAt?: Date;
	createdBy: mongoose.Types.ObjectId;
	updatedBy?: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const astStepSchema = new Schema<ASTStepRecord>(
	{
		stepNumber: { type: Number, required: true, min: 1 },
		taskDescription: { type: String, required: true, maxlength: 500 },
		hazards: { type: [String], default: [] },
		controls: { type: [String], default: [] },
		responsible: { type: String, maxlength: 200 },
	},
	{ _id: false },
);

const astSignatureSchema = new Schema<ASTSignatureRecord>(
	{
		signatureId: { type: String, required: true, maxlength: 80 },
		signedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
		signedByName: { type: String, required: true, maxlength: 200 },
		role: { type: String, required: true, maxlength: 80 },
		signatureType: {
			type: String,
			enum: ["technician", "supervisor", "client", "hes"],
			required: true,
		},
		signatureUrl: { type: String },
		signedAt: { type: Date, required: true },
		confirmed: { type: Boolean, default: false },
	},
	{ _id: false },
);

const safetyAnalysisSchema = new Schema<SafetyAnalysisRecord>(
	{
		orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
		executionSessionId: { type: Schema.Types.ObjectId, ref: "ExecutionSession" },
		status: {
			type: String,
			enum: ["draft", "reviewed", "approved", "completed", "cancelled"],
			default: "draft",
			index: true,
		},
		workDescription: { type: String, required: true, maxlength: 500 },
		location: { type: String, required: true, maxlength: 200 },
		date: { type: Date, required: true },
		crewLeader: { type: String, required: true, maxlength: 200 },
		crewMembers: { type: [String], default: [] },
		steps: { type: [astStepSchema], default: [] },
		additionalControls: { type: String, maxlength: 500 },
		ppeRequired: { type: [String], default: [] },
		emergencyPlan: { type: String, maxlength: 500 },
		elaboratedBy: { type: astSignatureSchema },
		reviewedBy: { type: astSignatureSchema },
		approvedBy: { type: astSignatureSchema },
		socializedAt: { type: Date },
		createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
		updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true },
);

safetyAnalysisSchema.index({ orderId: 1, status: 1 });
safetyAnalysisSchema.index({ status: 1, createdAt: -1 });

export const SafetyAnalysisModel: Model<SafetyAnalysisRecord> =
	mongoose.model<SafetyAnalysisRecord>("SafetyAnalysis", safetyAnalysisSchema);
