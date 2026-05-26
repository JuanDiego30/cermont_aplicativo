/**
 * Kit Document Controller.
 * Associates library documents with maintenance kits using persisted attachments.
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

const log = createLogger("kit-document-controller");

export const attachDocumentToKit = async (req: Request, res: Response): Promise<void> => {
	const kitId = getString(req.params.kitId);
	const user = requireUser(req);
	const attachment = await upsertEntityDocumentAttachment({
		entityType: "kit",
		linkedEntityType: "maintenance",
		entityId: kitId,
		requestBody: req.body,
		userId: user._id,
	});

	log.info("Document attached to kit", { kitId, documentId: attachment.documentId });
	sendCreated(res, attachment);
};

export const listKitDocuments = async (req: Request, res: Response): Promise<void> => {
	const kitId = getString(req.params.kitId);
	const items = await listEntityDocumentAttachments("kit", kitId);
	sendSuccess(res, items);
};

export const detachDocumentFromKit = async (req: Request, res: Response): Promise<void> => {
	const kitId = getString(req.params.kitId);
	const documentId = getString(req.params.documentId);
	const result = await detachEntityDocumentAttachment("kit", "maintenance", kitId, documentId);

	log.info("Document detached from kit", { kitId, documentId });
	sendSuccess(res, result);
};
