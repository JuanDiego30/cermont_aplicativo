/**
 * Inspection Service for Cermont Backend
 *
 * Handles inspection management business logic:
 * - CRUD operations for inspections
 * - Status transitions with approval tracking
 *
 * FIX: Use Repository Pattern instead of direct model access
 * FIX: Strong typing with InspectionDocument from shared-types
 */

import type { CreateInspection, InspectionDocument, InspectionItem } from "@cermont/shared-types";
import { AppError } from "../../_shared/common/errors";
import { createLogger, parseObjectId } from "../../_shared/common/utils";
import { container } from "../../_shared/config/container";

const log = createLogger("inspection-service");

export const InspectionService = {
	/**
	 * Create a new inspection
	 */
	async create(data: CreateInspection, userId: string): Promise<InspectionDocument> {
		const items: InspectionItem[] = data.items.map((item) => ({
			code: item.code,
			description: item.description,
			passed: item.passed,
			notes: item.notes,
			evidence_url: item.evidenceUrl,
		}));

		const inspection = await container.inspectionRepository.create({
			order_id: parseObjectId(data.orderId).toString(),
			inspection_type: data.inspectionType,
			inspection_date: data.inspectionDate ? new Date(data.inspectionDate) : new Date(),
			created_by: parseObjectId(userId).toString(),
			inspector_id: parseObjectId(data.inspectorId ?? userId).toString(),
			items,
			photos: data.photos,
			observations: data.observations,
		});

		log.info("Inspection created", {
			inspectionId: String(inspection._id),
			orderId: data.orderId,
		});
		return inspection;
	},

	/**
	 * Get all inspections (paginated)
	 */
	async findAll(
		page = 1,
		limit = 20,
	): Promise<{
		data: InspectionDocument[];
		total: number;
		page: number;
		limit: number;
		pages: number;
	}> {
		const skip = (page - 1) * limit;
		const result = await container.inspectionRepository.findAllPopulated({
			skip,
			limit,
			sort: { createdAt: -1 },
		});

		return {
			data: result.data,
			total: result.total,
			page,
			limit,
			pages: Math.ceil(result.total / limit),
		};
	},

	/**
	 * Get inspection by ID
	 */
	async findById(id: string): Promise<InspectionDocument> {
		const inspection = await container.inspectionRepository.findByIdPopulated(id);

		if (!inspection) {
			throw new AppError("Inspection not found", 404, "INSPECTION_NOT_FOUND");
		}
		return inspection;
	},

	/**
	 * Get inspections by order ID (paginated)
	 */
	async findByOrderId(
		orderId: string,
		page = 1,
		limit = 100,
	): Promise<{
		data: InspectionDocument[];
		total: number;
		page: number;
		limit: number;
		pages: number;
	}> {
		const skip = (page - 1) * limit;
		const result = await container.inspectionRepository.findByOrderIdPopulated(orderId, {
			skip,
			limit,
			sort: { createdAt: -1 },
		});

		return {
			data: result.data,
			total: result.total,
			page,
			limit,
			pages: Math.ceil(result.total / limit),
		};
	},

	/**
	 * Update inspection status
	 */
	async updateStatus(id: string, status: string, userId: string): Promise<InspectionDocument> {
		const updateData: Record<string, unknown> = { status };

		if (status === "approved") {
			updateData.approved_by = userId;
			updateData.approved_at = new Date();
		}

		const inspection = await container.inspectionRepository.findByIdAndUpdate(id, updateData);
		if (!inspection) {
			throw new AppError("Inspection not found", 404, "INSPECTION_NOT_FOUND");
		}

		log.info("Inspection status updated", { inspectionId: id, status });
		return inspection;
	},

	/**
	 * Delete an inspection
	 */
	async delete(id: string): Promise<void> {
		const inspection = await container.inspectionRepository.findByIdAndDelete(id);
		if (!inspection) {
			throw new AppError("Inspection not found", 404, "INSPECTION_NOT_FOUND");
		}

		log.info("Inspection deleted", { inspectionId: id });
	},
};
