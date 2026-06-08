/**
 * Document Ingestion Controller — PROMPT 18
 * Thin HTTP layer. Delegates to DocumentIngestionService.
 */

import type { StatusObject } from "@cermont/shared-types";
import {
	BulkClosingEvidenceRequestSchema,
	IngestDocumentRequestSchema,
	isPresent,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { Types } from "mongoose";
import { BadRequestError } from "../../common/errors";
import { sendCreated, sendSuccess } from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import { Document, DocumentExtractionJob, TemplateDraft } from "../../models";
import { convertTemplateDraftToTemplate } from "../../modules/template-draft/template-draft.service";
import {
	applyClosingEvidenceMetadata,
	type ClosingEvidenceRoutingOutcome,
} from "../../services/closing-evidence-routing.service";
import { ingestDocument } from "./document-ingestion.service";

type ClosingEvidenceOutcome = { documentId: string } & ClosingEvidenceRoutingOutcome;

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
	const results = processed.filter(isPresent).map((r) => r.value);

	return sendSuccess(res, {
		processed: results.length,
		details: results,
	});
};

async function processClosingEvidenceDocument(
	documentId: string,
	serviceCaseId: string | undefined,
): Promise<StatusObject<ClosingEvidenceOutcome>> {
	if (!Types.ObjectId.isValid(documentId)) {
		return { status: "absent" };
	}

	const doc = await Document.findById(documentId);
	if (!doc) {
		return { status: "absent" };
	}

	const routing = applyClosingEvidenceMetadata(doc, { serviceCaseId });
	await doc.save();

	return {
		status: "present",
		value: {
			documentId,
			...routing,
		},
	};
}
