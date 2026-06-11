import {
	ApplyKitToPlanningSchema,
	ArchiveKitSchema,
	CreateKitSchema,
	DuplicateKitSchema,
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
import {
	activateKit,
	addKitAttachment,
	applyKitToPlanning,
	archiveKit,
	createKit,
	deleteKit,
	duplicateKit,
	getAllKits,
	getCatalogOptions,
	getKitById,
	removeKitAttachment,
	restoreKit,
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
			activityType: query.activityType,
			serviceCategory: query.serviceCategory,
			riskLevel: query.riskLevel,
			search: query.search,
			tags: query.tags,
		},
		{ page: query.page, limit: query.limit },
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

export const remove = async (req: Request, res: Response) => {
	const { id } = KitIdParamsSchema.parse(req.params);
	const user = requireUser(req);
	const result = await deleteKit(id, String(user._id));
	return sendSuccess(res, result);
};

export const activate = async (req: Request, res: Response) => {
	const { id } = KitIdParamsSchema.parse(req.params);
	const user = requireUser(req);
	const result = await activateKit(id, String(user._id));
	return sendSuccess(res, result);
};

export const archive = async (req: Request, res: Response) => {
	const { id } = KitIdParamsSchema.parse(req.params);
	const body = ArchiveKitSchema.parse(req.body);
	const user = requireUser(req);
	const result = await archiveKit(id, String(user._id), body.reason);
	return sendSuccess(res, result);
};

export const restore = async (req: Request, res: Response) => {
	const { id } = KitIdParamsSchema.parse(req.params);
	const user = requireUser(req);
	const result = await restoreKit(id, String(user._id));
	return sendSuccess(res, result);
};

export const duplicate = async (req: Request, res: Response) => {
	const { id } = KitIdParamsSchema.parse(req.params);
	const body = DuplicateKitSchema.parse(req.body);
	const user = requireUser(req);
	const result = await duplicateKit(id, String(user._id), body.name);
	return sendCreated(res, result);
};

export const applyToPlanning = async (req: Request, res: Response) => {
	const { id } = KitIdParamsSchema.parse(req.params);
	const body = ApplyKitToPlanningSchema.parse(req.body);
	const user = requireUser(req);
	const result = await applyKitToPlanning(id, body.planningId, String(user._id));
	return sendSuccess(res, result);
};

export const catalogOptions = async (_req: Request, res: Response) => {
	const options = getCatalogOptions();
	return sendSuccess(res, options);
};

export const addAttachment = async (req: Request, res: Response) => {
	const { id } = KitIdParamsSchema.parse(req.params);
	const user = requireUser(req);
	const result = await addKitAttachment(id, {
		...req.body,
		uploadedBy: String(user._id),
	});
	return sendCreated(res, result);
};

export const removeAttachment = async (req: Request, res: Response) => {
	const id = req.params.id as string;
	const attachmentId = req.params.attachmentId as string;
	const user = requireUser(req);
	const result = await removeKitAttachment(id, attachmentId, String(user._id));
	return sendSuccess(res, result);
};
