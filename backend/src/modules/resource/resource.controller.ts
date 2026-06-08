/**
 * Resource Controller — Thin HTTP layer for resource management
 *
 * Responsibilities:
 * - Call ResourceService for business logic
 * - Return standardized HTTP responses
 * - Map persistence snake_case fields to public camelCase DTOs
 */

import {
	AttachResourceImageSchema,
	type Certification,
	CreateResourceSchema,
	DetachResourceImageSchema,
	type FileAssetRef,
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
import { offsetToPage, parseNumberQuery, toIsoString } from "../../common/utils/mapping";
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
	// New catalog fields
	unit?: string;
	default_quantity?: number;
	active?: boolean;
	fileAssets?: FileAssetRef[];
	certifications?: Certification[];
	documents?: ResourceFileAttachment[];
	evidenceRequirements?: ResourceEvidenceRequirement[];
	dynamicForms?: string[];
	created_by?: string;
	updated_by?: string;
	created_at: Date | string;
	updated_at: Date | string;
}

type OptionalFieldMapper<T, V> = [key: keyof T, value: V | undefined, transform?: (v: V) => string];

function setOptionalFields<T>(
	target: T,
	_resource: ResourceRecord,
	mappers: OptionalFieldMapper<T, string | Date>[],
): void {
	for (const [key, value, transform] of mappers) {
		if (value !== undefined && value !== null && value !== "") {
			if (transform) {
				target[key] = transform(value) as T[keyof T];
			} else {
				target[key] = value as T[keyof T];
			}
		}
	}
}

function serializeResource(resource: ResourceRecord): ResourceResponse {
	const base: ResourceResponse = {
		_id: String(resource._id),
		name: resource.name,
		type: resource.type,
		status: resource.status,
		defaultQuantity: resource.default_quantity ?? 1,
		active: resource.active ?? true,
		images: (resource.fileAssets ?? []) as FileAssetRef[],
		certifications: resource.certifications ?? [],
		documents: resource.documents ?? [],
		evidenceRequirements: resource.evidenceRequirements ?? [],
		dynamicForms: (resource.dynamicForms ?? []) as string[],
		createdAt: toIsoString(resource.created_at) || new Date().toISOString(),
		updatedAt: toIsoString(resource.updated_at) || new Date().toISOString(),
	};

	setOptionalFields(base, resource, [
		["description", resource.description],
		["serialNumber", resource.serial_number],
		["brand", resource.brand],
		["model", resource.modelName],
		["category", resource.category],
		["createdBy", resource.created_by, (v) => String(v)],
		["updatedBy", resource.updated_by, (v) => String(v)],
		["purchaseDate", resource.purchase_date, (v) => toIsoString(v)],
		["maintenanceDate", resource.maintenance_date, (v) => toIsoString(v)],
	]);

	if (resource.unit) {
		base.unit = resource.unit as ResourceResponse["unit"];
	}

	return base;
}

export const createResource = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const userId = user._id;
	const resource = await ResourceService.create(CreateResourceSchema.parse(req.body), userId);
	return sendCreated(res, serializeResource(resource as ResourceRecord));
};

export const getAllResources = async (req: Request, res: Response) => {
	const { type, status, search, active, limit = "50", offset = "0", page: pageQuery } = req.query;
	const limitValue = parseNumberQuery(String(limit), 50, 100);
	const pageValue = getString((pageQuery as string | undefined) ?? "").trim()
		? parseNumberQuery(String(pageQuery ?? ""), 1)
		: offsetToPage(String(offset), limitValue);

	const activeValue = active !== undefined ? active === "true" || active === "1" : undefined;

	const result = await ResourceService.findAll(
		{
			type: getString(type as string | undefined).trim() || undefined,
			status: getString(status as string | undefined).trim() || undefined,
			search: getString(search as string | undefined).trim() || undefined,
			active: activeValue,
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

// ─── Image Gallery Endpoints ─────────────────────────────────────────────────

export const attachImage = async (req: Request, res: Response) => {
	const resource = await ResourceService.attachImage(
		getString(req.params.id),
		AttachResourceImageSchema.parse(req.body),
	);
	return sendSuccess(res, serializeResource(resource as ResourceRecord));
};

export const detachImage = async (req: Request, res: Response) => {
	const resource = await ResourceService.detachImage(
		getString(req.params.id),
		DetachResourceImageSchema.parse(req.body),
	);
	return sendSuccess(res, serializeResource(resource as ResourceRecord));
};
