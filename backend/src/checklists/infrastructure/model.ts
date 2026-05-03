import {
	ChecklistFieldTypeSchema,
	ChecklistItemCategorySchema,
	type ChecklistStatus,
	ChecklistStatusSchema,
} from "@cermont/shared-types";
import { type Document, model, Schema, Types } from "mongoose";

const ChecklistItemSchema = new Schema(
	{
		id: { type: String, required: true },
		category: {
			type: String,
			enum: ChecklistItemCategorySchema.options,
			required: true,
		},
		type: {
			type: String,
			enum: ChecklistFieldTypeSchema.options,
			default: "boolean",
		},
		description: { type: String, required: true, minlength: 3, maxlength: 300 },
		required: { type: Boolean, default: false },
		options: { type: [String], default: [] },
		completed: { type: Boolean, default: false },
		value: { type: Schema.Types.Mixed },
		completedBy: { type: Types.ObjectId, ref: "User" },
		completedAt: { type: Date },
		observation: { type: String, maxlength: 500 },
	},
	{ _id: false },
);

export interface IChecklistDocument extends Document {
	orderId: Types.ObjectId;
	templateId?: Types.ObjectId;
	templateName?: string;
	idempotencyKey?: string;
	status: ChecklistStatus;
	items: Array<{
		id: string;
		category: "tool" | "equipment" | "ppe" | "procedure";
		type: string;
		description: string;
		required: boolean;
		options?: string[];
		completed: boolean;
		value?: unknown;
		completedBy?: Types.ObjectId;
		completedAt?: Date;
		observation?: string;
	}>;
	completedBy?: Types.ObjectId;
	completedAt?: Date;
	signature?: string;
	observations?: string;
	createdAt: Date;
	updatedAt: Date;
}

const ChecklistSchema = new Schema<IChecklistDocument>(
	{
		orderId: { type: Types.ObjectId, ref: "Order", required: true },
		templateId: { type: Types.ObjectId, ref: "ChecklistTemplate" },
		templateName: { type: String },
		idempotencyKey: { type: String },
		status: {
			type: String,
			enum: ChecklistStatusSchema.options,
			default: "pending",
			index: true,
		},
		items: { type: [ChecklistItemSchema], default: [] },
		completedBy: { type: Types.ObjectId, ref: "User" },
		completedAt: { type: Date },
		signature: { type: String },
		observations: { type: String, maxlength: 2000 },
	},
	{ timestamps: true, versionKey: false },
);

ChecklistSchema.index({ orderId: 1 }, { unique: true });
ChecklistSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });
ChecklistSchema.index({ status: 1, updatedAt: -1 });

ChecklistSchema.set("toJSON", {
	transform: (_doc, ret) => {
		const obj = ret as unknown as Record<string, unknown>;
		delete obj.__v;
		return obj;
	},
});

export const Checklist = model<IChecklistDocument>("Checklist", ChecklistSchema);
