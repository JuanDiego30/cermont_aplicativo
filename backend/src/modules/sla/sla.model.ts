import type { SlaConfig, SlaPriority, SlaStatus } from "@cermont/shared-types";
import { type Document, model, Schema, Types } from "mongoose";

export interface SLAConfigDocument extends Document {
	configs: SlaConfig[];
	updatedBy?: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

export interface SLATrackingDocument extends Document {
	serviceCaseId: Types.ObjectId;
	serviceType: string;
	priority: SlaPriority;
	assignedAt: Date;
	responseDeadline: Date;
	escalationDeadline: Date;
	resolutionDeadline: Date;
	firstResponseAt?: Date;
	resolvedAt?: Date;
	status: SlaStatus;
	currentStep: string;
	breachReason?: string;
	escalationLevel: number;
	notifiedAt: Date[];
	createdAt: Date;
	updatedAt: Date;
}

const slaConfigEntrySchema = new Schema<SlaConfig>(
	{
		serviceType: { type: String, required: true },
		clientId: { type: String },
		priority: {
			type: String,
			enum: ["low", "medium", "high", "critical"],
			required: true,
		},
		responseHours: { type: Number, required: true, min: 1 },
		resolutionHours: { type: Number, required: true, min: 1 },
		escalationHours: { type: Number, required: true, min: 1 },
		penaltyRate: { type: Number, min: 0 },
		description: { type: String, maxlength: 300 },
		isActive: { type: Boolean, default: true },
	},
	{ _id: false },
);

const slaConfigSchema = new Schema<SLAConfigDocument>(
	{
		configs: { type: [slaConfigEntrySchema], default: [] },
		updatedBy: { type: Types.ObjectId, ref: "User" },
	},
	{ timestamps: true },
);

slaConfigSchema.index({ "configs.serviceType": 1, "configs.priority": 1 });

const slaTrackingSchema = new Schema<SLATrackingDocument>(
	{
		serviceCaseId: { type: Types.ObjectId, ref: "ServiceCase", required: true, unique: true },
		serviceType: { type: String, required: true },
		priority: { type: String, required: true },
		assignedAt: { type: Date, required: true, default: Date.now },
		responseDeadline: { type: Date, required: true },
		escalationDeadline: { type: Date, required: true },
		resolutionDeadline: { type: Date, required: true },
		firstResponseAt: { type: Date },
		resolvedAt: { type: Date },
		status: {
			type: String,
			enum: ["active", "breached", "at_risk", "resolved", "escalated"],
			default: "active",
		},
		currentStep: { type: String, default: "work_request" },
		breachReason: { type: String, maxlength: 300 },
		escalationLevel: { type: Number, default: 0 },
		notifiedAt: { type: [Date], default: [] },
	},
	{ timestamps: true },
);

slaTrackingSchema.index({ status: 1 });
slaTrackingSchema.index({ responseDeadline: 1 });
slaTrackingSchema.index({ escalationDeadline: 1 });
slaTrackingSchema.index({ resolutionDeadline: 1 });

export const SLAConfigModel = model<SLAConfigDocument>("SLAConfig", slaConfigSchema);
export const SLATrackingModel = model<SLATrackingDocument>("SLATracking", slaTrackingSchema);
