/**
 * Resource Service for Cermont Backend
 *
 * Handles resource management business logic:
 * - CRUD operations for resources
 * - Status transitions
 */

import type { CreateResource, ResourceStatus, UpdateResource } from "@cermont/shared-types";
import type mongoose from "mongoose";
import { AppError } from "../../common/errors";
import { createLogger } from "../../common/utils/logger";
import { type IResource, Resource } from "../../models/Resource";

const log = createLogger("resource-service");

type ResourceMapperInput = Partial<CreateResource & UpdateResource>;

function mapResourceInput(data: ResourceMapperInput): Record<string, unknown> {
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
		payload.purchase_date = new Date(data.purchaseDate);
	}
	if (data.maintenanceDate !== undefined) {
		payload.maintenance_date = new Date(data.maintenanceDate);
	}

	return payload;
}

/**
 * Create a new resource
 */
async function createResource(data: CreateResource, userId: string): Promise<IResource> {
	const resource = new Resource({
		...mapResourceInput(data),
		created_by: userId,
	});

	await resource.save();
	log.info("Resource created", { resourceId: String(resource._id), name: data.name });
	return resource;
}

/**
 * Get all resources with filters and pagination
 */
async function findAllResources(
	filters: { type?: string; status?: string; search?: string },
	page: number = 1,
	limit: number = 50,
): Promise<{ data: IResource[]; total: number }> {
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

	const skip = (page - 1) * limit;

	const [data, total] = await Promise.all([
		Resource.find(where).sort({ created_at: -1 }).limit(limit).skip(skip).lean(),
		Resource.countDocuments(where),
	]);

	return { data, total };
}

/**
 * Get resource by ID
 */
async function findResourceById(id: string): Promise<IResource> {
	const resource = await Resource.findById(id).lean();
	if (!resource) {
		throw new AppError("Recurso no encontrado", 404, "RESOURCE_NOT_FOUND");
	}
	return resource;
}

/**
 * Update a resource
 */
async function updateResource(
	id: string,
	updates: UpdateResource,
	userId: string,
): Promise<IResource> {
	const resource = await Resource.findById(id);
	if (!resource) {
		throw new AppError("Recurso no encontrado", 404, "RESOURCE_NOT_FOUND");
	}

	Object.assign(resource, mapResourceInput(updates));
	resource.updated_by = userId as unknown as mongoose.Types.ObjectId;

	await resource.save();
	log.info("Resource updated", { resourceId: id });
	return resource;
}

/**
 * Update resource status
 */
async function updateResourceStatus(
	id: string,
	status: ResourceStatus,
	userId: string,
): Promise<IResource> {
	const resource = await Resource.findById(id);
	if (!resource) {
		throw new AppError("Recurso no encontrado", 404, "RESOURCE_NOT_FOUND");
	}

	resource.status = status as IResource["status"];
	resource.updated_by = userId as unknown as mongoose.Types.ObjectId;

	await resource.save();
	log.info("Resource status updated", { resourceId: id, status });
	return resource;
}

/**
 * Delete a resource
 */
async function deleteResource(id: string): Promise<void> {
	const resource = await Resource.findById(id).lean();
	if (!resource) {
		throw new AppError("Recurso no encontrado", 404, "RESOURCE_NOT_FOUND");
	}

	await Resource.findByIdAndDelete(id);
	log.info("Resource deleted", { resourceId: id });
}

export const ResourceService = {
	create: createResource,
	findAll: findAllResources,
	findById: findResourceById,
	update: updateResource,
	updateStatus: updateResourceStatus,
	delete: deleteResource,
} as const;
