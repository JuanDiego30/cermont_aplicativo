/**
 * Inspection Service for Cermont Backend
 *
 * Handles inspection management business logic:
 * - CRUD operations for inspections
 * - Status transitions with approval tracking
 */

import type { CreateInspection } from "@cermont/shared-types";
import { AppError } from "../../common/errors";
import { createLogger } from "../../common/utils/logger";
import { parseObjectId } from "../../common/utils/parseObjectId";
import type { IInspectionItem } from "../../models/Inspection";
import { Inspection } from "../../models/Inspection";

const log = createLogger("inspection-service");

/**
 * Create a new inspection
 */
export async function createInspection(data: CreateInspection, userId: string): Promise<unknown> {
	const items: IInspectionItem[] = data.items.map((item) => ({
		code: item.code,
		description: item.description,
		passed: item.passed,
		notes: item.notes,
		evidence_url: item.evidenceUrl,
	}));

	const inspection = await Inspection.create({
		order_id: parseObjectId(data.orderId),
		inspection_type: data.inspectionType,
		inspection_date: data.inspectionDate ? new Date(data.inspectionDate) : new Date(),
		created_by: parseObjectId(userId),
		inspector_id: parseObjectId(data.inspectorId ?? userId),
		items,
		photos: data.photos,
		observations: data.observations,
	});

	log.info("Inspection created", {
		inspectionId: String((inspection as { _id: unknown })._id),
		orderId: data.orderId,
	});
	return inspection;
}

/**
 * Get all inspections
 */
export async function findAllInspections(): Promise<unknown[]> {
	return Inspection.find()
		.populate("inspector_id", "name email role")
		.populate("approved_by", "name email")
		.sort({ createdAt: -1 })
		.lean();
}

/**
 * Get inspection by ID
 */
export async function findInspectionById(id: string): Promise<unknown> {
	const inspection = await Inspection.findById(id)
		.populate("inspector_id", "name email role")
		.populate("approved_by", "name email")
		.lean();

	if (!inspection) {
		throw new AppError("Inspection not found", 404, "INSPECTION_NOT_FOUND");
	}
	return inspection;
}

/**
 * Get inspections by order ID
 */
export async function findInspectionsByOrderId(orderId: string): Promise<unknown[]> {
	return Inspection.find({ order_id: orderId })
		.populate("inspector_id", "name email role")
		.sort({ createdAt: -1 })
		.lean();
}

/**
 * Update inspection status
 */
export async function updateInspectionStatus(
	id: string,
	status: string,
	userId: string,
): Promise<unknown> {
	const updateData: Record<string, unknown> = { status };

	if (status === "approved") {
		updateData.approved_by = userId;
		updateData.approved_at = new Date();
	}

	const inspection = await Inspection.findByIdAndUpdate(id, updateData, {
		new: true,
		runValidators: true,
	}).lean();
	if (!inspection) {
		throw new AppError("Inspection not found", 404, "INSPECTION_NOT_FOUND");
	}

	log.info("Inspection status updated", { inspectionId: id, status });
	return inspection;
}

/**
 * Delete an inspection
 */
export async function deleteInspection(id: string): Promise<void> {
	const inspection = await Inspection.findByIdAndDelete(id).lean();
	if (!inspection) {
		throw new AppError("Inspection not found", 404, "INSPECTION_NOT_FOUND");
	}

	log.info("Inspection deleted", { inspectionId: id });
}
