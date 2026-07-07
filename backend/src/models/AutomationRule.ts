import type { AutomationAction, AutomationEventType } from "@cermont/shared-types";
import { AutomationActionTypeSchema, AutomationEventTypeSchema } from "@cermont/shared-types";
import { type Document, model, Schema, Types } from "mongoose";
import { USER_ROLES } from "./User";

export interface IAutomationRuleDocument extends Document {
	name: string;
	description: string;
	eventType: AutomationEventType;
	actions: AutomationAction[];
	enabled: boolean;
	version: number;
	createdBy: Types.ObjectId;
	updatedBy: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const AutomationActionSchema = new Schema(
	{
		type: { type: String, enum: AutomationActionTypeSchema.options, required: true },
		recipientRoles: [{ type: String, enum: USER_ROLES }],
		priority: { type: String, enum: ["low", "medium", "high", "critical"] },
		title: { type: String, maxlength: 200 },
		body: { type: String, maxlength: 1000 },
		assignedRole: { type: String, enum: USER_ROLES },
		reason: { type: String, maxlength: 1000 },
		dueHours: { type: Number, min: 1, max: 720 },
		riskLevel: { type: String, enum: ["medium", "high", "critical"] },
		label: { type: String, maxlength: 200 },
	},
	{ _id: false },
);

const AutomationRuleSchema = new Schema<IAutomationRuleDocument>(
	{
		name: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
		description: { type: String, required: true, trim: true, maxlength: 500 },
		eventType: {
			type: String,
			enum: AutomationEventTypeSchema.options,
			required: true,
			index: true,
		},
		actions: { type: [AutomationActionSchema], required: true },
		enabled: { type: Boolean, required: true, default: true, index: true },
		version: { type: Number, required: true, min: 1, default: 1 },
		createdBy: { type: Types.ObjectId, ref: "User", required: true },
		updatedBy: { type: Types.ObjectId, ref: "User", required: true },
	},
	{ timestamps: true, versionKey: false },
);

AutomationRuleSchema.index({ eventType: 1, enabled: 1, createdAt: 1 });

export const AutomationRule = model<IAutomationRuleDocument>(
	"AutomationRule",
	AutomationRuleSchema,
);
