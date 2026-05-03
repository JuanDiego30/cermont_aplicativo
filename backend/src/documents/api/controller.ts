/**
 * Document Controller — Thin HTTP layer for document management
 *
 * DOC-11 Regla 2 compliance:
 * - NO try/catch blocks (Express 5 propagates async errors natively)
 * - Delegates all business logic to DocumentService
 * - Returns standardized HTTP responses
 *
 * Reference: DOC-03, DOC-11
 */

import {
	DocumentIdSchema,
	type DocumentListQuery,
	type UploadDocumentInput,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { BadRequestError } from "../../_shared/common/errors";
import {
	sendCreated,
	sendPaginated,
	sendSuccess,
} from "../../_shared/common/interceptors/response.interceptor";
import { requireUser } from "../../_shared/common/utils/request";
import { DocumentService } from "../application/service";

export const uploadDocument = async (req: Request, res: Response) => {
	if (!req.file) {
		throw new BadRequestError("No file uploaded");
	}

	const user = requireUser(req);
	const body = req.body as UploadDocumentInput;
	const { title, category, phase } = body;
	const orderId = body.orderId || body.order_id || undefined;
	const userId = user._id;
	const storedPath = req.file.path;

	if (!storedPath) {
		throw new BadRequestError("Uploaded file was not stored correctly");
	}

	// DocumentService throws on error — Express 5 propagates to error handler
	const document = await DocumentService.create(
		{ title, category, orderId, phase },
		storedPath,
		userId,
	);

	// Cleanup is handled by DocumentService or error handler middleware
	return sendCreated(res, document);
};

export const getAllDocuments = async (req: Request, res: Response) => {
	const query = req.query as unknown as DocumentListQuery;
	const orderId = query.orderId || query.order_id || undefined;
	const category = query.category || undefined;
	const phase = query.phase || undefined;
	const page = query.page ?? 1;
	const limit = query.limit ?? 20;

	const result = await DocumentService.findAll(
		orderId || category || phase ? { orderId, category, phase } : undefined,
		page,
		limit,
	);

	return sendPaginated(res, result.data, result.total, result.page, result.limit);
};

export const deleteDocument = async (req: Request, res: Response) => {
	const { id } = DocumentIdSchema.parse(req.params);
	await DocumentService.delete(id);
	return sendSuccess(res, { message: "Document deleted successfully" });
};

export const signDocument = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const userId = user._id;
	const { id } = DocumentIdSchema.parse(req.params);
	const document = await DocumentService.sign(id, userId);
	return sendSuccess(res, document);
};
