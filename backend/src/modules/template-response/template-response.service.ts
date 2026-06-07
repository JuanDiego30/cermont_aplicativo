/**
 * TemplateResponse Service — Business Logic Layer
 *
 * CRUD operations + state transitions for template form responses.
 * Supports draft saving, submission, validation, and offline sync.
 */

import type {
	TemplateResponseAttachment,
	TemplateResponseFieldValue,
	TemplateResponseGpsPoint,
	TemplateResponsePhoto,
	TemplateResponseSection,
	TemplateResponseSignature,
	TemplateResponseValue,
} from "@cermont/shared-types";
import { Types } from "mongoose";
import { BadRequestError, NotFoundError } from "../../common/errors/AppError";
import { type ITemplateResponseDocument, TemplateResponse } from "../../models/TemplateResponse";
import { createAuditLog } from "../audit/audit.service";

type TemplateResponseValues = Record<string, TemplateResponseValue | TemplateResponseFieldValue>;
type TemplateResponseDeviceInfo = {
	deviceId?: string;
	platform?: string;
	appVersion?: string;
};
type TemplateResponseQuery = {
	status?: ITemplateResponseDocument["status"];
	documentTemplateId?: Types.ObjectId;
	linkedEntityType?: string;
	linkedEntityId?: Types.ObjectId;
	createdBy?: Types.ObjectId;
};

const TEMPLATE_RESPONSE_STATUSES = [
	"draft",
	"in_progress",
	"submitted",
	"validated",
	"rejected",
	"synced",
	"conflict",
] satisfies ITemplateResponseDocument["status"][];

function isTemplateResponseStatus(value: string): value is ITemplateResponseDocument["status"] {
	return TEMPLATE_RESPONSE_STATUSES.some((status) => status === value);
}

export interface CreateTemplateAnswerCommand {
	documentTemplateId: string;
	documentTemplateVersionId?: string;
	versionNumber?: number;
	linkedEntityType?: string;
	linkedEntityId?: string;
	stage?: string;
	values?: TemplateResponseValues;
	sections?: TemplateResponseSection[];
	deviceInfo?: TemplateResponseDeviceInfo;
}

export interface UpdateTemplateAnswerCommand {
	values?: TemplateResponseValues;
	sections?: TemplateResponseSection[];
	attachments?: TemplateResponseAttachment[];
	photos?: TemplateResponsePhoto[];
	signatures?: TemplateResponseSignature[];
	gpsPoints?: TemplateResponseGpsPoint[];
}

export interface TemplateResponseFilters {
	status?: string;
	linkedEntityType?: string;
	linkedEntityId?: string;
	documentTemplateId?: string;
	createdBy?: string;
}

export interface PaginationOptions {
	page?: number;
	limit?: number;
}

export interface PageEnvelope<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

/**
 * Calculate progress (completed fields / total fields)
 */
function hasCompletedValue(field: TemplateResponseValue | TemplateResponseFieldValue): boolean {
	if (typeof field === "object" && !Array.isArray(field) && "value" in field) {
		const fieldValue = field.value;
		return fieldValue !== undefined && fieldValue !== null && fieldValue !== "";
	}

	return field !== "";
}

function calculateProgress(values: TemplateResponseValues): number {
	if (!values || Object.keys(values).length === 0) {
		return 0;
	}

	let completed = 0;
	let total = 0;

	for (const field of Object.values(values)) {
		if (hasCompletedValue(field)) {
			completed++;
		}
		total++;
	}

	return total > 0 ? Math.round((completed / total) * 100) : 0;
}

function countCompletedValues(values: TemplateResponseValues): number {
	return Object.values(values).filter(hasCompletedValue).length;
}

/**
 * Create a new TemplateResponse
 */
export async function createTemplateResponse(
	data: CreateTemplateAnswerCommand,
	userId: string,
): Promise<ITemplateResponseDocument> {
	const response = await TemplateResponse.create({
		documentTemplateId: new Types.ObjectId(data.documentTemplateId),
		documentTemplateVersionId: data.documentTemplateVersionId
			? new Types.ObjectId(data.documentTemplateVersionId)
			: undefined,
		versionNumber: data.versionNumber || 1,
		versionHash: "",
		linkedEntityType: data.linkedEntityType,
		linkedEntityId: data.linkedEntityId ? new Types.ObjectId(data.linkedEntityId) : undefined,
		stage: data.stage,
		values: data.values || {},
		sections: data.sections || [],
		status: "draft",
		createdBy: new Types.ObjectId(userId),
		progress: { completedFields: 0, totalFields: 0, percentage: 0 },
		deviceInfo: data.deviceInfo,
	});

	await createAuditLog({
		userId,
		entity: "TemplateResponse",
		entityId: response._id.toString(),
		action: "TEMPLATE_RESPONSE_CREATED",
		after: { documentTemplateId: data.documentTemplateId, status: "draft" },
	});

	return response;
}

/**
 * Get TemplateResponse by ID (alias)
 */
export async function getTemplateResponse(id: string): Promise<ITemplateResponseDocument> {
	return getTemplateResponseById(id);
}

/**
 * Get TemplateResponse by ID
 */
export async function getTemplateResponseById(id: string): Promise<ITemplateResponseDocument> {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestError("INVALID_RESPONSE_ID", "Invalid response ID format");
	}

	const response = await TemplateResponse.findById(id);

	if (!response) {
		throw new NotFoundError("TEMPLATE_RESPONSE_NOT_FOUND", "Template response not found");
	}

	return response;
}

/**
 * Get all TemplateResponses with filtering and pagination (alias)
 */
export async function listTemplateResponses(
	filters: TemplateResponseFilters = {},
	pagination: PaginationOptions = {},
): Promise<PageEnvelope<ITemplateResponseDocument>> {
	return getAllTemplateResponses(filters, pagination);
}

/**
 * Get all TemplateResponses with filtering and pagination
 */
export async function getAllTemplateResponses(
	filters: TemplateResponseFilters = {},
	pagination: PaginationOptions = {},
): Promise<PageEnvelope<ITemplateResponseDocument>> {
	const page = pagination.page || 1;
	const limit = pagination.limit || 20;
	const skip = (page - 1) * limit;

	const query: TemplateResponseQuery = {};

	if (filters.status) {
		if (!isTemplateResponseStatus(filters.status)) {
			throw new BadRequestError("INVALID_RESPONSE_STATUS", "Invalid template response status");
		}
		query.status = filters.status;
	}

	if (filters.documentTemplateId) {
		query.documentTemplateId = new Types.ObjectId(filters.documentTemplateId);
	}

	if (filters.linkedEntityType && filters.linkedEntityId) {
		query.linkedEntityType = filters.linkedEntityType;
		query.linkedEntityId = new Types.ObjectId(filters.linkedEntityId);
	}

	if (filters.createdBy) {
		query.createdBy = new Types.ObjectId(filters.createdBy);
	}

	const [data, total] = await Promise.all([
		TemplateResponse.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
		TemplateResponse.countDocuments(query),
	]);

	return {
		data,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
}

/**
 * Get responses by linked entity
 */
export async function getResponsesByEntity(
	entityType: string,
	entityId: string,
): Promise<ITemplateResponseDocument[]> {
	if (!Types.ObjectId.isValid(entityId)) {
		throw new BadRequestError("INVALID_ENTITY_ID", "Invalid entity ID format");
	}

	const responses = await TemplateResponse.find({
		linkedEntityType: entityType,
		linkedEntityId: new Types.ObjectId(entityId),
	})
		.sort({ createdAt: -1 })
		.exec();

	return responses;
}

/**
 * Update TemplateResponse (save progress)
 */
export async function updateTemplateResponse(
	id: string,
	data: UpdateTemplateAnswerCommand,
	userId: string,
): Promise<ITemplateResponseDocument> {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestError("INVALID_RESPONSE_ID", "Invalid response ID format");
	}

	const response = await TemplateResponse.findById(id);

	if (!response) {
		throw new NotFoundError("TEMPLATE_RESPONSE_NOT_FOUND", "Template response not found");
	}

	// Can only update drafts
	if (response.status !== "draft") {
		throw new BadRequestError(
			"CANNOT_UPDATE_RESPONSE",
			"Cannot update a response that has been submitted or validated",
		);
	}

	// Apply updates
	if (data.values !== undefined) {
		const completedFields = countCompletedValues(data.values);
		response.values = data.values;
		response.progress = {
			completedFields,
			totalFields: Object.keys(data.values).length,
			requiredFields: Object.keys(data.values).length,
			requiredCompleted: completedFields,
			percentage: calculateProgress(data.values),
		};
	}

	if (data.sections !== undefined) {
		response.sections = data.sections;
	}
	if (data.attachments !== undefined) {
		response.attachments = data.attachments;
	}
	if (data.photos !== undefined) {
		response.photos = data.photos;
	}
	if (data.signatures !== undefined) {
		response.signatures = data.signatures;
	}
	if (data.gpsPoints !== undefined) {
		response.gpsPoints = data.gpsPoints;
	}

	await response.save();

	await createAuditLog({
		userId,
		entity: "TemplateResponse",
		entityId: response._id.toString(),
		action: "TEMPLATE_RESPONSE_UPDATED",
		after: { status: response.status, progress: response.progress },
	});

	return response;
}

/**
 * Submit TemplateResponse
 */
export async function submitTemplateResponse(
	id: string,
	userId: string,
): Promise<ITemplateResponseDocument> {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestError("INVALID_RESPONSE_ID", "Invalid response ID format");
	}

	const response = await TemplateResponse.findById(id);

	if (!response) {
		throw new NotFoundError("TEMPLATE_RESPONSE_NOT_FOUND", "Template response not found");
	}

	if (response.status !== "draft") {
		throw new BadRequestError("INVALID_SUBMIT_STATE", "Only draft responses can be submitted");
	}

	response.status = "submitted";
	response.submittedBy = userId;
	response.submittedAt = new Date();

	await response.save();

	await createAuditLog({
		userId,
		entity: "TemplateResponse",
		entityId: response._id.toString(),
		action: "TEMPLATE_RESPONSE_SUBMITTED",
		after: { status: "submitted" },
	});

	return response;
}

/**
 * Approve/Validate TemplateResponse
 */
export async function validateTemplateResponse(
	id: string,
	validatorId: string,
): Promise<ITemplateResponseDocument> {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestError("INVALID_RESPONSE_ID", "Invalid response ID format");
	}

	const response = await TemplateResponse.findById(id);

	if (!response) {
		throw new NotFoundError("TEMPLATE_RESPONSE_NOT_FOUND", "Template response not found");
	}

	if (response.status !== "submitted") {
		throw new BadRequestError(
			"INVALID_VALIDATE_STATE",
			"Only submitted responses can be validated",
		);
	}

	response.status = "validated";
	response.validatedBy = validatorId;
	response.validatedAt = new Date();

	await response.save();

	await createAuditLog({
		userId: validatorId,
		entity: "TemplateResponse",
		entityId: response._id.toString(),
		action: "TEMPLATE_RESPONSE_VALIDATED",
		after: { status: "validated" },
	});

	return response;
}

/**
 * Reject TemplateResponse
 */
export async function rejectTemplateResponse(
	id: string,
	validatorId: string,
	reason: string,
): Promise<ITemplateResponseDocument> {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestError("INVALID_RESPONSE_ID", "Invalid response ID format");
	}

	if (!reason || reason.trim().length === 0) {
		throw new BadRequestError("REJECTION_REASON_REQUIRED", "Rejection reason is required");
	}

	const response = await TemplateResponse.findById(id);

	if (!response) {
		throw new NotFoundError("TEMPLATE_RESPONSE_NOT_FOUND", "Template response not found");
	}

	if (response.status !== "submitted") {
		throw new BadRequestError(
			"INVALID_REJECTION_STATE",
			"Only submitted responses can be rejected",
		);
	}

	response.status = "rejected";
	response.validatedBy = validatorId;
	response.validatedAt = new Date();
	// Note: rejection reason stored in audit log, not in model

	await response.save();

	await createAuditLog({
		userId: validatorId,
		entity: "TemplateResponse",
		entityId: response._id.toString(),
		action: "TEMPLATE_RESPONSE_REJECTED",
		after: { status: "rejected", reason: reason.trim() },
	});

	return response;
}

/**
 * Delete TemplateResponse (only drafts can be deleted)
 */
export async function deleteTemplateResponse(id: string, userId: string): Promise<void> {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestError("INVALID_RESPONSE_ID", "Invalid response ID format");
	}

	const response = await TemplateResponse.findById(id);

	if (!response) {
		throw new NotFoundError("TEMPLATE_RESPONSE_NOT_FOUND", "Template response not found");
	}

	if (response.status !== "draft") {
		throw new BadRequestError("CANNOT_DELETE_RESPONSE", "Only draft responses can be deleted");
	}

	await TemplateResponse.findByIdAndDelete(id);

	await createAuditLog({
		userId,
		entity: "TemplateResponse",
		entityId: id,
		action: "TEMPLATE_RESPONSE_DELETED",
		after: { documentTemplateId: response.documentTemplateId.toString() },
	});
}
