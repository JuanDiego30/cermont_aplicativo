import { type Document, model, Schema } from "mongoose";
import { removeVersionKey } from "../common/types/safe-types";

export type OutboxStatus = "pending" | "processing" | "sent" | "failed";

export interface INotificationOutbox extends Document {
	status: OutboxStatus;
	serviceCaseId: string;
	previousState: string;
	newState: string;
	triggeredByUserId: string;
	retryCount: number;
	lastError?: string;
	nextRetryAt?: Date;
	enqueuedAt: Date;
	processedAt?: Date;
}

const NotificationOutboxSchema = new Schema<INotificationOutbox>(
	{
		status: {
			type: String,
			required: true,
			enum: ["pending", "processing", "sent", "failed"],
			default: "pending",
			index: true,
		},
		serviceCaseId: { type: String, required: true, index: true },
		previousState: { type: String, required: true },
		newState: { type: String, required: true },
		triggeredByUserId: { type: String, required: true },
		retryCount: { type: Number, required: true, default: 0 },
		lastError: { type: String },
		nextRetryAt: { type: Date, index: true },
		enqueuedAt: { type: Date, required: true, default: () => new Date() },
		processedAt: { type: Date },
	},
	{
		versionKey: false,
	},
);

NotificationOutboxSchema.index({ status: 1, nextRetryAt: 1 });

NotificationOutboxSchema.set("toJSON", {
	transform: (_doc, ret) => {
		return removeVersionKey(ret);
	},
});

export const NotificationOutbox = model<INotificationOutbox>(
	"NotificationOutbox",
	NotificationOutboxSchema,
);
