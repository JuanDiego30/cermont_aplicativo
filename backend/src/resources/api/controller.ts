/**
 * Resource Controller — Thin HTTP layer for resource management
 *
 * Responsibilities:
 * - Call ResourceService for business logic
 * - Return standardized HTTP responses
 * - Map persistence snake_case fields to public camelCase DTOs
 */

import {
	CreateResourceSchema,
	type ResourceDocument,
	type Resource as ResourceResponse,
	UpdateResourceSchema,
	UpdateResourceStatusSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import {
	sendCreated,
	sendPaginated,
	sendSuccess,
} from "../../_shared/common/interceptors/response.interceptor";
import {
	offsetToPage,
	parseNumberQuery,
	toIsoString,
	toStringId,
} from "../../_shared/common/utils";
import { getString, requireUser } from "../../_shared/common/utils/request";
import { ResourceService } from "../application/service";

function serializeResource(resource: ResourceDocument): ResourceResponse {
	return {
		_id: toStringId(resource._id),
		name: resource.name,
		type: resource.type,
		status: resource.status,
		...(resource.description ? { description: resource.description } : {}),
		...(resource.serial_number ? { serialNumber: resource.serial_number } : {}),
		...(toIsoString(resource.purchaseDate)
			? { purchaseDate: toIsoString(resource.purchaseDate) }
			: {}),
		...(toIsoString(resource.maintenanceDate)
			? { maintenanceDate: toIsoString(resource.maintenanceDate) }
			: {}),
		...(resource.createdBy ? { createdBy: toStringId(resource.createdBy) } : {}),
		...(resource.updatedBy ? { updatedBy: toStringId(resource.updatedBy) } : {}),
		createdAt: toIsoString(resource.createdAt) ?? new Date().toISOString(),
		updatedAt: toIsoString(resource.updatedAt) ?? new Date().toISOString(),
	};
}

export const createResource = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const userId = user._id;
	const resource = await ResourceService.create(CreateResourceSchema.parse(req.body), userId);
	return sendCreated(res, serializeResource(resource));
};

export const getAllResources = async (req: Request, res: Response) => {
	const { type, status, search, limit = "50", offset = "0", page: pageQuery } = req.query;
	const limitValue = parseNumberQuery(limit, 50, 100);
	const pageValue = getString(pageQuery).trim()
		? parseNumberQuery(pageQuery, 1)
		: offsetToPage(offset as string, limitValue);

	const result = await ResourceService.findAll(
		{
			type: getString(type).trim() || undefined,
			status: getString(status).trim() || undefined,
			search: getString(search).trim() || undefined,
		},
		pageValue,
		limitValue,
	);

	return sendPaginated(
		res,
		result.data.map((resource) => serializeResource(resource)),
		result.total,
		pageValue,
		limitValue,
	);
};

export const getResourceById = async (req: Request, res: Response) => {
	const resource = await ResourceService.findById(getString(req.params.id));
	return sendSuccess(res, serializeResource(resource));
};

export const updateResource = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const userId = user._id;
	const resource = await ResourceService.update(
		getString(req.params.id),
		UpdateResourceSchema.parse(req.body),
		userId,
	);
	return sendSuccess(res, serializeResource(resource));
};

export const updateResourceStatus = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const userId = user._id;
	const { status } = UpdateResourceStatusSchema.parse(req.body);
	const resource = await ResourceService.updateStatus(getString(req.params.id), status, userId);
	return sendSuccess(res, serializeResource(resource));
};

export const deleteResource = async (req: Request, res: Response) => {
	await ResourceService.delete(getString(req.params.id));
	return sendSuccess(res, { message: "Resource deleted successfully" });
};
