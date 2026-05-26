import { AssetStatusEnum, AssetTypeEnum } from "@cermont/shared-types";
import mongoose from "mongoose";

const AssetSchema = new mongoose.Schema(
	{
		code: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},
		name: {
			type: String,
			required: true,
			trim: true,
			maxlength: 200,
		},
		description: {
			type: String,
			trim: true,
			maxlength: 2000,
		},
		type: {
			type: String,
			required: true,
			enum: AssetTypeEnum.options,
		},
		status: {
			type: String,
			enum: AssetStatusEnum.options,
			default: "available",
			index: true,
		},
		serialNumber: {
			type: String,
			trim: true,
		},
		model: {
			type: String,
			trim: true,
		},
		brand: {
			type: String,
			trim: true,
		},
		purchaseDate: {
			type: Date,
		},
		lastMaintenanceAt: {
			type: Date,
		},
		nextMaintenanceAt: {
			type: Date,
		},
		specifications: {
			type: mongoose.Schema.Types.Mixed,
		},
		metadata: {
			type: mongoose.Schema.Types.Mixed,
		},
		// Audit fields
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

// Indexes for common queries
AssetSchema.index({ code: 1 });
AssetSchema.index({ type: 1 });
AssetSchema.index({ status: 1 });
AssetSchema.index({ serialNumber: 1 });
AssetSchema.index({ nextMaintenanceAt: 1 });

export const Asset = mongoose.model("Asset", AssetSchema);
