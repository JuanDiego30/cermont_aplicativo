import { ALL_AUTHENTICATED_ROLES } from "@cermont/domain";
import type {
	FeatureFlag,
	ReminderRule,
	SystemConfig as SystemConfigContract,
} from "@cermont/shared-types";
import { type Document, model, Schema, Types } from "mongoose";

export interface SystemConfigDocument extends Document, SystemConfigContract {
	singletonKey: "system";
	updatedBy?: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const featureFlagSchema = new Schema<FeatureFlag>(
	{
		key: { type: String, required: true },
		label: { type: String, required: true, maxlength: 100 },
		description: { type: String, required: true, maxlength: 300 },
		enabled: { type: Boolean, default: false },
		category: {
			type: String,
			enum: ["general", "billing", "field", "notifications", "security", "experimental"],
			default: "general",
		},
	},
	{ _id: false },
);

const reminderRuleSchema = new Schema<ReminderRule>(
	{
		type: {
			type: String,
			required: true,
			enum: [
				"certification_expiring",
				"maintenance_due",
				"payment_overdue",
				"sla_breach_warning",
				"invoice_due",
				"stale_case",
			],
		},
		enabled: { type: Boolean, default: true },
		scheduleMode: {
			type: String,
			required: true,
			enum: ["days_before", "days_after", "hours_before", "inactivity_days"],
		},
		thresholds: { type: [Number], required: true },
		channels: {
			type: [String],
			required: true,
			enum: ["in_app", "email", "sms"],
		},
		recipientRoles: {
			type: [String],
			required: true,
			enum: ALL_AUTHENTICATED_ROLES,
		},
	},
	{ _id: false },
);

const SystemConfigSchema = new Schema<SystemConfigDocument>(
	{
		singletonKey: {
			type: String,
			enum: ["system"],
			default: "system",
			unique: true,
			immutable: true,
		},
		featureFlags: { type: [featureFlagSchema], default: [] },
		maintenanceMode: { type: Boolean, default: false },
		maintenanceMessage: { type: String, default: "", maxlength: 500 },
		maxUploadSizeMb: { type: Number, default: 10, min: 1, max: 100 },
		sessionTimeoutMinutes: { type: Number, default: 480, min: 30, max: 1440 },
		defaultLanguage: { type: String, enum: ["es"], default: "es" },
		allowedFileTypes: {
			type: [String],
			default: ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "xls", "xlsx"],
		},
		reminderWorkerEnabled: { type: Boolean, default: true },
		reminderWorkerIntervalMinutes: { type: Number, default: 5, min: 1, max: 1440 },
		reminderRules: { type: [reminderRuleSchema], default: [] },
		updatedBy: { type: Types.ObjectId, ref: "User" },
	},
	{ timestamps: true },
);

export const SystemConfig = model<SystemConfigDocument>("SystemConfig", SystemConfigSchema);
