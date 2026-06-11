import {
	ClientIdParamsSchema,
	CreateClientSchema,
	ListClientsQuerySchema,
	UpdateClientSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { sendCreated, sendSuccess } from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import * as ClientService from "./client.service";

export async function createClient(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const data = CreateClientSchema.parse(req.body);
	const client = await ClientService.createClient(data, String(user._id));
	sendCreated(res, client);
}

export async function listClients(req: Request, res: Response): Promise<void> {
	requireUser(req);
	const query = ListClientsQuerySchema.parse(req.query);
	const result = await ClientService.listClients(query);
	res.status(200).json({ success: true, ...result });
}

export async function getClient(req: Request, res: Response): Promise<void> {
	requireUser(req);
	const { id } = ClientIdParamsSchema.parse(req.params);
	const client = await ClientService.getClientById(id);
	sendSuccess(res, client);
}

export async function getClientHistory(req: Request, res: Response): Promise<void> {
	requireUser(req);
	const { id } = ClientIdParamsSchema.parse(req.params);
	const history = await ClientService.getClientHistory(id);
	sendSuccess(res, history);
}

export async function updateClient(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const { id } = ClientIdParamsSchema.parse(req.params);
	const data = UpdateClientSchema.parse(req.body);
	const client = await ClientService.updateClient(id, data, String(user._id));
	sendSuccess(res, client);
}

export async function deactivateClient(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const { id } = ClientIdParamsSchema.parse(req.params);
	const client = await ClientService.deactivateClient(id, String(user._id));
	sendSuccess(res, client);
}
