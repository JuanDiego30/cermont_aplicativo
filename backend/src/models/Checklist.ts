import {
	ChecklistItemCategorySchema,
	type ChecklistStatus,
	ChecklistStatusSchema,
} from "@cermont/shared-types";
import { type Document, model, Schema, Types } from "mongoose";
import { removeVersionKey } from "../common/types/safe-types";
import { type FileAssetRef, FileAssetRefSchema } from "./sub-schemas/FileAssetRefSchema";

const ChecklistItemSchema = new Schema(
	{
		id: { type: String, required: true },
		category: {
			type: String,
			enum: ChecklistItemCategorySchema.options,
			required: true,
		},
		description: { type: String, required: true, minlength: 3, maxlength: 300 },
		required: { type: Boolean, default: false },
		isBlocking: { type: Boolean, default: false },
		result: {
			type: String,
			enum: ["pending", "passed", "failed"],
			default: "pending",
		},
		completed: { type: Boolean, default: false },
		completedBy: { type: Types.ObjectId, ref: "User" },
		completedAt: { type: Date },
		observation: { type: String, maxlength: 500 },
		requiresPhoto: { type: Boolean, default: false },
		requiresSignature: { type: Boolean, default: false },
		evidenceAssetIds: { type: [String], default: [] },
	},
	{ _id: false },
);

export interface IChecklistDocument extends Document {
	orderId: Types.ObjectId;
	templateName?: string;
	templateVersion?: number;
	idempotencyKey?: string;
	status: ChecklistStatus;
	items: Array<{
		id: string;
		category: "tool" | "equipment" | "ppe" | "procedure";
		description: string;
		required: boolean;
		isBlocking: boolean;
		result: "pending" | "passed" | "failed";
		completed: boolean;
		completedBy?: Types.ObjectId;
		completedAt?: Date;
		observation?: string;
		requiresPhoto: boolean;
		requiresSignature: boolean;
		evidenceAssetIds: string[];
	}>;
	completedBy?: Types.ObjectId;
	completedAt?: Date;
	signature?: string;
	observations?: string;
	fileAssets: FileAssetRef[];
	createdAt: Date;
	updatedAt: Date;
}

const ChecklistSchema = new Schema<IChecklistDocument>(
	{
		orderId: { type: Types.ObjectId, ref: "Order", required: true },
		templateName: { type: String },
		templateVersion: { type: Number, default: 1 },
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
		fileAssets: { type: [FileAssetRefSchema], default: [] },
	},
	{ timestamps: true, versionKey: false },
);

ChecklistSchema.index({ orderId: 1 }, { unique: true });
ChecklistSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });
ChecklistSchema.index({ status: 1, updatedAt: -1 });

ChecklistSchema.set("toJSON", {
	transform: (_doc, ret) => {
		return removeVersionKey(ret);
	},
});

export const Checklist = model<IChecklistDocument>("Checklist", ChecklistSchema);
