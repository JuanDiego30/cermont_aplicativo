import {
	CreateKitSchema,
	KitByServiceTypeParamsSchema,
	KitIdParamsSchema,
	KitListQuerySchema,
	UpdateKitSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import {
	sendCreated,
	sendPaginated,
	sendSuccess,
} from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import { listAllKits } from "../../config/kit-templates";
import {
	archiveKit,
	createKit,
	deleteKit,
	getAllKits,
	getKitById,
	getKitsByServiceType,
	publishKit,
	updateKit,
} from "./kit.service";

export const create = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const body = CreateKitSchema.parse(req.body);
	const result = await createKit(body, String(user._id));
	return sendCreated(res, result);
};

export const getAll = async (req: Request, res: Response) => {
	const query = KitListQuerySchema.parse(req.query);
	const result = await getAllKits(
		{
			status: query.status,
			category: query.category,
			serviceTypeIds: query.serviceType ? [query.serviceType] : undefined,
			search: query.search,
		},
		{
			page: query.page,
			limit: query.limit,
		},
	);

	return sendPaginated(
		res,
		result.data,
		result.pagination.total,
		result.pagination.page,
		result.pagination.limit,
	);
};

export const getById = async (req: Request, res: Response) => {
	const { id } = KitIdParamsSchema.parse(req.params);
	const result = await getKitById(id);
	return sendSuccess(res, result);
};

export const update = async (req: Request, res: Response) => {
	const { id } = KitIdParamsSchema.parse(req.params);
	const body = UpdateKitSchema.parse(req.body);
	const user = requireUser(req);
	const result = await updateKit(id, body, String(user._id));
	return sendSuccess(res, result);
};

export const publish = async (req: Request, res: Response) => {
	const { id } = KitIdParamsSchema.parse(req.params);
	const user = requireUser(req);
	const result = await publishKit(id, String(user._id));
	return sendSuccess(res, result);
};

export const archive = async (req: Request, res: Response) => {
	const { id } = KitIdParamsSchema.parse(req.params);
	const user = requireUser(req);
	const result = await archiveKit(id, String(user._id));
	return sendSuccess(res, result);
};

export const remove = async (req: Request, res: Response) => {
	const { id } = KitIdParamsSchema.parse(req.params);
	const user = requireUser(req);
	await deleteKit(id, String(user._id));
	return sendSuccess(res, { message: "Kit deleted successfully" });
};

export const getByServiceType = async (req: Request, res: Response) => {
	const { serviceTypeId } = KitByServiceTypeParamsSchema.parse(req.params);
	const result = await getKitsByServiceType(serviceTypeId);
	return sendSuccess(res, result);
};

export const getTemplates = async (_req: Request, res: Response) => {
	const templates = listAllKits();
	return sendSuccess(res, templates);
};
