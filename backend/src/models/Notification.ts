import { type Document, model, Schema, type Types } from "mongoose";
import { removeVersionKey } from "../common/types/safe-types";

export interface INotificationChannelDelivery {
	channel: "in_app" | "email" | "sms";
	status: "pending" | "sent" | "delivered" | "failed" | "read";
	sentAt?: Date;
	deliveredAt?: Date;
	readAt?: Date;
	error?: string;
	retryCount: number;
	lastRetryAt?: Date;
}

export interface INotification extends Document {
	notificationId: string;
	dedupeKey?: string;
	recipientUserId: Types.ObjectId;
	recipientRole?: string;
	recipientEmail?: string;
	recipientPhone?: string;
	type: string;
	priority: "low" | "medium" | "high" | "critical";
	title: string;
	body: string;
	relatedEntity?: {
		entityType: string;
		entityId: Types.ObjectId;
	};
	channels: INotificationChannelDelivery[];
	templateName?: string;
	templateVariables?: Record<string, unknown>;
	isRead: boolean;
	readAt?: Date;
	scheduledAt?: Date;
	expiresAt?: Date;
	createdAt: Date;
	metadata?: Record<string, unknown>;
}

const ChannelDeliverySchema = new Schema<INotificationChannelDelivery>(
	{
		channel: { type: String, required: true, enum: ["in_app", "email", "sms"] },
		status: {
			type: String,
			required: true,
			enum: ["pending", "sent", "delivered", "failed", "read"],
			default: "pending",
		},
		sentAt: { type: Date },
		deliveredAt: { type: Date },
		readAt: { type: Date },
		error: { type: String, maxlength: 500 },
		retryCount: { type: Number, default: 0 },
		lastRetryAt: { type: Date },
	},
	{ _id: false },
);

const NotificationSchema = new Schema<INotification>(
	{
		notificationId: { type: String, required: true, unique: true, index: true },
		dedupeKey: { type: String, maxlength: 500 },
		recipientUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
		recipientRole: { type: String },
		recipientEmail: { type: String },
		recipientPhone: { type: String, maxlength: 30 },
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
				"CERTIFICATION_EXPIRING",
				"MAINTENANCE_DUE",
				"WORK_ORDER_ASSIGNED",
				"PROPOSAL_STATUS",
				"SES_STATUS",
				"INVOICE_STATUS",
				"PAYMENT_OVERDUE",
				"EXECUTION_STARTED",
				"EVIDENCE_VERIFIED",
				"REPORT_APPROVED",
				"SYSTEM_ALERT",
			],
		},
		priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
		title: { type: String, required: true, maxlength: 200 },
		body: { type: String, required: true, maxlength: 1000 },
		relatedEntity: {
			entityType: { type: String },
			entityId: { type: Schema.Types.ObjectId },
		},
		channels: { type: [ChannelDeliverySchema], default: [] },
		templateName: { type: String, maxlength: 100 },
		templateVariables: { type: Schema.Types.Mixed },
		isRead: { type: Boolean, required: true, default: false, index: true },
		readAt: { type: Date },
		scheduledAt: { type: Date },
		expiresAt: { type: Date },
		metadata: { type: Schema.Types.Mixed },
	},
	{
		timestamps: { createdAt: true, updatedAt: false },
		versionKey: false,
	},
);

NotificationSchema.index({ recipientUserId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ "channels.channel": 1, "channels.status": 1 });
NotificationSchema.index(
	{ dedupeKey: 1 },
	{ unique: true, partialFilterExpression: { dedupeKey: { $type: "string" } } },
);

NotificationSchema.set("toJSON", {
	transform: (_doc, ret) => {
		return removeVersionKey(ret);
	},
});

export const Notification = model<INotification>("Notification", NotificationSchema);
