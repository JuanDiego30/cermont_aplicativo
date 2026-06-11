import {
	ClientSignatureIdParamsSchema,
	CreateClientSignatureSchema,
	ListClientSignaturesQuerySchema,
	RejectClientSignatureSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { sendCreated, sendSuccess } from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import * as ClientSignatureService from "./client-signature.service";

export async function createSignature(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const input = CreateClientSignatureSchema.parse({
		...req.body,
		ipAddress: req.ip,
		userAgent: req.headers["user-agent"],
	});
	const signature = await ClientSignatureService.createSignature(input, String(user._id));
	sendCreated(res, signature);
}

export async function listSignatures(req: Request, res: Response): Promise<void> {
	requireUser(req);
	const query = ListClientSignaturesQuerySchema.parse(req.query);
	const result = await ClientSignatureService.listSignatures(query);
	res.status(200).json({ success: true, ...result });
}

export async function getSignature(req: Request, res: Response): Promise<void> {
	requireUser(req);
	const { id } = ClientSignatureIdParamsSchema.parse(req.params);
	const signature = await ClientSignatureService.getSignatureById(id);
	sendSuccess(res, signature);
}

export async function verifySignature(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const { id } = ClientSignatureIdParamsSchema.parse(req.params);
	const signature = await ClientSignatureService.verifySignature(id, String(user._id));
	sendSuccess(res, signature);
}

export async function rejectSignature(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const { id } = ClientSignatureIdParamsSchema.parse(req.params);
	const { reason } = RejectClientSignatureSchema.parse(req.body);
	const signature = await ClientSignatureService.rejectSignature(id, reason, String(user._id));
	sendSuccess(res, signature);
}
