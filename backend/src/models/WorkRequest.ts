import {
	WorkRequestSourceChannelSchema,
	type WorkRequestStatus,
	WorkRequestStatusSchema,
	WorkRequestUrgencySchema,
} from "@cermont/shared-types";
import mongoose, { type Model, Schema } from "mongoose";

export interface SiteVisitRecord {
	scheduledAt?: Date;
	completedAt?: Date;
	technicianId?: mongoose.Types.ObjectId;
	technicianName?: string;
	notes?: string;
	technicalFindings?: string;
	scopeClarifications?: string;
	estimatedDuration?: number;
	riskNotes?: string;
	evidences: Array<{
		id: mongoose.Types.ObjectId;
		url: string;
		type: "image" | "document" | "video";
		description?: string;
		uploadedAt: Date;
	}>;
	measurements?: {
		value: string;
		unit: string;
		description?: string;
	};
}

export interface WorkRequestRecord {
	code: string;
	status: WorkRequestStatus;
	urgency: string;
	requesterId: mongoose.Types.ObjectId;
	requesterName: string;
	requesterEmail?: string;
	requesterPhone?: string;
	clientId?: mongoose.Types.ObjectId;
	clientName: string;
	serviceSite: string;
	serviceType: string;
	billingAccount?: string;
	assetId?: mongoose.Types.ObjectId;
	assetName?: string;
	assetLocation?: string;
	serialTag?: string;
	sourceChannel: string;
	shortDescription: string;
	description: string;
	requestedDate?: Date;
	incidentDate?: Date;
	tags: string[];
	classifications: string[];
	initialEvidences: Array<{
		id: mongoose.Types.ObjectId;
		url: string;
		type: "image" | "document" | "video";
		description?: string;
		uploadedAt: Date;
	}>;
	requiresSiteVisit: boolean;
	visitNotes?: string;
	visit?: SiteVisitRecord;
	assignedTo?: mongoose.Types.ObjectId;
	assignedToName?: string;
	linkedProposalId?: mongoose.Types.ObjectId;
	linkedProposalCode?: string;
	linkedOrderId?: mongoose.Types.ObjectId;
	linkedOrderCode?: string;
	resolution?: string;
	resolvedAt?: Date;
	customFields?: Map<string, string | number | boolean>;
	archived: boolean;
	createdBy: mongoose.Types.ObjectId;
	updatedBy?: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const EvidenceSchema = new Schema(
	{
		id: { type: Schema.Types.ObjectId, required: true, auto: true },
		url: { type: String, required: true, trim: true },
		type: { type: String, enum: ["image", "document", "video"], required: true },
		description: { type: String, trim: true, maxlength: 300 },
		uploadedAt: { type: Date, default: Date.now },
	},
	{ _id: false },
);

const SiteVisitSchema = new Schema(
	{
		scheduledAt: { type: Date },
		completedAt: { type: Date },
		technicianId: { type: Schema.Types.ObjectId, ref: "User" },
		technicianName: { type: String, trim: true, maxlength: 200 },
		notes: { type: String, trim: true, maxlength: 1000 },
		technicalFindings: { type: String, trim: true, maxlength: 3000 },
		scopeClarifications: { type: String, trim: true, maxlength: 3000 },
		estimatedDuration: { type: Number, min: 0 },
		riskNotes: { type: String, trim: true, maxlength: 1000 },
		evidences: { type: [EvidenceSchema], default: [] },
		measurements: {
			value: { type: String, maxlength: 200 },
			unit: { type: String, maxlength: 50 },
			description: { type: String, maxlength: 500 },
		},
	},
	{ _id: false },
);

const WorkRequestSchema = new Schema<WorkRequestRecord>(
	{
		code: {
			type: String,
			required: true,
			unique: true,
			index: true,
			trim: true,
		},
		status: {
			type: String,
			enum: WorkRequestStatusSchema.options,
			default: "submitted",
			index: true,
		},
		urgency: {
			type: String,
			enum: WorkRequestUrgencySchema.options,
			default: "medium",
			index: true,
		},
		requesterId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		requesterName: { type: String, required: true, trim: true, maxlength: 200 },
		requesterEmail: { type: String, trim: true, lowercase: true },
		requesterPhone: { type: String, trim: true, maxlength: 30 },
		clientId: { type: Schema.Types.ObjectId, ref: "User", index: true },
		clientName: { type: String, required: true, trim: true, maxlength: 200, index: true },
		serviceSite: { type: String, required: true, trim: true, maxlength: 300 },
		serviceType: { type: String, required: true, trim: true, maxlength: 120, index: true },
		billingAccount: { type: String, trim: true, maxlength: 200 },
		assetId: { type: Schema.Types.ObjectId, ref: "Asset", index: true },
		assetName: { type: String, trim: true, maxlength: 200 },
		assetLocation: { type: String, trim: true, maxlength: 300 },
		serialTag: { type: String, trim: true, maxlength: 120 },
		sourceChannel: {
			type: String,
			enum: WorkRequestSourceChannelSchema.options,
			required: true,
			index: true,
		},
		shortDescription: { type: String, required: true, trim: true, maxlength: 200 },
		description: { type: String, required: true, trim: true, maxlength: 3000 },
		requestedDate: { type: Date },
		incidentDate: { type: Date },
		tags: { type: [String], default: [] },
		classifications: { type: [String], default: [] },
		initialEvidences: { type: [EvidenceSchema], default: [] },
		requiresSiteVisit: { type: Boolean, default: false },
		visitNotes: { type: String, trim: true, maxlength: 1000 },
		visit: { type: SiteVisitSchema, default: undefined },
		assignedTo: { type: Schema.Types.ObjectId, ref: "User", index: true },
		assignedToName: { type: String, trim: true },
		linkedProposalId: { type: Schema.Types.ObjectId, ref: "Proposal" },
		linkedProposalCode: { type: String, trim: true },
		linkedOrderId: { type: Schema.Types.ObjectId, ref: "Order" },
		linkedOrderCode: { type: String, trim: true },
		resolution: { type: String, trim: true, maxlength: 500 },
		resolvedAt: { type: Date },
		customFields: {
			type: Map,
			of: Schema.Types.Mixed,
			default: {},
		},
		archived: { type: Boolean, default: false, index: true },
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		updatedBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{
		timestamps: true,
	},
);

WorkRequestSchema.index({ status: 1, createdAt: -1 });
WorkRequestSchema.index({ clientId: 1, createdAt: -1 });
WorkRequestSchema.index({ clientName: "text", shortDescription: "text", description: "text" });

function getWorkRequestModel(): Model<WorkRequestRecord> {
	const existingModel = mongoose.models.WorkRequest;
	if (existingModel) {
		return existingModel as Model<WorkRequestRecord>;
	}
	return mongoose.model<WorkRequestRecord>("WorkRequest", WorkRequestSchema);
}

export const WorkRequest = getWorkRequestModel();
