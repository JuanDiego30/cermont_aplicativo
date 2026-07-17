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

import { ADMIN_PLUS_RESIDENTE, type UserRole } from "@cermont/domain";
// Import V2 types from shared-types
import type {
	EvidenceCategory,
	EvidencePhase,
	EvidenceRelationType,
	EvidenceSource,
	EvidenceWorkflowStatus,
} from "@cermont/shared-types";
import { Types } from "mongoose";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import {
	BadRequestError,
	ConflictError,
	NotFoundError,
	ServiceUnavailableError,
	UnsupportedMediaTypeError,
} from "../../common/errors/AppError";
import { saveFile } from "../../common/storage/local-storage";
import { isTransientDatabaseError } from "../../common/utils/transient-database-error";
import {
	hasValidImageSignature,
	MAX_FILE_SIZE,
	scanWithClamAV,
} from "../../middlewares/uploadMiddleware";
import { Evidence, Order, ServiceCase } from "../../models";
import type { IEvidenceDocument } from "../../models/Evidence";
import { createAuditLog } from "../../modules/audit/audit.service";
import { assertServiceCaseStageMutable } from "../../services/case-closure-lock.service";
import { assertEvidenceReferencesBelongToCase } from "../../services/evidence-reference-integrity.service";
import { notifyRoleGroup } from "../notifications/notification.service";
import { getOrderByIdWithAuth } from "../order/order-crud.service";

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
	capturedAt: string;
	uploadedAt: string;
	uploadedBy: string;
	verifiedAt?: string;
	verifiedBy?: string;
	verificationStatus?: "approved" | "rejected";
	verificationComment?: string;
	phase: EvidencePhase;
	fsmStatus: EvidenceWorkflowStatus;
	source: EvidenceSource;
	relation: { type: EvidenceRelationType; id: string };
	rejection:
		| { status: "absent" }
		| { status: "present"; value: { reason: string; rejectedAt: string } };
	replacement:
		| { status: "absent" }
		| { status: "present"; value: { evidenceId: string; fileAssetId: string } };
	lock: { status: "absent" } | { status: "present"; value: { reason: string; lockedAt: string } };
	createdAt: string;
	updatedAt: string;
}

interface EvidenceCreationOptions {
	idempotencyKey?: string;
	actor?: EvidenceActor;
}

interface EvidenceActor {
	_id: string;
	role: UserRole;
}

function hasGlobalEvidenceAccess(role: UserRole): boolean {
	return ADMIN_PLUS_RESIDENTE.some((allowedRole) => allowedRole === role);
}

function resolveEvidencePhase(doc: IEvidenceDocument): EvidencePhase {
	if (doc.phase) {
		return doc.phase;
	}
	if (doc.type === "before" || doc.type === "during" || doc.type === "after") {
		return doc.type;
	}
	return doc.type === "safety" ? "hse" : "correction";
}

function resolveEvidenceStatus(doc: IEvidenceDocument): EvidenceWorkflowStatus {
	const storedStatus = String(doc.fsmStatus || "uploaded");
	if (storedStatus === "verified") {
		return "approved";
	}
	if (storedStatus === "verification_pending") {
		return "pending_review";
	}
	if (storedStatus === "replaced") {
		return "archived";
	}
	if (doc.verificationStatus === "approved") {
		return "approved";
	}
	return storedStatus as EvidenceWorkflowStatus;
}

function resolveEvidenceRelation(doc: IEvidenceDocument): {
	type: EvidenceRelationType;
	id: string;
} {
	const fallbackId = doc.workOrderId?.toString() || doc.orderId?.toString() || "";
	return {
		type: doc.relationType || "order",
		id: doc.relationId?.toString() || fallbackId,
	};
}

async function getAccessibleOrderIds(actor: EvidenceActor): Promise<Types.ObjectId[]> {
	if (hasGlobalEvidenceAccess(actor.role)) {
		return [];
	}

	const orders = await Order.find({
		$or: [{ createdBy: actor._id }, { assignedTo: actor._id }, { supervisedBy: actor._id }],
	})
		.select("_id")
		.lean<Array<{ _id: Types.ObjectId }>>();

	return orders.map((order) => order._id);
}

async function buildEvidenceVisibilityFilter(
	actor: EvidenceActor,
): Promise<Record<string, unknown>> {
	if (hasGlobalEvidenceAccess(actor.role)) {
		return {};
	}

	const orderIds = await getAccessibleOrderIds(actor);
	return {
		$or: [{ orderId: { $in: orderIds } }, { workOrderId: { $in: orderIds } }],
	};
}

async function assertEvidenceOrderAccess(
	evidence: IEvidenceDocument,
	actor: EvidenceActor,
): Promise<void> {
	const orderId = evidence.workOrderId?.toString() || evidence.orderId?.toString() || "";
	if (!orderId) {
		throw new NotFoundError("Order", "linked evidence order");
	}
	await getOrderByIdWithAuth(orderId, actor);
}

/**
 * Format evidence document for API response (V1)
 */
function formatEvidenceResponse(doc: IEvidenceDocument): EvidenceSnapshot {
	const rejection =
		doc.rejectionReason && doc.rejectedAt
			? {
					status: "present" as const,
					value: { reason: doc.rejectionReason, rejectedAt: doc.rejectedAt.toISOString() },
				}
			: { status: "absent" as const };
	const replacement =
		doc.replacedBy && doc.replacementFileAssetId
			? {
					status: "present" as const,
					value: {
						evidenceId: doc.replacedBy.toString(),
						fileAssetId: doc.replacementFileAssetId,
					},
				}
			: { status: "absent" as const };
	const lock =
		doc.lockReason && doc.lockedAt
			? {
					status: "present" as const,
					value: { reason: doc.lockReason, lockedAt: doc.lockedAt.toISOString() },
				}
			: { status: "absent" as const };

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
		capturedAt: doc.capturedAt.toISOString(),
		uploadedAt: (doc.uploadedAt || doc.createdAt).toISOString(),
		uploadedBy: doc.uploadedBy.toString(),
		verifiedAt: doc.verifiedAt?.toISOString(),
		verifiedBy: doc.verifiedBy?.toString(),
		verificationStatus: doc.verificationStatus,
		verificationComment: doc.verificationComment,
		phase: resolveEvidencePhase(doc),
		fsmStatus: resolveEvidenceStatus(doc),
		source: doc.source || "upload",
		relation: resolveEvidenceRelation(doc),
		rejection,
		replacement,
		lock,
		createdAt: doc.createdAt.toISOString(),
		updatedAt: doc.updatedAt.toISOString(),
	};
}

/**
 * Format evidence document for API response (V2)
 */
function formatEvidenceResponseV2(doc: IEvidenceDocument): EvidenceSnapshot {
	return formatEvidenceResponse(doc);
}

/**
 * Check idempotency — returns existing evidence if key matches
 */
async function checkEvidenceIdempotency(
	idempotencyKey: string | undefined,
): Promise<IEvidenceDocument | null> {
	if (!idempotencyKey) {
		return null;
	}
	const existing = await Evidence.findOne({ idempotencyKey }).lean();
	return existing as unknown as IEvidenceDocument | null;
}

/**
 * Validate evidence file — checks type, size, and malware
 */
async function validateEvidenceFile(fileBuffer: Buffer, label: string): Promise<void> {
	if (!hasValidImageSignature(fileBuffer)) {
		throw new UnsupportedMediaTypeError("Invalid file type. Must be PNG, JPEG, WebP, or GIF");
	}
	if (fileBuffer.length > MAX_FILE_SIZE) {
		throw new BadRequestError("File exceeds 20MB limit", "FILE_TOO_LARGE");
	}
	const isSafe = await scanWithClamAV(fileBuffer, label);
	if (!isSafe) {
		throw new BadRequestError("Malware detected in uploaded evidence file");
	}
}

/**
 * Resolve relation type from payload fields
 */
function resolveEvidenceRelationType(payload: {
	executionSessionId?: string;
	workOrderId?: string;
}): EvidenceRelationType {
	if (payload.executionSessionId) {
		return "execution";
	}
	return "order";
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
	const unique = uuidv4();
	const filename = `${unique}.webp`;

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
export async function getEvidenceStats(actor: EvidenceActor): Promise<{
	total: number;
	pending: number;
	verified: number;
}> {
	const visibilityFilter = await buildEvidenceVisibilityFilter(actor);
	const [total, verified] = await Promise.all([
		Evidence.countDocuments(visibilityFilter),
		Evidence.countDocuments({
			$and: [visibilityFilter, { verifiedAt: { $exists: true } }],
		}),
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
		phase: EvidencePhase;
		source: EvidenceSource;
		relationType: EvidenceRelationType;
		relationId?: string;
		gpsLocation?: { lat: number; lng: number; capturedAt: Date };
		capturedAt: Date;
	},
	options?: EvidenceCreationOptions,
): Promise<EvidenceSnapshot> {
	const idempotencyKey = normalizeIdempotencyKey(options?.idempotencyKey);

	const order = options?.actor
		? await getOrderByIdWithAuth(orderId, options.actor)
		: await Order.findById(orderId).lean();
	if (!order) {
		throw new NotFoundError("Order", orderId);
	}

	if (idempotencyKey) {
		const existingEvidence = await Evidence.findOne({
			idempotencyKey,
			uploadedBy: userId,
		}).lean();
		if (existingEvidence) {
			return formatEvidenceResponse(existingEvidence);
		}
	}

	// Validate order state — reject uploads if cancelled/closed
	if (!["assigned", "in_progress", "completed"].includes(order.status)) {
		throw new BadRequestError(
			`Cannot upload evidence for order in ${order.status} state. Order must be assigned, in progress, or recently completed.`,
		);
	}

	if (!hasValidImageSignature(fileBuffer)) {
		throw new UnsupportedMediaTypeError("Invalid file type. Must be PNG, JPEG, WebP, or GIF");
	}

	const isSafe = await scanWithClamAV(fileBuffer, `evidence-${orderId}-${type}`);
	if (!isSafe) {
		throw new BadRequestError("Malware detected in uploaded evidence file");
	}

	// Process image (compress, convert to WebP, save)
	const { filename, url, sizeBytes } = await processImageFile(fileBuffer, orderId, userId);

	// Create evidence record with FSM workflow status
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

	await createAuditLog({
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

	// F28-T086: Notify residente when evidence is uploaded
	await notifyRoleGroup(
		"EVIDENCE_UPLOADED",
		["residente"],
		"Evidencia subida",
		`Se ha subido evidencia para la orden ${orderId}.`,
		{ entityType: "Order", entityId: orderId },
		{ orderId, filename, evidenceId: evidence._id.toString(), uploadedBy: userId },
	);

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

	// Check idempotency
	const existingEvidence = await checkEvidenceIdempotency(idempotencyKey);
	if (existingEvidence) {
		return formatEvidenceResponseV2(existingEvidence);
	}

	// Validate order exists if workOrderId provided
	if (payload.workOrderId) {
		const order = await Order.findById(payload.workOrderId).lean();
		if (!order) {
			throw new NotFoundError("Order", payload.workOrderId);
		}
	}

	// Validate service case exists
	const serviceCase = await ServiceCase.findById(payload.serviceCaseId).lean();
	if (!serviceCase) {
		throw new NotFoundError("ServiceCase", payload.serviceCaseId);
	}
	assertServiceCaseStageMutable(serviceCase.currentStage);
	assertEvidenceReferencesBelongToCase(
		{
			workOrderId: payload.workOrderId,
			executionSessionId: payload.executionSessionId,
		},
		{
			workOrderId: serviceCase.artifacts?.workOrder?.id?.toString(),
			executionSessionId: serviceCase.artifacts?.executionSession?.id?.toString(),
		},
	);

	// Validate file
	await validateEvidenceFile(fileBuffer, `evidence-v2-${payload.serviceCaseId}-${uuidv4()}`);

	// Process image - generate variants
	const unique = uuidv4();
	const originalFilename = `${unique}.webp`;
	const webFilename = `${unique}-web.webp`;
	const thumbnailFilename = `${unique}-thumb.webp`;

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
		code: `EVID-${Date.now()}`,
		phase: payload.phase,
		category: payload.category,
		serviceCaseId: payload.serviceCaseId,
		workOrderId: payload.workOrderId,
		executionSessionId: payload.executionSessionId,
		description: payload.description,
		filename: originalFilename,
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
		uploadedByName: userId,
		uploadedAt: new Date(),
		capturedAt: payload.capturedAt,
		offlineCapturedAt: payload.capturedAt,
		gpsLocation: payload.gpsLocation,
		syncStatus: payload.syncStatus || "synced",
		idempotencyKey,
		deviceId: payload.deviceId,
		source: payload.deviceId ? "camera" : "upload",
		relationType: resolveEvidenceRelationType(payload),
		relationId: payload.executionSessionId || payload.workOrderId || payload.serviceCaseId,
		fsmStatus: "uploaded",
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	await evidence.save();

	await evidence.populate("uploadedBy", "name email");

	await createAuditLog({
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
 * Track evidence download — creates audit log without exposing file content
 */
export async function trackDownload(
	evidenceId: string,
	userId: string,
): Promise<{ url: string; filename: string }> {
	const evidence = await Evidence.findById(evidenceId).lean();
	if (!evidence) {
		throw new NotFoundError("Evidence", evidenceId);
	}

	await createAuditLog({
		action: "EVIDENCE_PDF_DOWNLOADED",
		entity: "Evidence",
		entityId: evidence._id.toString(),
		userId,
		metadata: {
			orderId: evidence.workOrderId?.toString() || evidence.orderId?.toString() || "",
			filename: evidence.filename,
			sizeBytes: evidence.sizeBytes,
		},
	});

	return { url: evidence.url, filename: evidence.filename };
}

/**
 * Track evidence view — records that user viewed the evidence
 */
export async function trackView(
	evidenceId: string,
	actor: EvidenceActor,
): Promise<EvidenceSnapshot> {
	const evidence = await getEvidenceById(evidenceId, actor);

	await createAuditLog({
		action: "EVIDENCE_FILE_VIEWED",
		entity: "Evidence",
		entityId: evidenceId,
		userId: actor._id,
		metadata: {
			orderId: evidence.orderId,
			filename: evidence.filename,
		},
	});

	return evidence;
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
	actor: EvidenceActor,
): Promise<{
	data: EvidenceSnapshot[];
	total: number;
	page: number;
	limit: number;
	pages: number;
}> {
	const conditions: Record<string, unknown>[] = [];
	if (query.orderId) {
		await getOrderByIdWithAuth(query.orderId, actor);
		conditions.push({
			$or: [{ orderId: query.orderId }, { workOrderId: query.orderId }],
		});
	} else {
		conditions.push(await buildEvidenceVisibilityFilter(actor));
	}
	if (query.status) {
		conditions.push(
			query.status === "verified"
				? { verifiedAt: { $exists: true } }
				: { verifiedAt: { $exists: false } },
		);
	}
	const effectiveConditions = conditions.filter((condition) => Object.keys(condition).length > 0);
	const filter =
		effectiveConditions.length === 0
			? {}
			: effectiveConditions.length === 1
				? effectiveConditions[0]
				: { $and: effectiveConditions };

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

	return formatEvidenceResponse(evidence);
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
	actor?: EvidenceActor,
): Promise<EvidenceSnapshot> {
	const evidence = await Evidence.findById(evidenceId);

	if (!evidence) {
		throw new NotFoundError("Evidence", evidenceId);
	}
	if (actor) {
		await assertEvidenceOrderAccess(evidence, actor);
	}

	// Soft delete: just mark deletedAt flag to preserve audit trail
	evidence.deletedAt = new Date();
	evidence.lifecycleStatus = "deleted";
	evidence.deletedBy = new Types.ObjectId(userId);
	evidence.deleteReason = "Deleted by authorized user";
	await evidence.save();

	await createAuditLog({
		action: "EVIDENCE_DELETED",
		entity: "Evidence",
		entityId: evidence._id.toString(),
		userId,
		metadata: {
			orderId: evidence.workOrderId?.toString() || evidence.orderId?.toString() || "",
			filename: evidence.filename,
		},
	});

	return formatEvidenceResponse(evidence);
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
	approved: boolean,
	comment: string,
	actor?: EvidenceActor,
): Promise<EvidenceSnapshot> {
	// RBAC: Only gerente, residente, supervisor can verify
	if (!["gerente", "residente", "supervisor"].includes(userRole)) {
		throw new BadRequestError("You do not have permission to verify evidence");
	}

	const evidence = await Evidence.findById(evidenceId);

	if (!evidence) {
		throw new NotFoundError("Evidence", evidenceId);
	}
	if (actor) {
		await assertEvidenceOrderAccess(evidence, actor);
	}

	evidence.verifiedAt = new Date();
	evidence.verifiedBy = new Types.ObjectId(userId);
	evidence.verificationStatus = approved ? "approved" : "rejected";
	evidence.verificationComment = comment;
	evidence.fsmStatus = approved ? "approved" : "rejected";
	if (!approved) {
		evidence.rejectionReason = comment || "No reason provided";
		evidence.rejectedAt = new Date();
	}
	await evidence.save();

	await createAuditLog({
		action: approved ? "EVIDENCE_VERIFIED" : "EVIDENCE_REJECTED",
		entity: "Evidence",
		entityId: evidence._id.toString(),
		userId,
		metadata: {
			orderId: evidence.workOrderId?.toString() || evidence.orderId?.toString() || "",
			filename: evidence.filename,
			comment,
		},
	});

	return formatEvidenceResponse(evidence);
}

/**
 * Replace rejected evidence — upload a new version to replace a rejected one
 *
 * FSM transition: rejected → replaced (old) / captured → uploaded (new)
 *
 * @param originalEvidenceId - The rejected evidence ID
 * @param fileBuffer - New image buffer
 * @param userId - User uploading replacement
 * @param comment - Optional comment for the replacement
 * @returns Object with { replaced: EvidenceSnapshot, replacement: EvidenceSnapshot }
 */
export async function replaceEvidence(
	originalEvidenceId: string,
	fileBuffer: Buffer,
	userId: string,
	comment?: string,
): Promise<{ replaced: EvidenceSnapshot; replacement: EvidenceSnapshot }> {
	const original = await Evidence.findById(originalEvidenceId);
	if (!original) {
		throw new NotFoundError("Evidence", originalEvidenceId);
	}
	if (original.fsmStatus !== "rejected") {
		throw new ConflictError(
			`Cannot replace evidence that has not been rejected. Current status: ${original.fsmStatus}`,
		);
	}

	// Process new image
	const { filename, url, sizeBytes } = await processImageFile(
		fileBuffer,
		original.workOrderId?.toString() || original.orderId?.toString() || "",
		userId,
	);

	// Mark original as archived (replaced evidence is archived)
	original.fsmStatus = "archived";
	original.verificationComment = comment || original.verificationComment || "Replaced by user";
	await original.save();

	// Create replacement evidence linked to original
	const replacement = new Evidence({
		orderId: original.orderId,
		workOrderId: original.workOrderId,
		serviceCaseId: original.serviceCaseId,
		executionSessionId: original.executionSessionId,
		type: original.type,
		phase: original.phase,
		category: original.category,
		filename,
		url,
		mimeType: "image/webp",
		sizeBytes,
		capturedAt: new Date(),
		uploadedAt: new Date(),
		uploadedBy: userId,
		fsmStatus: "uploaded",
		replaces: original._id,
		description: comment || `Replacement for ${original._id.toString()}`,
	});

	await replacement.save();

	await createAuditLog({
		action: "EVIDENCE_REPLACED",
		entity: "Evidence",
		entityId: original._id.toString(),
		userId,
		metadata: {
			replacedBy: replacement._id.toString(),
			filename,
			sizeBytes,
		},
	});

	return {
		replaced: formatEvidenceResponse(original),
		replacement: formatEvidenceResponse(replacement),
	};
}

/**
 * Get evidence gallery for an order — all evidence grouped by verification status
 */
export async function getEvidenceGallery(
	orderId: string,
	actor: { _id: string; role: string },
): Promise<{
	verified: EvidenceSnapshot[];
	pending: EvidenceSnapshot[];
	rejected: EvidenceSnapshot[];
	total: number;
}> {
	await getOrderByIdWithAuth(orderId, actor);

	const allEvidence = await Evidence.find({
		$or: [{ orderId }, { workOrderId: orderId }],
		lifecycleStatus: { $ne: "deleted" },
	})
		.sort({ createdAt: -1 })
		.lean();

	const mapped = allEvidence.map(formatEvidenceResponse);

	return {
		verified: mapped.filter(
			(e) => e.fsmStatus === "approved" || e.verificationStatus === "approved",
		),
		pending: mapped.filter(
			(e) =>
				e.fsmStatus !== "approved" &&
				e.fsmStatus !== "rejected" &&
				e.verificationStatus !== "approved" &&
				e.verificationStatus !== "rejected",
		),
		rejected: mapped.filter(
			(e) => e.fsmStatus === "rejected" || e.verificationStatus === "rejected",
		),
		total: mapped.length,
	};
}
