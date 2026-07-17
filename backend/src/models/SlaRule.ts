import { model, Schema, type Types } from "mongoose";

export interface ISlaRuleDocument {
	_id: Types.ObjectId;
	name: string;
	serviceType: string;
	priority: string;
	responseHours: number;
	resolutionHours: number;
	escalationHours: number;
	isActive: boolean;
	createdBy: string;
	createdAt: Date;
	updatedAt: Date;
}

const SlaRuleSchema = new Schema<ISlaRuleDocument>(
	{
		name: { type: String, required: true },
		serviceType: { type: String, required: true, default: "*" },
		priority: { type: String, required: true, default: "medium" },
		responseHours: { type: Number, required: true, min: 1 },
		resolutionHours: { type: Number, required: true, min: 1 },
		escalationHours: { type: Number, required: true, min: 1 },
		isActive: { type: Boolean, default: true },
		createdBy: { type: String, required: true },
	},
	{ timestamps: true },
);

SlaRuleSchema.index({ serviceType: 1, priority: 1 });

export const SlaRule = model<ISlaRuleDocument>("SlaRule", SlaRuleSchema);
