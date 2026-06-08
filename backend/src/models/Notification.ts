import { type Document, model, Schema, type Types } from "mongoose";
import { removeVersionKey } from "../common/types/safe-types";

export interface INotification extends Document {
	notificationId: string;
	recipientUserId: Types.ObjectId;
	recipientRole?: string;
	type: string;
	title: string;
	body: string;
	relatedEntity: {
		entityType: string;
		entityId: Types.ObjectId;
	};
	isRead: boolean;
	readAt?: Date;
	createdAt: Date;
	metadata?: Record<string, unknown>;
}

const NotificationSchema = new Schema<INotification>(
	{
		notificationId: { type: String, required: true, unique: true, index: true },
		recipientUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
		recipientRole: { type: String },
		type: {
			type: String,
			required: true,
			enum: [
				"STATE_TRANSITION",
				"APPROVAL_REQUIRED",
				"DOCUMENT_UPLOADED",
				"SYNC_FAILED",
				"COMMENT_ADDED",
				"DEADLINE_WARNING",
				"PAYMENT_RECEIVED",
			],
		},
		title: { type: String, required: true, maxlength: 200 },
		body: { type: String, required: true, maxlength: 1000 },
		relatedEntity: {
			entityType: { type: String, required: true },
			entityId: { type: Schema.Types.ObjectId, required: true },
		},
		isRead: { type: Boolean, required: true, default: false, index: true },
		readAt: { type: Date },
		metadata: { type: Schema.Types.Mixed },
	},
	{
		timestamps: { createdAt: true, updatedAt: false },
		versionKey: false,
	},
);

NotificationSchema.index({ recipientUserId: 1, isRead: 1, createdAt: -1 });

NotificationSchema.set("toJSON", {
	transform: (_doc, ret) => {
		return removeVersionKey(ret);
	},
});

export const Notification = model<INotification>("Notification", NotificationSchema);
