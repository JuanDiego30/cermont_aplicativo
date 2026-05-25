/**
 * Evidence Service — Business Logic Layer
 *
 * DOC-10 §5 compliance:
 * - Upload pipeline: multer MemoryStorage → sharp → local filesystem
 * - Compression to WebP format
 * - 10MB size limit validation
 * - Image MIME type restriction
 * - Metadata persistence
 * - Soft delete
 * - Async auditing
 */

import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { BadRequestError, NotFoundError } from "../../common/errors/AppError";
import { saveFile } from "../../common/storage/local-storage";
import { scanWithClamAV } from "../../middlewares/uploadMiddleware";
import { Evidence, Order } from "../../models";
import type { IEvidenceDocument } from "../../models/Evidence";
import { createAuditLog } from "../../modules/audit/audit.service";
import { getOrderByIdWithAuth } from "../order/order-crud.service";

export interface EvidenceResponse {
	_id: string;
	orderId: string;
	type: "before" | "during" | "after" | "defect" | "safety" | "signature";
	url: string;
	filename: string;
	mimeType: string;
	sizeBytes: number;
	description?: string;
	gpsLocation?: {
		lat: number;
		lng: number;
		capturedAt: Date;
	};
	capturedAt: Date;
	uploadedAt: Date;
	uploadedBy: string;
	createdAt: Date;
	updatedAt: Date;
}

interface EvidenceCreationOptions {
	idempotencyKey?: string;
}

/**
 * Format evidence document for API response
 */
function formatEvidenceResponse(doc: IEvidenceDocument): EvidenceResponse {
	return {
		_id: doc._id.toString(),
		orderId: doc.orderId.toString(),
		type: doc.type,
		url: doc.url,
		filename: doc.filename,
		mimeType: doc.mimeType,
		sizeBytes: doc.sizeBytes,
		description: doc.description,
		gpsLocation: doc.gpsLocation,
		capturedAt: doc.capturedAt,
		uploadedAt: doc.uploadedAt,
		uploadedBy: doc.uploadedBy.toString(),
		createdAt: doc.createdAt,
		updatedAt: doc.updatedAt,
	};
}

function normalizeIdempotencyKey(value?: string): string | undefined {
	if (typeof value !== "string") {
		return undefined;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Process and save image file
 *
 * @param buffer - Raw file buffer from multer
 * @param orderId - Associated order ID
 * @param userId - User uploading the file
 * @returns { filename, url, sizeBytes }
 */
async function processImageFile(
	buffer: Buffer,
	_orderId: string,
	_userId: string,
): Promise<{ filename: string; url: string; sizeBytes: number }> {
	// Generate unique filename
	const timestamp = Date.now();
	const unique = uuidv4();
	const filename = `${timestamp}-${unique}.webp`;

	// Compress and convert to WebP using sharp
	const compressedBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();

	// Save to filesystem
	const url = await saveFile(filename, compressedBuffer);

	return {
		filename,
		url,
		sizeBytes: compressedBuffer.length,
	};
}

/**
 * Create evidence entry
 *
 * @param orderId - Order ID
 * @param type - Evidence type
 * @param fileBuffer - Image buffer
 * @param userId - User uploading
 * @param payload - Additional metadata (description, GPS, capturedAt)
 * @returns EvidenceResponse
 */
export async function createEvidence(
	orderId: string,
	type: "before" | "during" | "after" | "defect" | "safety" | "signature",
	fileBuffer: Buffer,
	userId: string,
	payload: {
		description?: string;
		gpsLocation?: { lat: number; lng: number; capturedAt: Date };
		capturedAt: Date;
	},
	options?: EvidenceCreationOptions,
): Promise<EvidenceResponse> {
	const idempotencyKey = normalizeIdempotencyKey(options?.idempotencyKey);

	if (idempotencyKey) {
		const existingEvidence = await Evidence.findOne({ idempotencyKey }).lean();
		if (existingEvidence) {
			return formatEvidenceResponse(existingEvidence);
		}
	}

	// Validate order exists
	const order = await Order.findById(orderId).lean();
	if (!order) {
		throw new NotFoundError("Order", orderId);
	}

	// Validate order state — reject uploads if cancelled/closed
	if (!["assigned", "in_progress", "completed"].includes(order.status)) {
		throw new BadRequestError(
			`Cannot upload evidence for order in ${order.status} state. Order must be assigned, in progress, or recently completed.`,
		);
	}

	const isSafe = await scanWithClamAV(fileBuffer, `evidence-${orderId}-${type}`);
	if (!isSafe) {
		throw new BadRequestError("Malware detected in uploaded evidence file");
	}

	// Process image (compress, convert to WebP, save)
	const { filename, url, sizeBytes } = await processImageFile(fileBuffer, orderId, userId);

	// Create evidence record
	const evidence = new Evidence({
		orderId,
		type,
		idempotencyKey,
		filename,
		url,
		mimeType: "image/webp",
		sizeBytes,
		description: payload.description,
		gpsLocation: payload.gpsLocation,
		capturedAt: payload.capturedAt,
		uploadedAt: new Date(),
		uploadedBy: userId,
	});

	await evidence.save();

	// Async audit log
	createAuditLog({
		action: "EVIDENCE_UPLOADED",
		entity: "Evidence",
		entityId: evidence._id.toString(),
		userId,
		metadata: {
			orderId,
			filename,
			type,
			sizeBytes,
		},
	});

	return formatEvidenceResponse(evidence);
}

/**
 * Get evidences for an order
 *
 * @param orderId - Order ID
 * @param actor - Requesting user for authorization check
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @returns { evidences, total, page, limit, pages }
 * @throws ForbiddenError if user doesn't have access to the order
 * @throws NotFoundError if order doesn't exist
 */
export async function getEvidencesByOrderId(
	orderId: string,
	actor: { _id: string; role: string },
	page: number = 1,
	limit: number = 20,
) {
	// Verify that user has access to this order
	await getOrderByIdWithAuth(orderId, actor);

	const skip = (page - 1) * limit;
	const total = await Evidence.countDocuments({ orderId });
	const evidences = await Evidence.find({ orderId })
		.skip(skip)
		.limit(limit)
		.sort({ createdAt: -1 })
		.lean();

	const pages = Math.ceil(total / limit);

	return {
		evidences: evidences.map(formatEvidenceResponse),
		total,
		page,
		limit,
		pages,
	};
}

/**
 * Get evidence by ID
 *
 * @param evidenceId - Evidence ID
 * @returns EvidenceResponse
 */
export async function getEvidenceById(evidenceId: string): Promise<EvidenceResponse> {
	const evidence = await Evidence.findById(evidenceId).lean();

	if (!evidence) {
		throw new NotFoundError("Evidence", evidenceId);
	}

	return formatEvidenceResponse(evidence as unknown as IEvidenceDocument);
}

/**
 * Soft delete evidence
 *
 * Marks as deleted without physical removal (preserves trazabilidad)
 *
 * @param evidenceId - Evidence ID
 * @param userId - User performing deletion
 * @returns EvidenceResponse
 */
export async function deleteEvidence(
	evidenceId: string,
	userId: string,
): Promise<EvidenceResponse> {
	const evidence = await Evidence.findById(evidenceId);

	if (!evidence) {
		throw new NotFoundError("Evidence", evidenceId);
	}

	// Soft delete: just mark deletedAt flag to preserve audit trail
	evidence.deletedAt = new Date();
	await evidence.save();

	// Async audit log
	createAuditLog({
		action: "EVIDENCE_DELETED",
		entity: "Evidence",
		entityId: evidence._id.toString(),
		userId,
		metadata: {
			orderId: evidence.orderId.toString(),
			filename: evidence.filename,
		},
	});

	return formatEvidenceResponse(evidence);
}
