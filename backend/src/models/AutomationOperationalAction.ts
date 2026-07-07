import type { AutomationActionType, UserRole } from "@cermont/shared-types";
import { AutomationActionTypeSchema } from "@cermont/shared-types";
import { type Document, model, Schema, Types } from "mongoose";
import { USER_ROLES } from "./User";

type OperationalAutomationActionType = Exclude<AutomationActionType, "notify">;

export interface IAutomationOperationalActionDocument extends Document {
	ruleId: Types.ObjectId;
	executionId: Types.ObjectId;
	dedupeKey: string;
	entityType: string;
	entityId: string;
	type: OperationalAutomationActionType;
	title: string;
	reason: string;
	priority: "medium" | "high" | "critical";
	status: "open" | "resolved";
	assignedRole?: UserRole;
	dueAt?: Date;
	resolvedAt?: Date;
	resolvedBy?: Types.ObjectId;
	createdAt: Date;
}

const operationalActionTypes = AutomationActionTypeSchema.options.filter(
	(actionType): actionType is OperationalAutomationActionType => actionType !== "notify",
);

const AutomationOperationalActionSchema = new Schema<IAutomationOperationalActionDocument>(
	{
		ruleId: { type: Types.ObjectId, ref: "AutomationRule", required: true, index: true },
		executionId: { type: Types.ObjectId, ref: "AutomationExecution", required: true, index: true },
		dedupeKey: { type: String, required: true, unique: true, maxlength: 500 },
		entityType: { type: String, required: true, maxlength: 80, index: true },
		entityId: { type: String, required: true, maxlength: 128, index: true },
		type: { type: String, enum: operationalActionTypes, required: true, index: true },
		title: { type: String, required: true, maxlength: 200 },
		reason: { type: String, required: true, maxlength: 1000 },
		priority: { type: String, enum: ["medium", "high", "critical"], required: true },
		status: { type: String, enum: ["open", "resolved"], required: true, default: "open" },
		assignedRole: { type: String, enum: USER_ROLES },
		dueAt: { type: Date },
		resolvedAt: { type: Date },
		resolvedBy: { type: Types.ObjectId, ref: "User" },
	},
	{ timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

AutomationOperationalActionSchema.index({ entityType: 1, entityId: 1, status: 1, createdAt: -1 });

export const AutomationOperationalAction = model<IAutomationOperationalActionDocument>(
	"AutomationOperationalAction",
	AutomationOperationalActionSchema,
);
