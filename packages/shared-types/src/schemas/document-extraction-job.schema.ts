/**
 * Document Extraction Job Schema — Unified extraction pipeline
 *
 * Represents an asynchronous job that extracts structured data from a
 * DocumentSourceFile using a pluggable adapter architecture.
 *
 * Phase 1: Cross-cutting Document Ingestion Layer
 */

import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

// ─── Adapter ───────────────────────────────────────────────────────────────────

export const ExtractionAdapterSchema = z.enum([
	"sheetjs",
	"pdf_basic",
	"docling_sidecar",
	"paddleocr_sidecar",
	"unstructured_sidecar",
	"manual",
]);
export type ExtractionAdapter = z.infer<typeof ExtractionAdapterSchema>;

// ─── Status ────────────────────────────────────────────────────────────────────

export const ExtractionJobStatusSchema = z.enum([
	"queued",
	"processing",
	"completed",
	"failed",
	"cancelled",
]);
export type ExtractionJobStatus = z.infer<typeof ExtractionJobStatusSchema>;

// ─── Create ────────────────────────────────────────────────────────────────────

export const CreateDocumentExtractionJobSchema = z
	.object({
		documentSourceFileId: ObjectIdSchema,
		adapter: ExtractionAdapterSchema,
		requestedBy: ObjectIdSchema,
	})
	.strict();

export type CreateDocumentExtractionJob = z.infer<typeof CreateDocumentExtractionJobSchema>;

// ─── Retry ─────────────────────────────────────────────────────────────────────

export const RetryDocumentExtractionJobSchema = z
	.object({
		reason: z.string().max(500).optional(),
	})
	.strict();

export type RetryDocumentExtractionJob = z.infer<typeof RetryDocumentExtractionJobSchema>;

// ─── Full Record ─────────────────────────────────────────────────────────────────

export const DocumentExtractionJobSchema = z
	.object({
		_id: ObjectIdSchema,
		documentSourceFileId: ObjectIdSchema,
		adapter: ExtractionAdapterSchema,
		status: ExtractionJobStatusSchema,
		startedAt: z.string().datetime().optional(),
		finishedAt: z.string().datetime().optional(),
		errorCode: z.string().max(100).optional(),
		errorMessage: z.string().max(2000).optional(),
		retryCount: z.number().int().min(0).default(0),
		confidence: z.number().min(0).max(1).optional(),
		requiresHumanReview: z.boolean().default(false),
		requiresOcr: z.boolean().default(false),
		createdBy: ObjectIdSchema,
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type DocumentExtractionJob = z.infer<typeof DocumentExtractionJobSchema>;

// ─── ID Params ─────────────────────────────────────────────────────────────────

export const DocumentExtractionJobIdSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export type DocumentExtractionJobIdParams = z.infer<typeof DocumentExtractionJobIdSchema>;
