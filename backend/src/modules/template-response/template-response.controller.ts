/**
 * Template Response Controller — PROMPT 18/19
 * Thin HTTP layer for dynamic form responses.
 */

import type { Request, Response } from "express";
import { BadRequestError } from "../../common/errors";
import { sendCreated, sendSuccess } from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import {
	createTemplateResponse,
	getTemplateResponse,
	listTemplateResponses,
	submitTemplateResponse,
	updateTemplateResponse,
} from "./template-response.service";

export const create = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const result = await createTemplateResponse(req.body, String(user._id));
	return sendCreated(res, result);
};

export const getById = async (req: Request, res: Response) => {
	const id = req.params.id as string;
	if (!id) {
		throw new BadRequestError("Response ID is required");
	}
	const result = await getTemplateResponse(id);
	return sendSuccess(res, result);
};

export const update = async (req: Request, res: Response) => {
	const id = req.params.id as string;
	if (!id) {
		throw new BadRequestError("Response ID is required");
	}
	const user = requireUser(req);
	const result = await updateTemplateResponse(id, req.body, String(user._id));
	return sendSuccess(res, result);
};

export const submit = async (req: Request, res: Response) => {
	const id = req.params.id as string;
	if (!id) {
		throw new BadRequestError("Response ID is required");
	}
	const user = requireUser(req);
	const result = await submitTemplateResponse(id, String(user._id));
	return sendSuccess(res, result);
};

export const list = async (req: Request, res: Response) => {
	const result = await listTemplateResponses(req.query as Record<string, unknown>);
	return sendSuccess(res, result);
};
