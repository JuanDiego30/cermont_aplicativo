/**
 * Resource Service for Cermont Backend
 *
 * Application service layer that orchestrates business logic from the domain
 * with persistence operations. This service should be thin and delegate
 * business rules to the domain layer.
 *
 * SOLID: Single Responsibility - orchestrates use cases
 * FIX: Use Repository Pattern instead of direct model access
 * FIX: Strong typing with ResourceDocument from shared-types
 */

import type {
	CreateResource,
	ResourceDocument,
	ResourceStatus,
	UpdateResource,
} from "@cermont/shared-types";
import { AppError } from "../../_shared/common/errors";
import { createLogger } from "../../_shared/common/utils";
import { container } from "../../_shared/config/container";
import { isValidResourceName, isValidSerialNumber, isValidStatusTransition } from "../domain/rules";

const log = createLogger("resource-service");

/**
 * Map CreateResource input to database payload
 * Only uses fields defined in CreateResource schema
 */
function mapCreateInput(data: CreateResource): Record<string, unknown> {
	const payload: Record<string, unknown> = {
		name: data.name,
		type: data.type,
	};

	if (data.description !== undefined) {
		payload.description = data.description;
	}
	if (data.serialNumber !== undefined) {
		payload.serial_number = data.serialNumber;
	}
	if (data.purchaseDate !== undefined) {
		payload.purchaseDate = new Date(data.purchaseDate);
	}

	return payload;
}

/**
 * Map UpdateResource input to database payload
 * Uses all fields from UpdateResource schema
 */
function mapUpdateInput(data: UpdateResource): Record<string, unknown> {
	const payload: Record<string, unknown> = {};

	if (data.name !== undefined) {
		payload.name = data.name;
	}
	if (data.type !== undefined) {
		payload.type = data.type;
	}
	if (data.status !== undefined) {
		payload.status = data.status;
	}
	if (data.description !== undefined) {
		payload.description = data.description;
	}
	if (data.serialNumber !== undefined) {
		payload.serial_number = data.serialNumber;
	}
	if (data.purchaseDate !== undefined) {
		payload.purchaseDate = new Date(data.purchaseDate);
	}
	if (data.maintenanceDate !== undefined) {
		payload.maintenanceDate = new Date(data.maintenanceDate);
	}

	return payload;
}

/**
 * Create a new resource
 * Applies domain validation rules before persistence
 */
async function create(data: CreateResource, userId: string): Promise<ResourceDocument> {
	// Apply domain validation rules
	if (!isValidResourceName(data.name)) {
		throw new AppError(
			"Resource name must be between 3-100 characters and contain only valid characters",
			400,
			"INVALID_RESOURCE_NAME",
		);
	}

	if (data.serialNumber && !isValidSerialNumber(data.serialNumber)) {
		throw new AppError(
			"Serial number must be 4-50 characters, uppercase letters, numbers, and hyphens only",
			400,
			"INVALID_SERIAL_NUMBER",
		);
	}

	const resource = await container.resourceRepository.create({
		...mapCreateInput(data),
		status: "available",
		created_by: userId,
	} as Partial<ResourceDocument>);

	log.info("Resource created", { resourceId: String(resource._id), name: data.name });
	return resource;
}

/**
 * Get all resources with filters and pagination
 */
async function findAll(
	filters: { type?: string; status?: string; search?: string },
	page: number = 1,
	limit: number = 50,
): Promise<{ data: ResourceDocument[]; total: number }> {
	const where: Record<string, unknown> = {};
	if (filters.type) {
		where.type = filters.type;
	}
	if (filters.status) {
		where.status = filters.status;
	}
	if (filters.search) {
		where.$text = { $search: filters.search };
	}

	return container.resourceRepository.findAll(where, page, limit);
}

/**
 * Get resource by ID
 */
async function findById(id: string): Promise<ResourceDocument> {
	const resource = await container.resourceRepository.findByIdLean(id);
	if (!resource) {
		throw new AppError("Resource not found", 404, "RESOURCE_NOT_FOUND");
	}
	return resource;
}

/**
 * Update a resource
 * Applies domain validation rules before persistence
 */
async function update(
	id: string,
	updates: UpdateResource,
	userId: string,
): Promise<ResourceDocument> {
	const resource = await container.resourceRepository.findById(id);
	if (!resource) {
		throw new AppError("Resource not found", 404, "RESOURCE_NOT_FOUND");
	}

	// Apply domain validation rules for updates
	if (updates.name !== undefined && !isValidResourceName(updates.name)) {
		throw new AppError(
			"Resource name must be between 3-100 characters and contain only valid characters",
			400,
			"INVALID_RESOURCE_NAME",
		);
	}

	if (updates.serialNumber !== undefined && !isValidSerialNumber(updates.serialNumber)) {
		throw new AppError(
			"Serial number must be 4-50 characters, uppercase letters, numbers, and hyphens only",
			400,
			"INVALID_SERIAL_NUMBER",
		);
	}

	Object.assign(resource, mapUpdateInput(updates));
	resource.updatedBy = userId;

	await container.resourceRepository.save(resource);
	log.info("Resource updated", { resourceId: id });
	return resource;
}

/**
 * Update resource status
 * Validates status transitions using domain rules
 */
async function updateStatus(
	id: string,
	status: ResourceStatus,
	userId: string,
): Promise<ResourceDocument> {
	const resource = await container.resourceRepository.findById(id);
	if (!resource) {
		throw new AppError("Resource not found", 404, "RESOURCE_NOT_FOUND");
	}

	// Apply domain validation rule for status transitions
	const currentStatus = resource.status as ResourceStatus;
	if (!isValidStatusTransition(currentStatus, status)) {
		throw new AppError(
			`Cannot transition resource from ${currentStatus} to ${status}`,
			422,
			"INVALID_STATUS_TRANSITION",
		);
	}

	resource.status = status;
	resource.updatedBy = userId;

	await container.resourceRepository.save(resource);
	log.info("Resource status updated", { resourceId: id, status });
	return resource;
}

/**
 * Delete a resource
 */
async function deleteResource(id: string): Promise<void> {
	const resource = await container.resourceRepository.findByIdLean(id);
	if (!resource) {
		throw new AppError("Resource not found", 404, "RESOURCE_NOT_FOUND");
	}

	await container.resourceRepository.deleteById(id);
	log.info("Resource deleted", { resourceId: id });
}

export const ResourceService = {
	create,
	findAll,
	findById,
	update,
	updateStatus,
	delete: deleteResource,
};
