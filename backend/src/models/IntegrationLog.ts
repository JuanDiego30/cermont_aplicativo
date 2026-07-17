import { type Document, model, Schema, Types } from "mongoose";

export interface IntegrationLogDocument extends Document {
	_id: Types.ObjectId;
	idempotencyKey: string;
	operation: string;
	provider: string;
	entityType: string;
	entityId: string;
	environment: "test" | "production";
	requestPayload: Record<string, unknown>;
	responsePayload: Record<string, unknown> | null;
	success: boolean;
	statusCode: number | null;
	errorMessage: string | null;
	durationMs: number;
	userId: Types.ObjectId | null;
	createdAt: Date;
}

const IntegrationLogSchema = new Schema<IntegrationLogDocument>(
	{
		idempotencyKey: { type: String, required: true, maxlength: 128, index: true },
		operation: { type: String, required: true, maxlength: 100 },
		provider: { type: String, required: true, maxlength: 50, index: true },
		entityType: { type: String, required: true, maxlength: 50 },
		entityId: { type: String, required: true, maxlength: 100, index: true },
		environment: { type: String, enum: ["test", "production"], required: true },
		requestPayload: { type: Schema.Types.Mixed, default: {} },
		responsePayload: { type: Schema.Types.Mixed, default: null },
		success: { type: Boolean, required: true, index: true },
		statusCode: { type: Number, default: null },
		errorMessage: { type: String, default: null, maxlength: 2000 },
		durationMs: { type: Number, required: true, min: 0 },
		userId: { type: Types.ObjectId, ref: "User", default: null },
	},
	{ timestamps: { createdAt: true, updatedAt: false } },
);

IntegrationLogSchema.index({ createdAt: -1 });
IntegrationLogSchema.index({ provider: 1, operation: 1, createdAt: -1 });

export const IntegrationLog = model<IntegrationLogDocument>("IntegrationLog", IntegrationLogSchema);
