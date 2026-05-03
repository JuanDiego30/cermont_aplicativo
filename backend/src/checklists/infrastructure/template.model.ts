import { ChecklistFieldTypeSchema, ChecklistItemCategorySchema } from "@cermont/shared-types";
import { type Document, model, Schema, Types } from "mongoose";

const ChecklistTemplateItemSchema = new Schema(
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
	},
	{ _id: false },
);

export interface IChecklistTemplateDocument extends Document {
	name: string;
	description?: string;
	category?: string;
	items: Array<{
		id: string;
		category: "tool" | "equipment" | "ppe" | "procedure";
		type: string;
		description: string;
		required: boolean;
		options?: string[];
	}>;
	version: string;
	isActive: boolean;
	createdBy: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const ChecklistTemplateSchema = new Schema<IChecklistTemplateDocument>(
	{
		name: { type: String, required: true, minlength: 3, maxlength: 100 },
		description: { type: String, maxlength: 500 },
		category: { type: String },
		items: { type: [ChecklistTemplateItemSchema], default: [] },
		version: { type: String, default: "1.0.0" },
		isActive: { type: Boolean, default: true },
		createdBy: { type: Types.ObjectId, ref: "User", required: true },
	},
	{ timestamps: true, versionKey: false },
);

ChecklistTemplateSchema.index({ name: 1 });
ChecklistTemplateSchema.index({ category: 1 });
ChecklistTemplateSchema.index({ isActive: 1 });

export const ChecklistTemplate = model<IChecklistTemplateDocument>(
	"ChecklistTemplate",
	ChecklistTemplateSchema,
);
