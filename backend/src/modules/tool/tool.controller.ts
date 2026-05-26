import {
	AddToolCertificationSchema,
	AddToolDocumentSchema,
	CreateToolSchema,
	ToolCertificationParamsSchema,
	ToolDocumentParamsSchema,
	ToolIdParamsSchema,
	ToolListQuerySchema,
	UpdateToolSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import {
	sendCreated,
	sendPaginated,
	sendSuccess,
} from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import {
	addCertification,
	addDocument,
	createTool,
	getAllTools,
	getExpiredCertifications,
	getToolById,
	removeCertification,
	removeDocument,
	updateTool,
} from "./tool.service";

export const create = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const body = CreateToolSchema.parse(req.body);
	const result = await createTool(body, String(user._id));
	return sendCreated(res, result);
};

export const getAll = async (req: Request, res: Response) => {
	const query = ToolListQuerySchema.parse(req.query);
	const result = await getAllTools(
		{
			status: query.status,
			category: query.category,
			brand: query.brand,
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
	const { id } = ToolIdParamsSchema.parse(req.params);
	const result = await getToolById(id);
	return sendSuccess(res, result);
};

export const update = async (req: Request, res: Response) => {
	const { id } = ToolIdParamsSchema.parse(req.params);
	const body = UpdateToolSchema.parse(req.body);
	const user = requireUser(req);
	const result = await updateTool(id, body, String(user._id));
	return sendSuccess(res, result);
};

export const addToolCertification = async (req: Request, res: Response) => {
	const { id } = ToolIdParamsSchema.parse(req.params);
	const body = AddToolCertificationSchema.parse(req.body);
	const user = requireUser(req);
	const result = await addCertification(
		id,
		{
			...body,
			issuedAt: new Date(body.issuedAt),
			expiresAt: new Date(body.expiresAt),
		},
		String(user._id),
	);
	return sendSuccess(res, result);
};

export const removeToolCertification = async (req: Request, res: Response) => {
	const { id, certId } = ToolCertificationParamsSchema.parse(req.params);
	const user = requireUser(req);
	const result = await removeCertification(id, certId, String(user._id));
	return sendSuccess(res, result);
};

export const addToolDocument = async (req: Request, res: Response) => {
	const { id } = ToolIdParamsSchema.parse(req.params);
	const body = AddToolDocumentSchema.parse(req.body);
	const user = requireUser(req);
	const result = await addDocument(id, body, String(user._id));
	return sendSuccess(res, result);
};

export const removeToolDocument = async (req: Request, res: Response) => {
	const { id, docId } = ToolDocumentParamsSchema.parse(req.params);
	const user = requireUser(req);
	const result = await removeDocument(id, docId, String(user._id));
	return sendSuccess(res, result);
};

export const listExpiredCertifications = async (_req: Request, res: Response) => {
	const result = await getExpiredCertifications();
	return sendSuccess(res, result);
};
