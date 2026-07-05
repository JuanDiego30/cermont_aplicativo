import type { AutomationActionType, AutomationEventType } from "@cermont/shared-types";
import { AutomationActionTypeSchema, AutomationEventTypeSchema } from "@cermont/shared-types";
import { type Document, model, Schema, Types } from "mongoose";

export interface IAutomationActionResult {
	actionType: AutomationActionType;
	status: "succeeded" | "failed";
	message: string;
}

export interface IAutomationExecutionDocument extends Document {
	ruleId: Types.ObjectId;
	eventId: string;
	eventType: AutomationEventType;
	entityType: string;
	entityId: string;
	actorId: Types.ObjectId;
	status: "processing" | "succeeded" | "failed";
	actionResults: IAutomationActionResult[];
	errorMessage?: string;
	executedAt: Date;
	createdAt: Date;
}

const ActionResultSchema = new Schema<IAutomationActionResult>(
	{
		actionType: { type: String, enum: AutomationActionTypeSchema.options, required: true },
		status: { type: String, enum: ["succeeded", "failed"], required: true },
		message: { type: String, required: true, maxlength: 1000 },
	},
	{ _id: false },
);

const AutomationExecutionSchema = new Schema<IAutomationExecutionDocument>(
	{
		ruleId: { type: Types.ObjectId, ref: "AutomationRule", required: true, index: true },
		eventId: { type: String, required: true, maxlength: 250 },
		eventType: {
			type: String,
			enum: AutomationEventTypeSchema.options,
			required: true,
			index: true,
		},
		entityType: { type: String, required: true, maxlength: 80 },
		entityId: { type: String, required: true, maxlength: 128, index: true },
		actorId: { type: Types.ObjectId, ref: "User", required: true },
		status: { type: String, enum: ["processing", "succeeded", "failed"], required: true },
		actionResults: { type: [ActionResultSchema], default: [] },
		errorMessage: { type: String, maxlength: 1000 },
		executedAt: { type: Date, required: true, default: Date.now },
	},
	{ timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

AutomationExecutionSchema.index({ ruleId: 1, eventId: 1 }, { unique: true });
AutomationExecutionSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export const AutomationExecution = model<IAutomationExecutionDocument>(
	"AutomationExecution",
	AutomationExecutionSchema,
);
