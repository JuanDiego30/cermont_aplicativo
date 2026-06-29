/**
 * Maintenance Schedule Service
 *
 * CRUD operations for maintenance schedules on assets using Mongoose.
 * Schedules define recurring maintenance tasks with frequency.
 */

import type {
	CreateMaintenanceScheduleInput,
	UpdateMaintenanceScheduleInput,
} from "@cermont/shared-types";
import mongoose from "mongoose";
import { NotFoundError } from "../../common/errors";
import { createLogger } from "../../common/utils/logger";

const log = createLogger("maintenance-schedule");

const MaintenanceScheduleSchema = new mongoose.Schema(
	{
		assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
		title: { type: String, required: true, trim: true },
		description: { type: String, trim: true },
		frequency: {
			type: String,
			enum: ["daily", "weekly", "monthly", "quarterly", "yearly"],
			required: true,
		},
		startDate: { type: Date, required: true },
		endDate: { type: Date },
		assignedTo: { type: String, trim: true },
		status: {
			type: String,
			enum: ["active", "paused", "completed", "cancelled"],
			default: "active",
		},
		lastExecutedAt: { type: Date },
		nextDueAt: { type: Date },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	},
	{ timestamps: true },
);

const MaintenanceScheduleModel = mongoose.model(
	"MaintenanceSchedule",
	MaintenanceScheduleSchema,
);

function computeNextDueDate(startDate: Date, frequency: string): Date {
	const next = new Date(startDate);
	switch (frequency) {
		case "daily":
			next.setDate(next.getDate() + 1);
			break;
		case "weekly":
			next.setDate(next.getDate() + 7);
			break;
		case "monthly":
			next.setMonth(next.getMonth() + 1);
			break;
		case "quarterly":
			next.setMonth(next.getMonth() + 3);
			break;
		case "yearly":
			next.setFullYear(next.getFullYear() + 1);
			break;
	}
	return next;
}

export async function createSchedule(
	data: CreateMaintenanceScheduleInput,
	userId: string,
) {
	const schedule = await MaintenanceScheduleModel.create({
		assetId: new mongoose.Types.ObjectId(data.assetId),
		title: data.title,
		description: data.description,
		frequency: data.frequency,
		startDate: new Date(data.startDate),
		endDate: data.endDate ? new Date(data.endDate) : undefined,
		assignedTo: data.assignedTo,
		status: "active",
		nextDueAt: computeNextDueDate(new Date(data.startDate), data.frequency),
		createdBy: new mongoose.Types.ObjectId(userId),
	});

	log.info("Maintenance schedule created", {
		scheduleId: String(schedule._id),
		title: data.title,
	});

	return schedule.toObject();
}

export async function listSchedules(page: number = 1, limit: number = 20) {
	const skip = (page - 1) * limit;
	const [data, total] = await Promise.all([
		MaintenanceScheduleModel.find()
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.populate("assetId", "name code")
			.populate("createdBy", "name email")
			.lean(),
		MaintenanceScheduleModel.countDocuments(),
	]);

	return { data, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getScheduleById(id: string) {
	const schedule = await MaintenanceScheduleModel.findById(id)
		.populate("assetId", "name code")
		.populate("createdBy", "name email")
		.lean();

	if (!schedule) {
		throw new NotFoundError("MaintenanceSchedule", id);
	}
	return schedule;
}

export async function updateSchedule(
	id: string,
	data: UpdateMaintenanceScheduleInput,
) {
	const updateData: Record<string, unknown> = {};
	if (data.title !== undefined) updateData.title = data.title;
	if (data.description !== undefined) updateData.description = data.description;
	if (data.frequency !== undefined) {
		updateData.frequency = data.frequency;
		updateData.nextDueAt = computeNextDueDate(new Date(), data.frequency);
	}
	if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
	if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
	if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;

	const schedule = await MaintenanceScheduleModel.findByIdAndUpdate(
		id,
		{ $set: updateData },
		{ returnDocument: "after", runValidators: true },
	)
		.populate("assetId", "name code")
		.populate("createdBy", "name email")
		.lean();

	if (!schedule) {
		throw new NotFoundError("MaintenanceSchedule", id);
	}
	return schedule;
}

export async function deleteSchedule(id: string) {
	const schedule = await MaintenanceScheduleModel.findByIdAndUpdate(
		id,
		{ $set: { status: "cancelled" } },
		{ returnDocument: "after" },
	).lean();

	if (!schedule) {
		throw new NotFoundError("MaintenanceSchedule", id);
	}

	log.info("Maintenance schedule deactivated", { scheduleId: id });
	return { message: "Schedule deactivated successfully" };
}
