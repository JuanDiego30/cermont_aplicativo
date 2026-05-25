/**
 * Document Import Controller — persistent compatibility layer.
 *
 * The active ingestion flow is /api/documents/:documentId/ingest. Legacy
 * endpoints below can list/read persisted jobs, but cannot create fake imports.
 */

import type { Request, Response } from "express";
import { sendSuccess } from "../../common/interceptors/response.interceptor";
import { isValidObjectId } from "../../common/utils/parseObjectId";
import {
	DocumentExtractionJob,
	type IDocumentExtractionJobDocument,
} from "../../models/DocumentExtractionJob";

interface DocumentImportJobResponse {
	_id: string;
	documentSourceFileId: string;
	adapter: IDocumentExtractionJobDocument["adapter"];
	status: IDocumentExtractionJobDocument["status"];
	retryCount: number;
	requiresHumanReview: boolean;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
	startedAt?: string;
	finishedAt?: string;
	errorCode?: string;
	errorMessage?: string;
	confidence?: number;
	replacementEndpoint: string;
}

function toImportJobResponse(job: IDocumentExtractionJobDocument): DocumentImportJobResponse {
	const response: DocumentImportJobResponse = {
		_id: job._id.toString(),
		documentSourceFileId: job.documentSourceFileId.toString(),
		adapter: job.adapter,
		status: job.status,
		retryCount: job.retryCount,
		requiresHumanReview: job.requiresHumanReview,
		createdBy: job.createdBy.toString(),
		createdAt: job.createdAt.toISOString(),
		updatedAt: job.updatedAt.toISOString(),
		replacementEndpoint: `/api/documents/${job.documentSourceFileId.toString()}/ingest`,
	};

	if (job.startedAt) {
		response.startedAt = job.startedAt.toISOString();
	}
	if (job.finishedAt) {
		response.finishedAt = job.finishedAt.toISOString();
	}
	if (job.errorCode) {
		response.errorCode = job.errorCode;
	}
	if (job.errorMessage) {
		response.errorMessage = job.errorMessage;
	}
	if (typeof job.confidence === "number") {
		response.confidence = job.confidence;
	}

	return response;
}

function sendLegacyImportGone(res: Response): void {
	res.status(410).json({
		success: false,
		error: {
			code: "LEGACY_DOCUMENT_IMPORT_REPLACED",
			message:
				"Legacy document import endpoints do not create or analyze in-memory jobs. Upload a document and use the persistent ingestion endpoint.",
			details: {
				replacementEndpoint: "/api/documents/:documentId/ingest",
				statusEndpoint: "/api/documents/:documentId/ingest/status",
			},
		},
	});
}

export async function createImport(_req: Request, res: Response): Promise<void> {
	sendLegacyImportGone(res);
}

export async function listImports(_req: Request, res: Response): Promise<void> {
	const jobs = await DocumentExtractionJob.find().sort({ createdAt: -1 }).limit(100).exec();
	sendSuccess(res, jobs.map(toImportJobResponse));
}

export async function getImport(req: Request, res: Response): Promise<void> {
	const id = String(req.params.id);
	if (!isValidObjectId(id)) {
		res.status(400).json({
			success: false,
			error: { code: "INVALID_IMPORT_ID", message: "Document import id must be a Mongo ObjectId" },
		});
		return;
	}

	const job = await DocumentExtractionJob.findById(id).exec();
	if (!job) {
		res.status(404).json({
			success: false,
			error: { code: "IMPORT_NOT_FOUND", message: "Document import job not found" },
		});
		return;
	}

	sendSuccess(res, toImportJobResponse(job));
}

export async function analyzeImport(_req: Request, res: Response): Promise<void> {
	sendLegacyImportGone(res);
}
