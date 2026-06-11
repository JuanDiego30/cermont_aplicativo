import { SiteVisitRecordStatusSchema } from "@cermont/shared-types";
import { type Document, model, Schema, Types } from "mongoose";

const siteVisitMeasurementSchema = new Schema(
	{
		label: { type: String, required: true, maxlength: 200 },
		value: { type: String, required: true, maxlength: 200 },
		unit: { type: String, maxlength: 50 },
	},
	{ _id: false },
);

const siteVisitFindingSchema = new Schema(
	{
		description: { type: String, required: true, maxlength: 500 },
		severity: {
			type: String,
			enum: ["low", "medium", "high", "critical"],
			default: "medium",
		},
		category: {
			type: String,
			enum: ["safety", "access", "measurement", "resource", "documentation", "other"],
			default: "other",
		},
	},
	{ _id: false },
);

const siteVisitPhotoSchema = new Schema(
	{
		url: { type: String, required: true },
		caption: { type: String, maxlength: 300 },
		takenAt: { type: Date },
	},
	{ _id: false },
);

const siteVisitCommandHistorySchema = new Schema(
	{
		clientMutationId: { type: String, required: true },
		command: { type: String, required: true, maxlength: 80 },
		recordedAt: { type: Date, required: true },
	},
	{ _id: false },
);

export interface SiteVisitDocument extends Document {
	_id: Types.ObjectId;
	code: string;
	workRequestId: Types.ObjectId;
	serviceCaseId: Types.ObjectId;
	clientId: Types.ObjectId;
	clientName: string;
	visitDate: Date;
	location: string;
	responsibleUserId: Types.ObjectId;
	responsibleName: string;
	measurements: Array<{ label: string; value: string; unit?: string }>;
	findings: Array<{
		description: string;
		severity: "low" | "medium" | "high" | "critical";
		category: "safety" | "access" | "measurement" | "resource" | "documentation" | "other";
	}>;
	photos: Array<{ url: string; caption?: string; takenAt?: Date }>;
	requirements?: string;
	identifiedRisks?: string;
	recommendations?: string;
	observations?: string;
	commandHistory: Array<{ clientMutationId: string; command: string; recordedAt: Date }>;
	status: string;
	startedAt?: Date;
	completedAt?: Date;
	cancelledAt?: Date;
	cancellationReason?: string;
	createdBy: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const siteVisitSchema = new Schema<SiteVisitDocument>(
	{
		code: { type: String, required: true, maxlength: 40, index: true },
		workRequestId: { type: Types.ObjectId, ref: "WorkRequest", required: true, index: true },
		serviceCaseId: { type: Types.ObjectId, ref: "ServiceCase", required: true, index: true },
		clientId: { type: Types.ObjectId, ref: "User", required: true, index: true },
		clientName: { type: String, required: true, maxlength: 200 },
		visitDate: { type: Date, required: true },
		location: { type: String, required: true, maxlength: 500 },
		responsibleUserId: { type: Types.ObjectId, ref: "User", required: true, index: true },
		responsibleName: { type: String, required: true, maxlength: 200 },
		measurements: { type: [siteVisitMeasurementSchema], default: [] },
		findings: { type: [siteVisitFindingSchema], default: [] },
		photos: { type: [siteVisitPhotoSchema], default: [] },
		requirements: { type: String, maxlength: 2000 },
		identifiedRisks: { type: String, maxlength: 2000 },
		recommendations: { type: String, maxlength: 2000 },
		observations: { type: String, maxlength: 2000 },
		commandHistory: { type: [siteVisitCommandHistorySchema], default: [] },
		status: {
			type: String,
			enum: SiteVisitRecordStatusSchema.options,
			default: "scheduled",
			index: true,
		},
		startedAt: { type: Date },
		completedAt: { type: Date },
		cancelledAt: { type: Date },
		cancellationReason: { type: String, maxlength: 500 },
		createdBy: { type: Types.ObjectId, ref: "User", required: true },
	},
	{ timestamps: true },
);

// ── Índices compuestos ─────────────────────────────────────────────────
siteVisitSchema.index({ workRequestId: 1 });
siteVisitSchema.index({ status: 1, createdAt: -1 });
siteVisitSchema.index({ clientId: 1, createdAt: -1 });

export const SiteVisitModel = model<SiteVisitDocument>("SiteVisit", siteVisitSchema);
