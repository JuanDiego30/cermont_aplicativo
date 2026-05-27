/**
 * Resource Controller — Thin HTTP layer for resource management
 *
 * Responsibilities:
 * - Call ResourceService for business logic
 * - Return standardized HTTP responses
 * - Map persistence snake_case fields to public camelCase DTOs
 */

import {
	type Certification,
	CreateResourceSchema,
	type ResourceEvidenceRequirement,
	type ResourceFileAttachment,
	type Resource as ResourceResponse,
	UpdateResourceSchema,
	UpdateResourceStatusSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import {
	sendCreated,
	sendPaginated,
	sendSuccess,
} from "../../common/interceptors/response.interceptor";
import {
	offsetToPage,
	parseNumberQuery,
	toIsoString,
} from "../../common/utils/mapping";
import { getString, requireUser } from "../../common/utils/request";
import { ResourceService } from "./resource.service";

interface ResourceRecord {
	_id: unknown;
	name: string;
	type: ResourceResponse["type"];
	status: ResourceResponse["status"];
	description?: string;
	serial_number?: string;
	brand?: string;
	modelName?: string;
	purchase_date?: Date | string;
	maintenance_date?: Date | string;
	category?: string;
	certifications?: Certification[];
	documents?: ResourceFileAttachment[];
	evidenceRequirements?: ResourceEvidenceRequirement[];
	dynamicForms?: string[];
	created_by?: string;
	updated_by?: string;
	created_at: Date | string;
	updated_at: Date | string;
}

function serializeResource(resource: ResourceRecord): ResourceResponse {
	return {
		_id: String(resource._id),
		name: resource.name,
		type: resource.type,
		status: resource.status,
		...(resource.description ? { description: resource.description } : {}),
		...(resource.serial_number ? { serialNumber: resource.serial_number } : {}),
		...(resource.brand ? { brand: resource.brand } : {}),
		...(resource.modelName ? { model: resource.modelName } : {}),
		...(resource.purchase_date ? { purchaseDate: toIsoString(resource.purchase_date) } : {}),
		...(resource.maintenance_date ? { maintenanceDate: toIsoString(resource.maintenance_date) } : {}),
		...(resource.category ? { category: resource.category } : {}),
		certifications: resource.certifications ?? [],
		documents: resource.documents ?? [],
		evidenceRequirements: resource.evidenceRequirements ?? [],
		dynamicForms: (resource.dynamicForms ?? []) as string[],
		...(resource.created_by ? { createdBy: String(resource.created_by) } : {}),
		...(resource.updated_by ? { updatedBy: String(resource.updated_by) } : {}),
		createdAt: toIsoString(resource.created_at) || new Date().toISOString(),
		updatedAt: toIsoString(resource.updated_at) || new Date().toISOString(),
	};
}

export const createResource = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const userId = user._id;
	const resource = await ResourceService.create(CreateResourceSchema.parse(req.body), userId);
	return sendCreated(res, serializeResource(resource as ResourceRecord));
};

export const getAllResources = async (req: Request, res: Response) => {
	const { type, status, search, limit = "50", offset = "0", page: pageQuery } = req.query;
	const limitValue = parseNumberQuery(String(limit), 50, 100);
	const pageValue = getString(pageQuery).trim()
		? parseNumberQuery(String(pageQuery), 1)
		: offsetToPage(String(offset), limitValue);

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
		result.data.map((resource) => serializeResource(resource as ResourceRecord)),
		result.total,
		pageValue,
		limitValue,
	);
};

export const getResourceById = async (req: Request, res: Response) => {
	const resource = await ResourceService.findById(getString(req.params.id));
	return sendSuccess(res, serializeResource(resource as ResourceRecord));
};

export const updateResource = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const userId = user._id;
	const resource = await ResourceService.update(
		getString(req.params.id),
		UpdateResourceSchema.parse(req.body),
		userId,
	);
	return sendSuccess(res, serializeResource(resource as ResourceRecord));
};

export const updateResourceStatus = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const userId = user._id;
	const { status } = UpdateResourceStatusSchema.parse(req.body);
	const resource = await ResourceService.updateStatus(getString(req.params.id), status, userId);
	return sendSuccess(res, serializeResource(resource as ResourceRecord));
};

export const deleteResource = async (req: Request, res: Response) => {
	await ResourceService.delete(getString(req.params.id));
	return sendSuccess(res, { message: "Recurso eliminado exitosamente" });
};
