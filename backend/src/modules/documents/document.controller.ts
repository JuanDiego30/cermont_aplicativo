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
	ArchiveDocumentSchema,
	AssociateDocumentSchema,
	DocumentIdSchema,
	type DocumentListQuery,
	type UploadDocumentInput,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { BadRequestError } from "../../common/errors";
import { sendCreated, sendSuccess } from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import {
	archiveDocument as archiveDocumentService,
	associateDocument as associateDocumentService,
	createDocument,
	deleteDocument as deleteDocumentService,
	findAllDocuments,
	getDocumentAssociations as getDocumentAssociationsService,
	signDocument as signDocumentService,
} from "./document.service";

export const uploadDocument = async (req: Request, res: Response) => {
	if (!req.file) {
		throw new BadRequestError("No file uploaded");
	}

	const user = requireUser(req);
	const body = req.body as UploadDocumentInput;
	const { linkedEntityId, linkedEntityType, purpose, targetStepCode, title } = body;
	const orderId = body.orderId || body.order_id || undefined;
	const serviceCaseId =
		linkedEntityType === "service_case" &&
		typeof linkedEntityId === "string" &&
		linkedEntityId.length > 0
			? linkedEntityId
			: undefined;
	const userId = user._id;
	// processUploadedFile middleware sets req.file.storedPath
	// (multer uses memoryStorage so req.file.path is undefined)
	const storedPath = req.file.storedPath;

	if (!storedPath) {
		throw new BadRequestError("Uploaded file was not stored correctly");
	}

	// DocumentService throws on error — Express 5 propagates to error handler
	const document = await createDocument(
		{
			title,
			orderId,
			purpose,
			targetStepCode,
			requirementKey: body.requirementKey,
			serviceCaseId,
			linkedEntityType,
			linkedEntityId:
				typeof linkedEntityId === "string" && linkedEntityId.length > 0
					? linkedEntityId
					: undefined,
			mimeType: req.file.mimetype,
			fileSize: req.file.size,
		},
		storedPath,
		userId,
	);

	// Cleanup is handled by DocumentService or error handler middleware
	return sendCreated(res, document);
};

export const getAllDocuments = async (_req: Request, res: Response) => {
	const query = _req.query as DocumentListQuery;
	const orderId = query.orderId || query.order_id || undefined;
	const serviceCaseId = query.serviceCaseId || undefined;
	const purpose = query.purpose || undefined;
	const stepCode = query.stepCode || query.stepId || undefined;
	const includeArchived = query.includeArchived === true;

	const documents = await findAllDocuments({
		orderId,
		purpose,
		serviceCaseId,
		stepCode,
		includeArchived,
	});
	return sendSuccess(res, documents);
};

export const associateDocument = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const { id } = DocumentIdSchema.parse(req.params);
	const payload = AssociateDocumentSchema.parse(req.body);
	const linkedEntityId =
		typeof payload.linkedEntityId === "string" && payload.linkedEntityId.length > 0
			? payload.linkedEntityId
			: undefined;

	const document = await associateDocumentService(
		id,
		{
			...payload,
			orderId: payload.orderId || undefined,
			serviceCaseId: payload.serviceCaseId || undefined,
			linkedEntityId,
		},
		user._id,
	);
	return sendSuccess(res, document);
};

export const getDocumentAssociations = async (req: Request, res: Response) => {
	const { id } = DocumentIdSchema.parse(req.params);
	const associations = await getDocumentAssociationsService(id);
	return sendSuccess(res, associations);
};

export const deleteDocument = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const { id } = DocumentIdSchema.parse(req.params);
	const payload = ArchiveDocumentSchema.parse(req.body || {});
	const result = await deleteDocumentService(id, user._id, payload.reason);
	return sendSuccess(res, result);
};

export const archiveDocument = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const { id } = DocumentIdSchema.parse(req.params);
	const payload = ArchiveDocumentSchema.parse(req.body || {});
	const document = await archiveDocumentService(id, user._id, payload.reason);
	return sendSuccess(res, document);
};

export const signDocument = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const userId = user._id;
	const { id } = DocumentIdSchema.parse(req.params);
	const document = await signDocumentService(id, userId);
	return sendSuccess(res, document);
};
