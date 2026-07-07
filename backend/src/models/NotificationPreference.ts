import { type Document, model, Schema, type Types } from "mongoose";

export interface INotificationTypePreference {
	type: string;
	enabled: boolean;
	channels: string[];
}

export interface INotificationPreferenceDocument extends Document {
	userId: Types.ObjectId;
	quietHoursEnabled: boolean;
	quietHoursStart?: string;
	quietHoursEnd?: string;
	pushEnabled: boolean;
	emailDigest: "instant" | "daily" | "weekly" | "never";
	typePreferences: INotificationTypePreference[];
	createdAt: Date;
	updatedAt: Date;
}

const notificationTypePreferenceSchema = new Schema<INotificationTypePreference>(
	{
		type: {
			type: String,
			required: true,
			enum: [
				"state_transition",
				"approval_required",
				"document_upload",
				"deadline_warning",
				"payment",
				"system_alert",
			],
		},
		enabled: { type: Boolean, default: true },
		channels: {
			type: [String],
			required: true,
			enum: ["in_app", "email", "sms"],
		},
	},
	{ _id: false },
);

const NotificationPreferenceSchema = new Schema<INotificationPreferenceDocument>(
	{
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
		quietHoursEnabled: { type: Boolean, default: false },
		quietHoursStart: { type: String, trim: true },
		quietHoursEnd: { type: String, trim: true },
		pushEnabled: { type: Boolean, default: true },
		emailDigest: {
			type: String,
			enum: ["instant", "daily", "weekly", "never"],
			default: "instant",
		},
		typePreferences: { type: [notificationTypePreferenceSchema], default: [] },
	},
	{ timestamps: true },
);

NotificationPreferenceSchema.index({ userId: 1 }, { unique: true });

export const NotificationPreference = model<INotificationPreferenceDocument>(
	"NotificationPreference",
	NotificationPreferenceSchema,
);
