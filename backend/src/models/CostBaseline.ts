import { CostCategorySchema } from "@cermont/shared-types";
import { type Document, model, Schema, Types } from "mongoose";
import { removeVersionKey } from "../common/types/safe-types";

export interface ICostBaselineItem {
	description: string;
	unit: string;
	quantity: number;
	unitCost: number;
	total: number;
	category: string;
}

export interface ICostBaselineDocument extends Document {
	serviceCaseId: Types.ObjectId;
	proposalId: Types.ObjectId;
	proposalCode: string;
	frozenAt: Date;
	frozenBy: Types.ObjectId;
	items: ICostBaselineItem[];
	subtotal: number;
	taxRate: number;
	total: number;
	status: "active" | "superseded";
	supersededBy?: Types.ObjectId;
	supersededAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

const CostBaselineItemSchema = new Schema<ICostBaselineItem>(
	{
		description: { type: String, required: true, maxlength: 300 },
		unit: { type: String, required: true, maxlength: 50 },
		quantity: { type: Number, required: true, min: 0 },
		unitCost: { type: Number, required: true, min: 0 },
		total: { type: Number, required: true, min: 0 },
		category: {
			type: String,
			enum: CostCategorySchema.options,
			required: true,
		},
	},
	{ _id: false },
);

const CostBaselineSchema = new Schema<ICostBaselineDocument>(
	{
		serviceCaseId: {
			type: Types.ObjectId,
			ref: "ServiceCase",
			required: true,
			index: true,
		},
		proposalId: {
			type: Types.ObjectId,
			ref: "Proposal",
			required: true,
		},
		proposalCode: { type: String, required: true },
		frozenAt: { type: Date, required: true, default: Date.now },
		frozenBy: { type: Types.ObjectId, ref: "User", required: true },
		items: [CostBaselineItemSchema],
		subtotal: { type: Number, required: true, min: 0 },
		taxRate: { type: Number, required: true, min: 0, max: 1, default: 0.19 },
		total: { type: Number, required: true, min: 0 },
		status: {
			type: String,
			enum: ["active", "superseded"],
			required: true,
			default: "active",
			index: true,
		},
		supersededBy: { type: Types.ObjectId, ref: "CostBaseline" },
		supersededAt: { type: Date },
	},
	{
		timestamps: true,
		versionKey: false,
		toJSON: {
			transform(_doc, ret) {
				return removeVersionKey(ret);
			},
		},
	},
);

CostBaselineSchema.index({ serviceCaseId: 1, status: 1 });
CostBaselineSchema.index({ proposalId: 1 });

export const CostBaseline = model<ICostBaselineDocument>("CostBaseline", CostBaselineSchema);
