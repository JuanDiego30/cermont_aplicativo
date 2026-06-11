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
 * - Support for V2 schema with variants and enhanced metadata
 */

import { Types } from "mongoose";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import {
	BadRequestError,
	NotFoundError,
	ServiceUnavailableError,
} from "../../common/errors/AppError";
import { saveFile } from "../../common/storage/local-storage";
import { isTransientDatabaseError } from "../../common/utils/transient-database-error";
import { scanWithClamAV } from "../../middlewares/uploadMiddleware";
import { Evidence, Order } from "../../models";
import type { IEvidenceDocument } from "../../models/Evidence";
import { createAuditLog } from "../../modules/audit/audit.service";
import { getOrderByIdWithAuth } from "../order/order-crud.service";

/**
 * Validate image magic bytes (PNG, JPEG, WebP, GIF)
 */
function hasValidImageMagicBytes(buffer: Buffer): boolean {
	if (buffer.length < 8) {
		return false;
	}
	// PNG: 89 50 4E 47
	if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
		return true;
	}
	// JPEG: FF D8 FF
	if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
		return true;
	}
	// WebP/GIF: RIFF (52 49 46 46) or GIF8 (47 49 46 38)
	if (
		(buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) ||
		(buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38)
	) {
		return true;
	}
	return false;
}

// Import V2 types from shared-types
import type { EvidenceCategory, EvidencePhase } from "@cermont/shared-types";

export interface EvidenceSnapshot {
	_id: string;
	orderId: string;
	type?: string;
	url: string;
	filename: string;
	mimeType: string;
	sizeBytes: number;
	title?: string;
	description?: string;
	gpsLocation?: {
		lat: number;
		lng: number;
		accuracy?: number;
		capturedAt?: Date;
	};
	capturedAt: Date;
	uploadedAt?: Date;
	uploadedBy: string;
	verifiedAt?: Date;
	verifiedBy?: string;
	createdAt: Date;
	updatedAt: Date;
}

interface EvidenceCreationOptions {
	idempotencyKey?: string;
}

/**
 * Format evidence document for API response (V1)
 */
function formatEvidenceResponse(doc: IEvidenceDocument): EvidenceSnapshot {
	return {
		_id: doc._id.toString(),
		orderId: doc.workOrderId?.toString() || doc.orderId?.toString() || "",
		type: doc.type || "during",
		url: doc.url,
		filename: doc.filename,
		mimeType: doc.mimeType,
		sizeBytes: doc.sizeBytes,
		title: doc.title,
		description: doc.description,
		gpsLocation: doc.gpsLocation as { lat: number; lng: number; capturedAt: Date } | undefined,
		capturedAt: doc.capturedAt,
		uploadedAt: doc.uploadedAt,
		uploadedBy: doc.uploadedBy.toString(),
		verifiedAt: doc.verifiedAt,
		verifiedBy: doc.verifiedBy?.toString(),
		createdAt: doc.createdAt,
		updatedAt: doc.updatedAt,
	};
}

/**
 * Format evidence document for API response (V2)
 */
function formatEvidenceResponseV2(doc: IEvidenceDocument): EvidenceSnapshot {
	return {
		_id: doc._id.toString(),
		orderId: doc.workOrderId?.toString() || doc.orderId?.toString() || "",
		type: doc.type || "during",
		url: doc.url,
		filename: doc.filename,
		mimeType: doc.mimeType,
		sizeBytes: doc.sizeBytes,
		title: doc.title,
		description: doc.description,
		gpsLocation: doc.gpsLocation as { lat: number; lng: number; capturedAt: Date } | undefined,
		capturedAt: doc.capturedAt,
		uploadedAt: doc.uploadedAt,
		uploadedBy: doc.uploadedBy.toString(),
		verifiedAt: doc.verifiedAt,
		verifiedBy: doc.verifiedBy?.toString(),
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
 * Get evidence statistics for dashboard
 */
export async function getEvidenceStats(_actor: { _id: string; role: string }): Promise<{
	total: number;
	pending: number;
	verified: number;
}> {
	const [total, verified] = await Promise.all([
		Evidence.countDocuments({}),
		Evidence.countDocuments({ verifiedAt: { $ne: null } }),
	]);

	return {
		total,
		pending: total - verified,
		verified,
	};
}

/**
 * Create evidence entry (V1 - legacy, for backward compatibility)
 *
 * @param orderId - Order ID
 * @param type - Evidence type
 * @param fileBuffer - Image buffer
 * @param userId - User uploading
 * @param payload - Additional metadata (description, GPS, capturedAt)
 * @returns EvidenceSnapshot
 */
export async function createEvidence(
	orderId: string,
	type: "before" | "during" | "after" | "defect" | "safety" | "signature",
	fileBuffer: Buffer,
	userId: string,
	payload: {
		title?: string;
		description?: string;
		gpsLocation?: { lat: number; lng: number; capturedAt: Date };
		capturedAt: Date;
	},
	options?: EvidenceCreationOptions,
): Promise<EvidenceSnapshot> {
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

	if (!hasValidImageMagicBytes(fileBuffer)) {
		throw new BadRequestError("Invalid file type. Must be PNG, JPEG, WebP, or GIF");
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
		title: payload.title,
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
 * Create evidence entry (V2 - enhanced with variants and full metadata)
 *
 * @param payload - V2 evidence payload with all fields
 * @param fileBuffer - Image buffer
 * @param userId - User uploading
 * @param options - Additional options (idempotencyKey)
 * @returns EvidenceResponseV2
 */
export async function createEvidenceV2(
	payload: {
		phase: EvidencePhase;
		category: EvidenceCategory;
		serviceCaseId: string;
		workOrderId?: string;
		executionSessionId?: string;
		description?: string;
		mimeType: string;
		sizeBytes?: number;
		temporaryUrl?: string;
		gpsLocation?: {
			lat: number;
			lng: number;
			accuracy?: number;
			capturedAt?: string;
		};
		capturedAt: string;
		uploadedBy: string;
		deviceId?: string;
		syncStatus?: "pending" | "syncing" | "synced" | "failed";
	},
	fileBuffer: Buffer,
	userId: string,
	options?: { idempotencyKey?: string },
): Promise<EvidenceSnapshot> {
	const idempotencyKey = normalizeIdempotencyKey(options?.idempotencyKey);

	if (idempotencyKey) {
		const existingEvidence = await Evidence.findOne({ idempotencyKey }).lean();
		if (existingEvidence) {
			return formatEvidenceResponseV2(existingEvidence as unknown as IEvidenceDocument);
		}
	}

	// Validate order exists if workOrderId provided
	if (payload.workOrderId) {
		const order = await Order.findById(payload.workOrderId).lean();
		if (!order) {
			throw new NotFoundError("Order", payload.workOrderId);
		}
	}

	// Validate service case exists
	const { ServiceCase } = await import("../../models/index.js");
	const serviceCase = await ServiceCase.findById(payload.serviceCaseId).lean();
	if (!serviceCase) {
		throw new NotFoundError("ServiceCase", payload.serviceCaseId);
	}

	// Validate image
	if (!hasValidImageMagicBytes(fileBuffer)) {
		throw new BadRequestError("Invalid file type. Must be PNG, JPEG, WebP, or GIF");
	}

	if (fileBuffer.length > 10 * 1024 * 1024) {
		throw new BadRequestError("File exceeds 10MB limit");
	}

	const isSafe = await scanWithClamAV(
		fileBuffer,
		`evidence-v2-${payload.serviceCaseId}-${uuidv4()}`,
	);
	if (!isSafe) {
		throw new BadRequestError("Malware detected in uploaded evidence file");
	}

	// Process image - generate variants
	const timestamp = Date.now();
	const unique = uuidv4();
	const originalFilename = `${timestamp}-${unique}.webp`;
	const webFilename = `${timestamp}-${unique}-web.webp`;
	const thumbnailFilename = `${timestamp}-${unique}-thumb.webp`;

	const originalBuffer = await sharp(fileBuffer).webp({ quality: 90 }).toBuffer();
	const webBuffer = await sharp(fileBuffer).webp({ quality: 80 }).toBuffer();
	const thumbnailBuffer = await sharp(fileBuffer)
		.resize(200, 200, { fit: "cover" })
		.webp({ quality: 60 })
		.toBuffer();

	const originalUrl = await saveFile(originalFilename, originalBuffer);
	const webUrl = await saveFile(webFilename, webBuffer);
	const thumbnailUrl = await saveFile(thumbnailFilename, thumbnailBuffer);

	// Get image dimensions using sharp's metadata API
	const sharpMetadata = await sharp(fileBuffer).metadata();
	const width = sharpMetadata.width || 0;
	const height = sharpMetadata.height || 0;

	// Create V2 evidence record
	const evidence = new Evidence({
		code: `EVID-${timestamp}`,
		phase: payload.phase,
		category: payload.category,
		serviceCaseId: payload.serviceCaseId,
		workOrderId: payload.workOrderId,
		executionSessionId: payload.executionSessionId,
		description: payload.description,
		mimeType: payload.mimeType,
		sizeBytes: payload.sizeBytes || originalBuffer.length,
		url: originalUrl,
		variants: [
			{
				url: webUrl,
				variant: "web",
				width: Math.min(width, 1200),
				height: Math.round((height * Math.min(width, 1200)) / width) || 0,
				sizeBytes: webBuffer.length,
				uploadedAt: new Date(),
			},
			{
				url: thumbnailUrl,
				variant: "thumbnail",
				width: 200,
				height: 200,
				sizeBytes: thumbnailBuffer.length,
				uploadedAt: new Date(),
			},
		],
		uploadedBy: payload.uploadedBy,
		uploadedByName: userId, // Will be populated by population
		capturedAt: payload.capturedAt,
		offlineCapturedAt: payload.capturedAt,
		gpsLocation: payload.gpsLocation,
		syncStatus: payload.syncStatus || "synced",
		idempotencyKey,
		deviceId: payload.deviceId,
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	await evidence.save();

	// Populate user reference
	await evidence.populate("uploadedBy", "name email");

	// Async audit log
	createAuditLog({
		action: "EVIDENCE_UPLOADED",
		entity: "Evidence",
		entityId: evidence._id.toString(),
		userId,
		metadata: {
			serviceCaseId: payload.serviceCaseId,
			phase: payload.phase,
			category: payload.category,
			sizeBytes: evidence.sizeBytes,
		},
	});

	return formatEvidenceResponseV2(evidence);
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
	const [total, evidences] = await Promise.all([
		Evidence.countDocuments({ orderId }),
		Evidence.find({ orderId }).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
	]).catch((error: unknown) => {
		if (isTransientDatabaseError(error as Error)) {
			throw new ServiceUnavailableError("Database temporarily unavailable. Please try again.");
		}
		throw error;
	});

	const pages = Math.ceil(total / limit);

	return {
		evidences: evidences.map((e) => ({
			_id: e._id.toString(),
			orderId: e.workOrderId?.toString() || e.orderId?.toString() || "",
			type: e.type || "during",
			url: e.url,
			filename: e.filename,
			mimeType: e.mimeType,
			sizeBytes: e.sizeBytes,
			title: e.title,
			description: e.description,
			gpsLocation: e.gpsLocation,
			capturedAt: e.capturedAt,
			uploadedAt: e.uploadedAt,
			uploadedBy: e.uploadedBy.toString(),
			verifiedAt: e.verifiedAt,
			verifiedBy: e.verifiedBy?.toString(),
			createdAt: e.createdAt,
			updatedAt: e.updatedAt,
		})),
		total,
		page,
		limit,
		pages,
	};
}

/**
 * List evidences with pagination and optional filters
 */
export async function listEvidences(
	query: {
		page: number;
		limit: number;
		orderId?: string;
		status?: string;
	},
	_actor: { _id: string; role: string },
): Promise<{
	data: EvidenceSnapshot[];
	total: number;
	page: number;
	limit: number;
	pages: number;
}> {
	const filter: Record<string, unknown> = {};
	if (query.orderId) {
		filter.$or = [{ orderId: query.orderId }, { workOrderId: query.orderId }];
	}
	if (query.status) {
		filter.verifiedAt = query.status === "verified" ? { $ne: null } : null;
	}

	const skip = (query.page - 1) * query.limit;
	const [total, docs] = await Promise.all([
		Evidence.countDocuments(filter),
		Evidence.find(filter).skip(skip).limit(query.limit).sort({ createdAt: -1 }).lean(),
	]).catch((error: unknown) => {
		if (isTransientDatabaseError(error as Error)) {
			throw new ServiceUnavailableError("Database temporarily unavailable. Please try again.");
		}
		throw error;
	});

	return {
		data: docs.map(formatEvidenceResponse),
		total,
		page: query.page,
		limit: query.limit,
		pages: Math.ceil(total / query.limit),
	};
}

/**
 * Get evidence by ID
 *
 * @param evidenceId - Evidence ID
 * @returns EvidenceSnapshot
 */
export async function getEvidenceById(
	evidenceId: string,
	actor: { _id: string; role: string },
): Promise<EvidenceSnapshot> {
	const evidence = await Evidence.findById(evidenceId).lean();

	if (!evidence) {
		throw new NotFoundError("Evidence", evidenceId);
	}

	const orderId = evidence.workOrderId?.toString() || evidence.orderId?.toString() || "";
	if (!orderId) {
		throw new NotFoundError("Order", "linked evidence order");
	}

	await getOrderByIdWithAuth(orderId, actor);

	return {
		_id: evidence._id.toString(),
		orderId,
		type: evidence.type || "during",
		url: evidence.url,
		filename: evidence.filename,
		mimeType: evidence.mimeType,
		sizeBytes: evidence.sizeBytes,
		title: evidence.title,
		description: evidence.description,
		gpsLocation: evidence.gpsLocation,
		capturedAt: evidence.capturedAt,
		uploadedAt: evidence.uploadedAt,
		uploadedBy: evidence.uploadedBy.toString(),
		verifiedAt: evidence.verifiedAt,
		verifiedBy: evidence.verifiedBy?.toString(),
		createdAt: evidence.createdAt,
		updatedAt: evidence.updatedAt,
	};
}

/**
 * Soft delete evidence
 *
 * Marks as deleted without physical removal (preserves trazabilidad)
 *
 * @param evidenceId - Evidence ID
 * @param userId - User performing deletion
 * @returns EvidenceSnapshot
 */
export async function deleteEvidence(
	evidenceId: string,
	userId: string,
): Promise<EvidenceSnapshot> {
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
			orderId: evidence.workOrderId?.toString() || evidence.orderId?.toString() || "",
			filename: evidence.filename,
		},
	});

	return {
		_id: evidence._id.toString(),
		orderId: evidence.workOrderId?.toString() || evidence.orderId?.toString() || "",
		type: evidence.type || "during",
		url: evidence.url,
		filename: evidence.filename,
		mimeType: evidence.mimeType,
		sizeBytes: evidence.sizeBytes,
		title: evidence.title,
		description: evidence.description,
		gpsLocation: evidence.gpsLocation,
		capturedAt: evidence.capturedAt,
		uploadedAt: evidence.uploadedAt,
		uploadedBy: evidence.uploadedBy.toString(),
		verifiedAt: evidence.verifiedAt,
		verifiedBy: evidence.verifiedBy?.toString(),
		createdAt: evidence.createdAt,
		updatedAt: evidence.updatedAt,
	};
}

/**
 * Verify evidence — marks evidence as reviewed and approved
 *
 * @param evidenceId - Evidence ID to verify
 * @param userId - User performing verification
 * @param userRole - Role of the user
 * @returns Updated evidence response
 */
export async function verifyEvidence(
	evidenceId: string,
	userId: string,
	userRole: string,
): Promise<EvidenceSnapshot> {
	// RBAC: Only gerente, residente, supervisor can verify
	if (!["gerente", "residente", "supervisor"].includes(userRole)) {
		throw new BadRequestError("You do not have permission to verify evidence");
	}

	const evidence = await Evidence.findById(evidenceId);

	if (!evidence) {
		throw new NotFoundError("Evidence", evidenceId);
	}

	evidence.verifiedAt = new Date();
	evidence.verifiedBy = new Types.ObjectId(userId);
	await evidence.save();

	// Async audit log
	createAuditLog({
		action: "EVIDENCE_VERIFIED",
		entity: "Evidence",
		entityId: evidence._id.toString(),
		userId,
		metadata: {
			orderId: evidence.workOrderId?.toString() || evidence.orderId?.toString() || "",
			filename: evidence.filename,
		},
	});

	return {
		_id: evidence._id.toString(),
		orderId: evidence.workOrderId?.toString() || evidence.orderId?.toString() || "",
		type: evidence.type || "during",
		url: evidence.url,
		filename: evidence.filename,
		mimeType: evidence.mimeType,
		sizeBytes: evidence.sizeBytes,
		title: evidence.title,
		description: evidence.description,
		gpsLocation: evidence.gpsLocation,
		capturedAt: evidence.capturedAt,
		uploadedAt: evidence.uploadedAt,
		uploadedBy: evidence.uploadedBy.toString(),
		verifiedAt: evidence.verifiedAt,
		verifiedBy: evidence.verifiedBy?.toString(),
		createdAt: evidence.createdAt,
		updatedAt: evidence.updatedAt,
	};
}
