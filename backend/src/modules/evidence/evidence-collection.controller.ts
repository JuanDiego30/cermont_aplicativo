import {
	AddEvidenceCollectionItemSchema,
	CreateEvidenceCollectionSchema,
	EvidenceCollectionByEntityParamsSchema,
	EvidenceCollectionIdParamsSchema,
	EvidenceCollectionItemParamsSchema,
	EvidenceCollectionListQuerySchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import {
	sendCreated,
	sendPaginated,
	sendSuccess,
} from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import {
	addEvidenceItem,
	createEvidenceCollection,
	getAllEvidenceCollections,
	getEvidenceCollectionById,
	getEvidenceCollectionsByEntity,
	removeEvidenceItem,
} from "./evidence-collection.service";

export const create = async (req: Request, res: Response) => {
	const body = CreateEvidenceCollectionSchema.parse(req.body);
	const user = requireUser(req);
	const result = await createEvidenceCollection(body, String(user._id));
	return sendCreated(res, result);
};

export const getAll = async (req: Request, res: Response) => {
	const query = EvidenceCollectionListQuerySchema.parse(req.query);
	const result = await getAllEvidenceCollections(
		{
			entityType: query.entityType,
			entityId: query.entityId,
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
	const { id } = EvidenceCollectionIdParamsSchema.parse(req.params);
	const result = await getEvidenceCollectionById(id);
	return sendSuccess(res, result);
};

export const addItem = async (req: Request, res: Response) => {
	const { id } = EvidenceCollectionIdParamsSchema.parse(req.params);
	const body = AddEvidenceCollectionItemSchema.parse(req.body);
	const user = requireUser(req);
	const result = await addEvidenceItem(id, body, String(user._id));
	return sendSuccess(res, result);
};

export const removeItem = async (req: Request, res: Response) => {
	const { id, itemId } = EvidenceCollectionItemParamsSchema.parse(req.params);
	const user = requireUser(req);
	const result = await removeEvidenceItem(id, itemId, String(user._id));
	return sendSuccess(res, result);
};

export const getByEntity = async (req: Request, res: Response) => {
	const { entityType, entityId } = EvidenceCollectionByEntityParamsSchema.parse(req.params);
	const result = await getEvidenceCollectionsByEntity(entityType, entityId);
	return sendSuccess(res, result);
};
