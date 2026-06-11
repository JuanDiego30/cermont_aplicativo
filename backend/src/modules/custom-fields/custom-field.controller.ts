import type { Request, Response } from "express";
import { sendCreated, sendSuccess } from "../../common/interceptors/response.interceptor";
import { getString, requireUser } from "../../common/utils/request";
import * as service from "./custom-field.service";

export async function list(req: Request, res: Response): Promise<void> {
	const data = await service.listDefinitions(
		getString(req.query.entityType as string),
		req.query.includeInactive === "true",
	);
	sendSuccess(res, data);
}

export async function getById(req: Request, res: Response): Promise<void> {
	const data = await service.getDefinitionById(getString(req.params.id));
	sendSuccess(res, data);
}

export async function create(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const data = await service.createDefinition(req.body, String(user._id));
	sendCreated(res, data);
}

export async function update(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const data = await service.updateDefinition(getString(req.params.id), req.body, String(user._id));
	sendSuccess(res, data);
}

export async function remove(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const data = await service.deleteDefinition(getString(req.params.id), String(user._id));
	sendSuccess(res, data);
}
