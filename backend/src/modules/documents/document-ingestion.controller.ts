/**
 * Document Ingestion Controller — PROMPT 18
 * Thin HTTP layer. Delegates to DocumentIngestionService.
 */

import {
	BulkClosingEvidenceRequestSchema,
	IngestDocumentRequestSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { Types } from "mongoose";
import { BadRequestError } from "../../common/errors";
import { sendCreated, sendSuccess } from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import { Document, DocumentExtractionJob, TemplateDraft } from "../../models";
import {
	applyClosingEvidenceMetadata,
	type ClosingEvidenceRoutingResult,
} from "../../services/closing-evidence-routing.service";
import { ingestDocument } from "./document-ingestion.service";
import { convertTemplateDraftToTemplate } from "../../modules/template-draft/template-draft.service";

type ClosingEvidenceResult = { documentId: string } & ClosingEvidenceRoutingResult;

export const ingestDocumentController = async (req: Request, res: Response) => {
	const documentId = req.params.documentId as string;
	if (!documentId) {
		throw new BadRequestError("documentId is required");
	}

	const validatedBody = IngestDocumentRequestSchema.parse(req.body);
	const user = requireUser(req);
	const result = await ingestDocument(documentId, String(user._id), validatedBody);
	return sendCreated(res, result);
};

export const getIngestionStatus = async (req: Request, res: Response) => {
	const documentId = req.params.documentId as string;
	if (!documentId) {
		throw new BadRequestError("documentId is required");
	}

	const job = await DocumentExtractionJob.findOne({
		documentSourceFileId: new Types.ObjectId(documentId),
	}).sort({ createdAt: -1 });

	if (!job) {
		return res.status(404).json({
			success: false,
			error: {
				code: "INGESTION_JOB_NOT_FOUND",
				message: "Ingestion job not found for this document",
			},
		});
	}

	return sendSuccess(res, {
		documentId,
		jobId: job._id.toString(),
		status: job.status,
		confidence: job.confidence,
		requiresHumanReview: job.requiresHumanReview,
		errorCode: job.errorCode,
		errorMessage: job.errorMessage,
	});
};

export const convertDocumentToTemplateController = async (req: Request, res: Response) => {
	const documentId = req.params.documentId as string;
	if (!documentId) {
		throw new BadRequestError("documentId is required");
	}

	const user = requireUser(req);
	const draft = await TemplateDraft.findOne({
		documentSourceFileId: new Types.ObjectId(documentId),
	});

	if (!draft) {
		return res.status(404).json({
			success: false,
			error: {
				code: "TEMPLATE_DRAFT_NOT_FOUND",
				message: "Template draft not found for this document",
			},
		});
	}

	const result = await convertTemplateDraftToTemplate(draft._id.toString(), String(user._id));
	return sendSuccess(res, result);
};

export const bulkClosingEvidenceController = async (req: Request, res: Response) => {
	const validatedBody = BulkClosingEvidenceRequestSchema.parse(req.body);
	const { documentIds, serviceCaseId } = validatedBody;

	const processed = await Promise.all(
		documentIds.map((docId) => processClosingEvidenceDocument(docId, serviceCaseId)),
	);
	const results = processed.filter((result): result is ClosingEvidenceResult => result !== null);

	return sendSuccess(res, {
		processed: results.length,
		details: results,
	});
};

async function processClosingEvidenceDocument(
	documentId: string,
	serviceCaseId: string | undefined,
): Promise<ClosingEvidenceResult | null> {
	if (!Types.ObjectId.isValid(documentId)) {
		return null;
	}

	const doc = await Document.findById(documentId);
	if (!doc) {
		return null;
	}

	const routing = applyClosingEvidenceMetadata(doc, { serviceCaseId });
	await doc.save();

	return {
		documentId,
		...routing,
	};
}
