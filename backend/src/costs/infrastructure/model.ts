import { type CostCategory, CostCategorySchema } from "@cermont/shared-types";
import { type Document, model, Schema, Types } from "mongoose";

// Cost model aligned with the canonical shared-types contract.
export interface ICostDocument extends Document {
	orderId: Types.ObjectId;
	category: CostCategory;
	description: string;
	estimatedAmount: number;
	actualAmount: number;
	taxAmount: number;
	taxRate: number;
	currency: string;
	notes?: string;
	recordedBy: Types.ObjectId;
	recordedAt: Date;
	variance?: number;
	variancePercent?: number;
	createdAt: Date;
	updatedAt: Date;
}

const CostSchema = new Schema<ICostDocument>(
	{
		orderId: { type: Types.ObjectId, ref: "Order", required: true, index: true },
		category: {
			type: String,
			enum: CostCategorySchema.options,
			required: true,
			index: true,
		},
		description: { type: String, required: true, minlength: 1, maxlength: 200 },
		estimatedAmount: { type: Number, required: true, min: 0 },
		actualAmount: { type: Number, required: true, min: 0 },
		taxAmount: { type: Number, required: true, min: 0, default: 0 },
		taxRate: { type: Number, required: true, min: 0, max: 1, default: 0 },
		currency: { type: String, required: true, default: "COP" },
		notes: { type: String, maxlength: 500 },
		recordedBy: { type: Types.ObjectId, ref: "User", required: true, index: true },
		recordedAt: { type: Date, required: true, default: Date.now, index: true },
	},
	{
		timestamps: true,
		versionKey: false,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

CostSchema.virtual("variance").get(function (this: ICostDocument) {
	return Number(this.actualAmount ?? 0) - Number(this.estimatedAmount ?? 0);
});

CostSchema.virtual("variancePercent").get(function (this: ICostDocument) {
	const estimatedAmount = Number(this.estimatedAmount ?? 0);
	if (estimatedAmount <= 0) {
		return null;
	}

	return (Number(this.actualAmount ?? 0) - estimatedAmount) / estimatedAmount;
});

CostSchema.index({ orderId: 1, category: 1 });
CostSchema.index({ orderId: 1, recordedAt: -1 });
CostSchema.index({ recordedBy: 1, recordedAt: -1 });

CostSchema.set("toJSON", {
	virtuals: true,
	transform: (_doc, ret) => {
		const obj = ret as unknown as Record<string, unknown>;
		delete obj.__v;
		return obj;
	},
});

export const Cost = model<ICostDocument>("Cost", CostSchema);
