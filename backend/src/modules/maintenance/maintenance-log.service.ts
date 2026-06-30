/**
 * Maintenance Log Service
 *
 * Records maintenance execution logs against assets.
 * Mongoose-backed persistence for audit trail.
 */

import type { CreateMaintenanceLogInput } from "@cermont/shared-types";
import mongoose from "mongoose";
import { createLogger } from "../../common/utils/logger";

const log = createLogger("maintenance-log");

const MaintenanceLogSchema = new mongoose.Schema(
	{
		assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
		scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: "MaintenanceSchedule" },
		title: { type: String, required: true, trim: true },
		description: { type: String, trim: true },
		performedAt: { type: Date, required: true },
		status: {
			type: String,
			enum: ["completed", "partial", "failed"],
			required: true,
		},
		notes: { type: String, trim: true },
		cost: { type: Number, min: 0 },
		performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	},
	{ timestamps: true },
);

const MaintenanceLogModel = mongoose.model("MaintenanceLog", MaintenanceLogSchema);

export async function createLog(data: CreateMaintenanceLogInput, userId: string) {
	const logEntry = await MaintenanceLogModel.create({
		assetId: new mongoose.Types.ObjectId(data.assetId),
		...(data.scheduleId ? { scheduleId: new mongoose.Types.ObjectId(data.scheduleId) } : {}),
		title: data.title,
		description: data.description,
		performedAt: new Date(data.performedAt),
		status: data.status,
		notes: data.notes,
		cost: data.cost,
		performedBy: new mongoose.Types.ObjectId(userId),
	});

	log.info("Maintenance log created", { logId: String(logEntry._id), assetId: data.assetId });
	return logEntry.toObject();
}

export async function listLogs(assetId: string, page: number = 1, limit: number = 20) {
	const skip = (page - 1) * limit;
	const filter = { assetId: new mongoose.Types.ObjectId(assetId) };
	const [data, total] = await Promise.all([
		MaintenanceLogModel.find(filter)
			.sort({ performedAt: -1 })
			.skip(skip)
			.limit(limit)
			.populate("performedBy", "name email")
			.populate("scheduleId", "title")
			.lean(),
		MaintenanceLogModel.countDocuments(filter),
	]);

	return { data, total, page, limit, pages: Math.ceil(total / limit) };
}
