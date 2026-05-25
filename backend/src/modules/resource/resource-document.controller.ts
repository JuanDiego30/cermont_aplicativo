/**
 * Resource Document Controller.
 * Associates library documents with resources/tools using persisted attachments.
 */

import type { Request, Response } from "express";
import { sendCreated, sendSuccess } from "../../common/interceptors/response.interceptor";
import { createLogger } from "../../common/utils/logger";
import { getString, requireUser } from "../../common/utils/request";
import {
	detachEntityDocumentAttachment,
	listEntityDocumentAttachments,
	upsertEntityDocumentAttachment,
} from "./document-attachment.controller-utils";

const log = createLogger("resource-document-controller");

export const attachDocumentToTool = async (req: Request, res: Response): Promise<void> => {
	const resourceId = getString(req.params.resourceId);
	const user = requireUser(req);
	const attachment = await upsertEntityDocumentAttachment({
		entityType: "tool",
		linkedEntityType: "asset",
		entityId: resourceId,
		requestBody: req.body,
		userId: user._id,
	});

	log.info("Document attached to resource", { resourceId, documentId: attachment.documentId });
	sendCreated(res, attachment);
};

export const listToolDocuments = async (req: Request, res: Response): Promise<void> => {
	const resourceId = getString(req.params.resourceId);
	const items = await listEntityDocumentAttachments("tool", resourceId);
	sendSuccess(res, items);
};

export const detachDocumentFromTool = async (req: Request, res: Response): Promise<void> => {
	const resourceId = getString(req.params.resourceId);
	const documentId = getString(req.params.documentId);
	const result = await detachEntityDocumentAttachment("tool", "asset", resourceId, documentId);

	log.info("Document detached from resource", { resourceId, documentId });
	sendSuccess(res, result);
};
