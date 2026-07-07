import { type CostCategory, CostCategorySchema } from "@cermont/shared-types";
import { type Document, model, Schema } from "mongoose";

export interface ICostCatalogItemDocument extends Document {
	code: string;
	name: string;
	description?: string;
	category: CostCategory;
	unit: string;
	unitPrice: number;
	currency: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const CostCatalogItemSchema = new Schema<ICostCatalogItemDocument>(
	{
		code: { type: String, required: true, trim: true, uppercase: true, unique: true, index: true },
		name: { type: String, required: true, trim: true, maxlength: 200 },
		description: { type: String, trim: true, maxlength: 500 },
		category: {
			type: String,
			enum: CostCategorySchema.options,
			required: true,
			index: true,
		},
		unit: { type: String, required: true, trim: true, maxlength: 50 },
		unitPrice: { type: Number, required: true, min: 0 },
		currency: { type: String, required: true, default: "COP", maxlength: 3 },
		isActive: { type: Boolean, required: true, default: true, index: true },
	},
	{ timestamps: true, versionKey: false },
);

CostCatalogItemSchema.index({ isActive: 1, category: 1, name: 1 });

export const CostCatalogItem = model<ICostCatalogItemDocument>(
	"CostCatalogItem",
	CostCatalogItemSchema,
);
