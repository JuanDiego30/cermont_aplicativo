import { type Document, model, Schema, Types } from "mongoose";

export interface DlqEntryDocument extends Document {
	_id: Types.ObjectId;
	idempotencyKey: string;
	operation: string;
	entityType: string;
	entityId: string;
	provider: string;
	requestPayload: Record<string, unknown>;
	errorMessage: string;
	errorCode: string;
	retryCount: number;
	maxRetries: number;
	lastAttemptAt: Date;
	nextRetryAt: Date | null;
	status: "pending_retry" | "permanent_failure" | "retried" | "manual_retry";
	resolvedAt: Date | null;
	resolvedBy: Types.ObjectId | null;
	createdAt: Date;
	updatedAt: Date;
}

const DlqEntrySchema = new Schema<DlqEntryDocument>(
	{
		idempotencyKey: { type: String, required: true, maxlength: 128 },
		operation: { type: String, required: true, maxlength: 100 },
		entityType: { type: String, required: true, maxlength: 50 },
		entityId: { type: String, required: true, maxlength: 100 },
		provider: { type: String, required: true, maxlength: 50 },
		requestPayload: { type: Schema.Types.Mixed, default: {} },
		errorMessage: { type: String, required: true, maxlength: 2000 },
		errorCode: { type: String, required: true, maxlength: 100 },
		retryCount: { type: Number, required: true, min: 0, default: 0 },
		maxRetries: { type: Number, required: true, min: 1, default: 3 },
		lastAttemptAt: { type: Date, required: true, default: Date.now },
		nextRetryAt: { type: Date, default: null },
		status: {
			type: String,
			enum: ["pending_retry", "permanent_failure", "retried", "manual_retry"],
			required: true,
			default: "pending_retry",
			index: true,
		},
		resolvedAt: { type: Date, default: null },
		resolvedBy: { type: Types.ObjectId, ref: "User", default: null },
	},
	{ timestamps: true },
);

DlqEntrySchema.index({ idempotencyKey: 1 }, { unique: true });
DlqEntrySchema.index({ status: 1, nextRetryAt: 1 });
DlqEntrySchema.index({ provider: 1, status: 1 });

export const DlqEntry = model<DlqEntryDocument>("DlqEntry", DlqEntrySchema);
