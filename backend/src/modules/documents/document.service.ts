/**
 * Document Service for Cermont Backend
 *
 * Handles document management business logic:
 * - CRUD operations for documents
 * - File cleanup on errors
 * - Document signing
 */

import fs from "node:fs/promises";
import type { AssociateDocumentInput, DocumentAssociation } from "@cermont/shared-types";
import { AppError } from "../../common/errors";
import { createLogger } from "../../common/utils/logger";
import { parseObjectId } from "../../common/utils/parseObjectId";
import { Document, type IDocument } from "../../models/Document";
import { createAuditLog } from "../../modules/audit/audit.service";

const log = createLogger("document-service");

/**
 * Create a new document record
 */

interface CreateDocumentData {
	title: string;
	orderId?: string;
	purpose?: IDocument["purpose"];
	targetStepCode?: string;
	requirementKey?: string;
	serviceCaseId?: string;
	linkedEntityType?: IDocument["linkedEntityType"];
	linkedEntityId?: string;
	mimeType?: string;
	fileSize?: number;
}

function normalizeCreateDocumentInput(data: CreateDocumentData, userId: string, filePath: string) {
	const uploadedBy = parseObjectId(userId);
	const linkedEntityId =
		data.linkedEntityId && data.linkedEntityId.length > 0
			? parseObjectId(data.linkedEntityId)
			: undefined;
	const serviceCaseId =
		data.serviceCaseId && data.serviceCaseId.length > 0
			? parseObjectId(data.serviceCaseId)
			: undefined;
	const orderId = data.orderId && data.orderId.length > 0 ? parseObjectId(data.orderId) : undefined;
	const hasInitialAssociation =
		Boolean(orderId) ||
		Boolean(serviceCaseId) ||
		Boolean(data.targetStepCode) ||
		Boolean(data.requirementKey) ||
		Boolean(linkedEntityId);
	return { uploadedBy, linkedEntityId, serviceCaseId, orderId, hasInitialAssociation, filePath };
}

function buildAssociationSubDocument(
	data: CreateDocumentData,
	normalized: ReturnType<typeof normalizeCreateDocumentInput>,
): Record<string, unknown> {
	const association: Record<string, unknown> = {
		purpose: data.purpose ?? "library",
		createdBy: normalized.uploadedBy,
		createdAt: new Date(),
	};
	if (normalized.orderId) {
		association.orderId = normalized.orderId;
	}
	if (normalized.serviceCaseId) {
		association.serviceCaseId = normalized.serviceCaseId;
	}
	if (data.targetStepCode) {
		association.targetStepCode = data.targetStepCode;
	}
	if (data.requirementKey) {
		association.requirementKey = data.requirementKey;
	}
	if (data.linkedEntityType) {
		association.linkedEntityType = data.linkedEntityType;
	}
	if (normalized.linkedEntityId) {
		association.linkedEntityId = normalized.linkedEntityId;
	}
	return association;
}

function buildCreateDocumentPayload(
	data: CreateDocumentData,
	normalized: ReturnType<typeof normalizeCreateDocumentInput>,
): Parameters<typeof Document.create>[0] {
	const payload: Record<string, unknown> = {
		title: data.title,
		file_url: normalized.filePath,
		uploaded_by: normalized.uploadedBy,
	};
	if (typeof data.fileSize === "number") {
		payload.file_size = data.fileSize;
	}
	if (data.mimeType) {
		payload.mime_type = data.mimeType;
	}
	if (normalized.orderId) {
		payload.order_id = normalized.orderId;
	}
	if (data.purpose) {
		payload.purpose = data.purpose;
	}
	if (data.targetStepCode) {
		payload.targetStepCode = data.targetStepCode;
	}
	if (data.linkedEntityType) {
		payload.linkedEntityType = data.linkedEntityType;
	}
	if (normalized.linkedEntityId) {
		payload.linkedEntityId = normalized.linkedEntityId;
	}

	if (normalized.hasInitialAssociation) {
		payload.associations = [buildAssociationSubDocument(data, normalized)];
	}

	return payload as Parameters<typeof Document.create>[0];
}

export async function createDocument(
	data: CreateDocumentData,
	filePath: string,
	userId: string,
): Promise<IDocument> {
	const normalized = normalizeCreateDocumentInput(data, userId, filePath);
	const payload = buildCreateDocumentPayload(data, normalized);
	const document = await Document.create(payload);

	log.info("Document created", {
		documentId: String((document as { _id: unknown })._id),
		title: data.title,
	});
	return document;
}

/**
 * Get all documents
 */
export async function findAllDocuments(filters?: {
	orderId?: string;
	purpose?: IDocument["purpose"];
	serviceCaseId?: string;
	stepCode?: string;
	includeArchived?: boolean;
}): Promise<unknown[]> {
	const conditions: Record<string, unknown>[] = [];

	if (!filters?.includeArchived) {
		conditions.push({
			$or: [{ lifecycleStatus: "active" }, { lifecycleStatus: { $exists: false } }],
		});
	}

	if (filters?.orderId) {
		const orderId = parseObjectId(filters.orderId);
		conditions.push({
			$or: [{ order_id: orderId }, { "associations.orderId": orderId }],
		});
	}
	if (filters?.purpose) {
		conditions.push({
			$or: [{ purpose: filters.purpose }, { "associations.purpose": filters.purpose }],
		});
	}
	if (filters?.stepCode) {
		conditions.push({
			$or: [
				{ targetStepCode: filters.stepCode },
				{ "associations.targetStepCode": filters.stepCode },
			],
		});
	}
	if (filters?.serviceCaseId) {
		const serviceCaseId = parseObjectId(filters.serviceCaseId);
		conditions.push({
			$or: [
				{ linkedEntityType: "service_case", linkedEntityId: serviceCaseId },
				{ "associations.serviceCaseId": serviceCaseId },
			],
		});
	}

	const query =
		conditions.length === 0 ? {} : conditions.length === 1 ? conditions[0] : { $and: conditions };

	return Document.find(query).sort({ createdAt: -1 }).lean();
}

function mapAssociation(association: IDocument["associations"][number]): DocumentAssociation {
	return {
		orderId: association.orderId?.toString(),
		serviceCaseId: association.serviceCaseId?.toString(),
		purpose: association.purpose,
		targetStepCode: association.targetStepCode as DocumentAssociation["targetStepCode"],
		requirementKey: association.requirementKey,
		linkedEntityType: association.linkedEntityType as DocumentAssociation["linkedEntityType"],
		linkedEntityId: association.linkedEntityId?.toString(),
		createdBy: association.createdBy.toString(),
		createdAt: association.createdAt.toISOString(),
	};
}

function matchesAssociation(
	current: IDocument["associations"][number],
	input: {
		orderId?: string;
		serviceCaseId?: string;
		purpose: IDocument["purpose"];
		targetStepCode?: string;
		requirementKey?: string;
		linkedEntityType?: IDocument["linkedEntityType"];
		linkedEntityId?: string;
	},
): boolean {
	return (
		(current.orderId?.toString() ?? "") === (input.orderId ?? "") &&
		(current.serviceCaseId?.toString() ?? "") === (input.serviceCaseId ?? "") &&
		current.purpose === input.purpose &&
		(current.targetStepCode ?? "") === (input.targetStepCode ?? "") &&
		(current.requirementKey ?? "") === (input.requirementKey ?? "") &&
		(current.linkedEntityType ?? "") === (input.linkedEntityType ?? "") &&
		(current.linkedEntityId?.toString() ?? "") === (input.linkedEntityId ?? "")
	);
}

function buildAssociationObject(
	input: AssociateDocumentInput,
	document: IDocument,
	userId: string,
) {
	const createdBy = parseObjectId(userId);
	const association: Record<string, unknown> = {
		purpose: input.purpose ?? document.purpose ?? "support_document",
		createdBy,
		createdAt: new Date(),
	};
	if (input.orderId) {
		association.orderId = parseObjectId(input.orderId);
	}
	if (input.serviceCaseId) {
		association.serviceCaseId = parseObjectId(input.serviceCaseId);
	}
	if (input.targetStepCode) {
		association.targetStepCode = input.targetStepCode;
	}
	if (input.requirementKey) {
		association.requirementKey = input.requirementKey;
	}
	if (input.linkedEntityType) {
		association.linkedEntityType = input.linkedEntityType;
	}
	if (input.linkedEntityId) {
		association.linkedEntityId = parseObjectId(input.linkedEntityId);
	}
	return association as IDocument["associations"][number];
}

function applyAssociationToDocument(
	document: IDocument,
	association: IDocument["associations"][number],
	input: AssociateDocumentInput,
) {
	document.associations = document.associations ?? [];

	const alreadyExists = document.associations.some((current) =>
		matchesAssociation(current, {
			orderId: input.orderId || undefined,
			serviceCaseId: input.serviceCaseId || undefined,
			purpose: association.purpose,
			targetStepCode: input.targetStepCode || undefined,
			requirementKey: input.requirementKey || undefined,
			linkedEntityType: input.linkedEntityType || undefined,
			linkedEntityId: input.linkedEntityId || undefined,
		}),
	);
	if (!alreadyExists) {
		document.associations.push(association);
	}

	if (!document.order_id && input.orderId) {
		document.order_id = parseObjectId(input.orderId);
	}
	if (!document.targetStepCode && input.targetStepCode) {
		document.targetStepCode = input.targetStepCode;
	}
	if (!document.linkedEntityType && input.linkedEntityType) {
		document.linkedEntityType = input.linkedEntityType;
	}
	if (!document.linkedEntityId && input.linkedEntityId) {
		document.linkedEntityId = parseObjectId(input.linkedEntityId);
	}
}

export async function associateDocument(
	id: string,
	input: AssociateDocumentInput,
	userId: string,
): Promise<IDocument> {
	const document = await Document.findById(id);
	if (!document) {
		throw new AppError("Document not found", 404, "DOCUMENT_NOT_FOUND");
	}

	const association = buildAssociationObject(input, document, userId);
	applyAssociationToDocument(document, association, input);

	await document.save();
	log.info("Document associated", {
		documentId: id,
		serviceCaseId: input.serviceCaseId,
		orderId: input.orderId,
		targetStepCode: input.targetStepCode,
	});
	return document;
}

export async function getDocumentAssociations(id: string): Promise<DocumentAssociation[]> {
	const document = await Document.findById(id);
	if (!document) {
		throw new AppError("Document not found", 404, "DOCUMENT_NOT_FOUND");
	}

	return (document.associations ?? []).map(mapAssociation);
}

type DocumentDeletionResult =
	| {
			status: "archived";
			documentId: string;
			retentionUntil: string;
	  }
	| {
			status: "deleted";
			documentId: string;
	  };

const RETENTION_YEARS = 5;
const CRITICAL_DOCUMENT_STEPS = new Set([
	"step_07_evidence",
	"step_08_technical_report",
	"step_09_delivery_record",
	"step_10_client_signature",
	"step_11_ses_ariba",
	"step_12_invoice",
	"step_13_invoice_approval",
	"step_14_payment",
]);
const CRITICAL_DOCUMENT_ENTITIES = new Set([
	"technical_report",
	"delivery_record",
	"service_entry_sheet",
	"invoice",
	"payment",
	"ses",
	"report",
]);

function buildRetentionUntil(): Date {
	const retentionUntil = new Date();
	retentionUntil.setFullYear(retentionUntil.getFullYear() + RETENTION_YEARS);
	return retentionUntil;
}

function isCriticalDocument(document: IDocument): boolean {
	if (
		document.signed ||
		document.purpose === "closing_evidence" ||
		document.purpose === "template_source" ||
		document.closingEvidenceKind
	) {
		return true;
	}

	return (document.associations ?? []).some((association) => {
		if (association.purpose === "closing_evidence") {
			return true;
		}
		if (association.targetStepCode && CRITICAL_DOCUMENT_STEPS.has(association.targetStepCode)) {
			return true;
		}
		return Boolean(
			association.linkedEntityType && CRITICAL_DOCUMENT_ENTITIES.has(association.linkedEntityType),
		);
	});
}

async function archiveDocumentRecord(
	document: IDocument,
	userId: string,
	reason: string,
): Promise<IDocument> {
	const retentionUntil = buildRetentionUntil();
	document.lifecycleStatus = "archived";
	document.archivedAt = new Date();
	document.archivedBy = parseObjectId(userId);
	document.archiveReason = reason;
	document.retentionUntil = retentionUntil;
	await document.save();

	createAuditLog({
		action: "DOCUMENT_ARCHIVED",
		entity: "Document",
		entityId: document._id.toString(),
		userId,
		metadata: {
			reason,
			retentionUntil: retentionUntil.toISOString(),
			criticalAssociations: isCriticalDocument(document),
		},
	});
	log.info("Document archived", {
		documentId: document._id.toString(),
		retentionUntil: retentionUntil.toISOString(),
	});

	return document;
}

export async function archiveDocument(
	id: string,
	userId: string,
	reason: string = "Archived by user",
): Promise<IDocument> {
	const document = await Document.findById(id);
	if (!document) {
		throw new AppError("Document not found", 404, "DOCUMENT_NOT_FOUND");
	}

	return archiveDocumentRecord(document, userId, reason);
}

/**
 * Delete a document using retention-aware policy.
 * Critical CERMONT evidence is archived, never physically removed.
 */
export async function deleteDocument(
	id: string,
	userId: string,
	reason: string = "Deletion requested",
): Promise<DocumentDeletionResult> {
	const document = await Document.findById(id);
	if (!document) {
		throw new AppError("Document not found", 404, "DOCUMENT_NOT_FOUND");
	}

	if (isCriticalDocument(document)) {
		const archived = await archiveDocumentRecord(document, userId, reason);
		return {
			status: "archived",
			documentId: id,
			retentionUntil: archived.retentionUntil?.toISOString() ?? buildRetentionUntil().toISOString(),
		};
	}

	if (document.file_url) {
		try {
			await fs.unlink(document.file_url);
		} catch (err) {
			log.warn("Failed to delete physical file", {
				fileUrl: document.file_url,
				error: (err as Error).message,
			});
		}
	}

	await Document.findByIdAndDelete(id);
	createAuditLog({
		action: "DOCUMENT_DELETED",
		entity: "Document",
		entityId: id,
		userId,
		metadata: { reason },
	});
	log.info("Document deleted", { documentId: id });

	return { status: "deleted", documentId: id };
}

/**
 * Sign a document
 */
export async function signDocument(id: string, userId: string): Promise<unknown> {
	const document = await Document.findByIdAndUpdate(
		id,
		{ signed: true, signedBy: userId, signedAt: new Date() },
		{ new: true },
	).lean();

	if (!document) {
		throw new AppError("Document not found", 404, "DOCUMENT_NOT_FOUND");
	}

	log.info("Document signed", { documentId: id, signedBy: userId });
	return document;
}

/**
 * Clean up uploaded file on error
 */
export async function cleanupDocumentFile(filePath: string): Promise<void> {
	try {
		await fs.unlink(filePath);
	} catch {
		// Ignore cleanup errors
	}
}
