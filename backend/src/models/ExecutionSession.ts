import {
	ExecutionOfflineSyncStatusSchema,
	ExecutionSessionStatusSchema,
} from "@cermont/shared-types";
import { type Document, model, Schema, Types } from "mongoose";
import { type FileAssetRef, FileAssetRefSchema } from "./sub-schemas/FileAssetRefSchema";

const gpsPointSchema = new Schema(
	{
		lat: { type: Number, required: true, min: -90, max: 90 },
		lng: { type: Number, required: true, min: -180, max: 180 },
		accuracy: { type: Number, min: 0 },
		capturedAt: { type: Date, required: true },
	},
	{ _id: false },
);

const checklistResponseSchema = new Schema(
	{
		responseId: { type: String, required: true, maxlength: 80 },
		checklistId: { type: String, required: true, maxlength: 120 },
		itemId: { type: String, required: true, maxlength: 120 },
		label: { type: String, required: true, maxlength: 500 },
		value: { type: Schema.Types.Mixed, required: true },
		required: { type: Boolean, default: false },
		evidenceIds: [{ type: Types.ObjectId, ref: "Evidence" }],
		answeredAt: { type: Date, required: true },
		answeredBy: { type: Types.ObjectId, ref: "User", required: true },
	},
	{ _id: false },
);

const dynamicFormResponseSchema = new Schema(
	{
		responseId: { type: String, required: true, maxlength: 80 },
		templateId: { type: Types.ObjectId, ref: "DocumentTemplate" },
		templateResponseId: { type: Types.ObjectId, ref: "TemplateResponse" },
		fieldKey: { type: String, required: true, maxlength: 120 },
		label: { type: String, required: true, maxlength: 500 },
		value: { type: Schema.Types.Mixed, required: true },
		required: { type: Boolean, default: false },
		evidenceIds: [{ type: Types.ObjectId, ref: "Evidence" }],
		answeredAt: { type: Date, required: true },
		answeredBy: { type: Types.ObjectId, ref: "User", required: true },
	},
	{ _id: false },
);

const materialUsageSchema = new Schema(
	{
		usageId: { type: String, required: true, maxlength: 80 },
		materialId: { type: Types.ObjectId, ref: "Resource" },
		name: { type: String, required: true, maxlength: 200 },
		quantityPlanned: { type: Number, default: 0, min: 0 },
		quantityUsed: { type: Number, required: true, min: 0 },
		unit: { type: String, required: true, maxlength: 50 },
		notes: { type: String, maxlength: 500 },
		recordedAt: { type: Date, required: true },
		recordedBy: { type: Types.ObjectId, ref: "User", required: true },
	},
	{ _id: false },
);

const toolUsageSchema = new Schema(
	{
		usageId: { type: String, required: true, maxlength: 80 },
		toolId: { type: Types.ObjectId, ref: "Asset" },
		name: { type: String, required: true, maxlength: 200 },
		quantityPlanned: { type: Number, default: 0, min: 0 },
		quantityUsed: { type: Number, required: true, min: 0 },
		condition: { type: String, default: "ok" },
		notes: { type: String, maxlength: 500 },
		recordedAt: { type: Date, required: true },
		recordedBy: { type: Types.ObjectId, ref: "User", required: true },
	},
	{ _id: false },
);

const equipmentUsageSchema = new Schema(
	{
		usageId: { type: String, required: true, maxlength: 80 },
		equipmentId: { type: Types.ObjectId, ref: "Asset" },
		name: { type: String, required: true, maxlength: 200 },
		startedAt: { type: Date, required: true },
		endedAt: { type: Date },
		hoursUsed: { type: Number, min: 0 },
		condition: { type: String, default: "ok" },
		notes: { type: String, maxlength: 500 },
		recordedAt: { type: Date, required: true },
		recordedBy: { type: Types.ObjectId, ref: "User", required: true },
	},
	{ _id: false },
);

const laborEntrySchema = new Schema(
	{
		laborEntryId: { type: String, required: true, maxlength: 80 },
		userId: { type: Types.ObjectId, ref: "User", required: true },
		role: { type: String, required: true, maxlength: 80 },
		startedAt: { type: Date, required: true },
		endedAt: { type: Date, required: true },
		durationMinutes: { type: Number, required: true, min: 1 },
		description: { type: String, required: true, maxlength: 500 },
		notes: { type: String, maxlength: 500 },
	},
	{ _id: false },
);

const incidentSchema = new Schema(
	{
		incidentId: { type: String, required: true, maxlength: 80 },
		type: { type: String, required: true },
		severity: { type: String, required: true },
		description: { type: String, required: true, maxlength: 2000 },
		actionTaken: { type: String, maxlength: 2000 },
		occurredAt: { type: Date, required: true },
		reportedBy: { type: Types.ObjectId, ref: "User", required: true },
		evidenceIds: [{ type: Types.ObjectId, ref: "Evidence" }],
		resolved: { type: Boolean, default: false },
		resolvedAt: { type: Date },
		resolvedBy: { type: Types.ObjectId, ref: "User" },
	},
	{ _id: false },
);

const observationSchema = new Schema(
	{
		observationId: { type: String, required: true, maxlength: 80 },
		description: { type: String, required: true, maxlength: 2000 },
		createdAt: { type: Date, required: true },
		createdBy: { type: Types.ObjectId, ref: "User", required: true },
	},
	{ _id: false },
);

const signatureSchema = new Schema(
	{
		signatureId: { type: String, required: true, maxlength: 80 },
		signedBy: { type: Types.ObjectId, ref: "User", required: true },
		signedByName: { type: String, required: true, maxlength: 200 },
		role: { type: String, required: true, maxlength: 80 },
		signatureType: { type: String, required: true },
		imageDocumentId: { type: Types.ObjectId, ref: "Document" },
		signatureUrl: { type: String, maxlength: 500 },
		signedAt: { type: Date, required: true },
		confirmed: { type: Boolean, default: false },
	},
	{ _id: false },
);

const evidenceReferenceSchema = new Schema(
	{
		evidenceId: { type: Types.ObjectId, ref: "Evidence", required: true },
		documentId: { type: Types.ObjectId, ref: "Document" },
		type: { type: String, required: true },
		phase: { type: String, default: "during" },
		description: { type: String, maxlength: 500 },
		fieldRef: { type: String, maxlength: 120 },
		incidentId: { type: String, maxlength: 80 },
		materialUsageId: { type: String, maxlength: 80 },
		gpsPoint: { type: gpsPointSchema },
		uploadedBy: { type: Types.ObjectId, ref: "User", required: true },
		uploadedAt: { type: Date, required: true },
	},
	{ _id: false },
);

const blockerSchema = new Schema(
	{
		code: { type: String, required: true },
		message: { type: String, required: true, maxlength: 300 },
		severity: { type: String, default: "blocking" },
	},
	{ _id: false },
);

const nextActionSchema = new Schema(
	{
		code: { type: String, required: true },
		label: { type: String, required: true, maxlength: 200 },
		route: { type: String, maxlength: 200 },
	},
	{ _id: false },
);

type ExecutionRecordValue =
	| string
	| number
	| boolean
	| Date
	| Types.ObjectId
	| string[]
	| Types.ObjectId[]
	| ExecutionRecord[];

interface ExecutionRecord {
	[key: string]: ExecutionRecordValue | ExecutionRecord;
}

export interface ExecutionSessionDocument extends Document {
	_id: Types.ObjectId;
	code: string;
	workOrderId: Types.ObjectId;
	planningPacketId?: Types.ObjectId;
	serviceCaseId?: Types.ObjectId;
	status: string;
	startedAt?: Date;
	pausedAt?: Date;
	resumedAt?: Date;
	completedAt?: Date;
	cancelledAt?: Date;
	cancellationReason?: string;
	startedBy?: Types.ObjectId;
	completedBy?: Types.ObjectId;
	assignedCrew: Types.ObjectId[];
	checklistResponses: ExecutionRecord[];
	dynamicFormResponses: ExecutionRecord[];
	materialsUsed: ExecutionRecord[];
	toolsUsed: ExecutionRecord[];
	equipmentUsed: ExecutionRecord[];
	laborEntries: ExecutionRecord[];
	incidents: ExecutionRecord[];
	observations: ExecutionRecord[];
	signatures: ExecutionRecord[];
	evidenceIds: Types.ObjectId[];
	evidences: ExecutionRecord[];
	documentImportIds: Types.ObjectId[];
	fileAssets: FileAssetRef[];
	gpsPoints: ExecutionRecord[];
	offlineSyncStatus: string;
	lastSyncedAt?: Date;
	clientMutationIds: string[];
	blockers: ExecutionRecord[];
	nextActions: ExecutionRecord[];
	preflightChecklist?: ExecutionRecord;
	createdBy: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const preflightGateItemSchema = new Schema(
	{
		key: { type: String, required: true, maxlength: 80 },
		label: { type: String, required: true, maxlength: 300 },
		isBlocking: { type: Boolean, default: true },
		isChecked: { type: Boolean, default: false },
		checkedAt: { type: Date },
		checkedBy: { type: Types.ObjectId, ref: "User" },
	},
	{ _id: false },
);

const preflightChecklistSchema = new Schema(
	{
		eppComplete: { type: Boolean, default: false },
		astSigned: { type: Boolean, default: false },
		ptwObtained: { type: Boolean, default: false },
		toolsValidated: { type: Boolean, default: false },
		vehicleDocumentsOk: { type: Boolean, default: false },
		certificationsCurrent: { type: Boolean, default: false },
		items: { type: [preflightGateItemSchema], default: [] },
		completedAt: { type: Date },
		completedBy: { type: Types.ObjectId, ref: "User" },
	},
	{ _id: false },
);

const executionSessionSchema = new Schema<ExecutionSessionDocument>(
	{
		code: { type: String, required: true, unique: true, index: true, maxlength: 40 },
		workOrderId: { type: Types.ObjectId, ref: "Order", required: true, index: true },
		planningPacketId: { type: Types.ObjectId, ref: "PlanningPacket", index: true },
		serviceCaseId: { type: Types.ObjectId, ref: "ServiceCase", index: true },
		status: {
			type: String,
			enum: ExecutionSessionStatusSchema.options,
			default: "draft",
			index: true,
		},
		startedAt: { type: Date },
		pausedAt: { type: Date },
		resumedAt: { type: Date },
		completedAt: { type: Date },
		cancelledAt: { type: Date },
		cancellationReason: { type: String, maxlength: 800 },
		startedBy: { type: Types.ObjectId, ref: "User" },
		completedBy: { type: Types.ObjectId, ref: "User" },
		assignedCrew: [{ type: Types.ObjectId, ref: "User" }],
		checklistResponses: { type: [checklistResponseSchema], default: [] },
		dynamicFormResponses: { type: [dynamicFormResponseSchema], default: [] },
		materialsUsed: { type: [materialUsageSchema], default: [] },
		toolsUsed: { type: [toolUsageSchema], default: [] },
		equipmentUsed: { type: [equipmentUsageSchema], default: [] },
		laborEntries: { type: [laborEntrySchema], default: [] },
		incidents: { type: [incidentSchema], default: [] },
		observations: { type: [observationSchema], default: [] },
		signatures: { type: [signatureSchema], default: [] },
		evidenceIds: [{ type: Types.ObjectId, ref: "Evidence" }],
		evidences: { type: [evidenceReferenceSchema], default: [] },
		documentImportIds: [{ type: Types.ObjectId, ref: "DocumentImport" }],
		fileAssets: { type: [FileAssetRefSchema], default: [] },
		gpsPoints: { type: [gpsPointSchema], default: [] },
		offlineSyncStatus: {
			type: String,
			enum: ExecutionOfflineSyncStatusSchema.options,
			default: "synced",
			index: true,
		},
		lastSyncedAt: { type: Date },
		clientMutationIds: { type: [String], default: [], index: true },
		blockers: { type: [blockerSchema], default: [] },
		nextActions: { type: [nextActionSchema], default: [] },
		preflightChecklist: { type: preflightChecklistSchema },
		createdBy: { type: Types.ObjectId, ref: "User", required: true },
	},
	{ timestamps: true, versionKey: false },
);

executionSessionSchema.index({ workOrderId: 1, status: 1 });
executionSessionSchema.index({ planningPacketId: 1 });
executionSessionSchema.index({ serviceCaseId: 1 });
executionSessionSchema.index({ startedAt: -1 });
executionSessionSchema.index({ completedAt: -1 });
executionSessionSchema.index({ assignedCrew: 1 });
executionSessionSchema.index({ createdAt: -1 });
executionSessionSchema.index(
	{ workOrderId: 1 },
	{ unique: true, partialFilterExpression: { status: { $ne: "cancelled" } } },
);

export const ExecutionSession = model<ExecutionSessionDocument>(
	"ExecutionSession",
	executionSessionSchema,
);
