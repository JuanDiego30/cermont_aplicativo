/**
 * Tool Service — Business Logic Layer
 *
 * CRUD operations + certifications + documents for tools.
 * Tools are equipment with certifications, documents, and evidence requirements.
 */

import type { AddToolCertificationInput, AddToolDocumentInput } from "@cermont/shared-types";
import { Types } from "mongoose";
import { BadRequestError, NotFoundError } from "../../common/errors/AppError";
import { type IToolDocument, Tool, type ToolCertification } from "../../models/Tool";
import { createAuditLog } from "../audit/audit.service";

export interface CreateToolCommand {
	name: string;
	category?: string;
	description?: string;
	serialNumber?: string;
	brand?: string;
	modelName?: string;
	status?: string;
	documents?: AddToolDocumentInput[];
	certifications?: AddToolCertificationInput[];
	evidenceRequirements?: Record<string, unknown>[];
	dynamicForms?: string[];
}

export interface UpdateToolCommand {
	name?: string;
	category?: string;
	description?: string;
	serialNumber?: string;
	brand?: string;
	modelName?: string;
	status?: string;
	documents?: AddToolDocumentInput[];
	certifications?: AddToolCertificationInput[];
	evidenceRequirements?: Record<string, unknown>[];
	dynamicForms?: string[];
}

export interface ToolFilters {
	status?: string;
	category?: string;
	search?: string;
	brand?: string;
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
 * Create a new Tool
 */
export async function createTool(data: CreateToolCommand, userId: string): Promise<IToolDocument> {
	const tool = await Tool.create({
		name: data.name,
		type: "tool", // Required field
		category: data.category,
		description: data.description,
		serialNumber: data.serialNumber,
		brand: data.brand,
		modelName: data.modelName,
		status: (data.status || "available") as
			| "available"
			| "assigned"
			| "maintenance"
			| "expired"
			| "inactive",
		documents: data.documents || [],
		certifications: data.certifications || [],
		evidenceRequirements: data.evidenceRequirements || [],
		dynamicForms: data.dynamicForms
			? data.dynamicForms.map((id: string) => new Types.ObjectId(id))
			: [],
		createdBy: new Types.ObjectId(userId),
	});

	await createAuditLog({
		userId,
		entity: "Tool",
		entityId: tool._id.toString(),
		action: "TOOL_CREATED",
		after: { name: tool.name, status: tool.status },
	});

	return tool;
}

/**
 * Get Tool by ID
 */
export async function getToolById(id: string): Promise<IToolDocument> {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestError("Invalid tool ID format", "INVALID_TOOL_ID");
	}

	const tool = await Tool.findById(id).lean();

	if (!tool) {
		throw new NotFoundError("Tool", id);
	}

	return tool;
}

/**
 * Get all Tools with filtering and pagination
 */
export async function getAllTools(
	filters: ToolFilters = {},
	pagination: PaginationOptions = {},
): Promise<PageEnvelope<IToolDocument>> {
	const page = pagination.page || 1;
	const limit = pagination.limit || 20;
	const skip = (page - 1) * limit;

	const query: Record<string, unknown> = {};

	if (filters.status) {
		query.status = filters.status;
	}

	if (filters.category) {
		query.category = filters.category;
	}

	if (filters.brand) {
		query.brand = filters.brand;
	}

	if (filters.search) {
		query.$or = [
			{ name: { $regex: filters.search, $options: "i" } },
			{ serialNumber: { $regex: filters.search, $options: "i" } },
			{ brand: { $regex: filters.search, $options: "i" } },
		];
	}

	const [data, total] = await Promise.all([
		Tool.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
		Tool.countDocuments(query),
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
 * Update Tool
 */
export async function updateTool(
	id: string,
	data: UpdateToolCommand,
	userId: string,
): Promise<IToolDocument> {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestError("Invalid tool ID format", "INVALID_TOOL_ID");
	}

	const tool = await Tool.findById(id);

	if (!tool) {
		throw new NotFoundError("Tool", id);
	}

	// Apply updates
	if (data.name !== undefined) {
		tool.name = data.name;
	}
	if (data.category !== undefined) {
		tool.category = data.category;
	}
	if (data.description !== undefined) {
		tool.description = data.description;
	}
	if (data.serialNumber !== undefined) {
		tool.serialNumber = data.serialNumber;
	}
	if (data.brand !== undefined) {
		tool.brand = data.brand;
	}
	if (data.modelName !== undefined) {
		tool.modelName = data.modelName;
	}
	if (data.status !== undefined) {
		tool.status = data.status as "available" | "assigned" | "maintenance" | "expired" | "inactive";
	}
	if (data.documents !== undefined) {
		tool.documents = data.documents as unknown as IToolDocument["documents"];
	}
	if (data.certifications !== undefined) {
		tool.certifications = data.certifications as unknown as IToolDocument["certifications"];
	}
	if (data.evidenceRequirements !== undefined) {
		tool.evidenceRequirements =
			data.evidenceRequirements as unknown as IToolDocument["evidenceRequirements"];
	}
	if (data.dynamicForms !== undefined) {
		tool.dynamicForms = data.dynamicForms.map((id) => new Types.ObjectId(id));
	}

	await tool.save();

	await createAuditLog({
		userId,
		entity: "Tool",
		entityId: tool._id.toString(),
		action: "TOOL_UPDATED",
		after: { name: tool.name },
	});

	return tool;
}

/**
 * Add Certification to Tool
 */
export async function addCertification(
	id: string,
	certification: {
		type: string;
		name: string;
		issuedAt: Date;
		expiresAt: Date;
		status?: string;
		issuer?: string;
		documentId?: string;
	},
	userId: string,
): Promise<IToolDocument> {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestError("Invalid tool ID format", "INVALID_TOOL_ID");
	}

	const tool = await Tool.findById(id);

	if (!tool) {
		throw new NotFoundError("Tool", id);
	}

	const newCertification = {
		certificationId: `cert-${Date.now()}`,
		type: certification.type as ToolCertification["type"],
		name: certification.name,
		issuedAt: certification.issuedAt,
		expiresAt: certification.expiresAt,
		status: (certification.status || "valid") as ToolCertification["status"],
		issuer: certification.issuer,
		documentId: certification.documentId,
	};

	tool.certifications.push(newCertification);
	await tool.save();

	await createAuditLog({
		userId,
		entity: "Tool",
		entityId: tool._id.toString(),
		action: "TOOL_CERTIFICATION_ADDED",
		after: { certificationType: certification.type },
	});

	return tool;
}

/**
 * Remove Certification from Tool
 */
export async function removeCertification(
	id: string,
	certificationId: string,
	userId: string,
): Promise<IToolDocument> {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestError("Invalid tool ID format", "INVALID_TOOL_ID");
	}

	const tool = await Tool.findById(id);

	if (!tool) {
		throw new NotFoundError("Tool", id);
	}

	const certIndex = tool.certifications.findIndex((c) => c.certificationId === certificationId);

	if (certIndex === -1) {
		throw new NotFoundError("Certification", certificationId);
	}

	const removed = tool.certifications.splice(certIndex, 1)[0];
	await tool.save();

	await createAuditLog({
		userId,
		entity: "Tool",
		entityId: tool._id.toString(),
		action: "TOOL_CERTIFICATION_REMOVED",
		after: { certificationType: removed.type },
	});

	return tool;
}

/**
 * Add Document to Tool
 */
export async function addDocument(
	id: string,
	document: {
		name: string;
		type: string;
		fileId?: string;
		url?: string;
	},
	userId: string,
): Promise<IToolDocument> {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestError("Invalid tool ID format", "INVALID_TOOL_ID");
	}

	const tool = await Tool.findById(id);

	if (!tool) {
		throw new NotFoundError("Tool", id);
	}

	const newDocument = {
		documentId: `doc-${Date.now()}`,
		name: document.name,
		type: document.type,
		fileId: document.fileId,
		url: document.url,
		uploadedAt: new Date(),
	};

	tool.documents.push(newDocument);
	await tool.save();

	await createAuditLog({
		userId,
		entity: "Tool",
		entityId: tool._id.toString(),
		action: "TOOL_DOCUMENT_ADDED",
		after: { documentName: document.name },
	});

	return tool;
}

/**
 * Remove Document from Tool
 */
export async function removeDocument(
	id: string,
	documentId: string,
	userId: string,
): Promise<IToolDocument> {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestError("Invalid tool ID format", "INVALID_TOOL_ID");
	}

	const tool = await Tool.findById(id);

	if (!tool) {
		throw new NotFoundError("Tool", id);
	}

	const docIndex = tool.documents.findIndex((d) => d.documentId === documentId);

	if (docIndex === -1) {
		throw new NotFoundError("Document", documentId);
	}

	const removed = tool.documents.splice(docIndex, 1)[0];
	await tool.save();

	await createAuditLog({
		userId,
		entity: "Tool",
		entityId: tool._id.toString(),
		action: "TOOL_DOCUMENT_REMOVED",
		after: { documentName: removed.name },
	});

	return tool;
}

/**
 * Check Expired Certifications
 */
export async function getExpiredCertifications(asOfDate: Date = new Date()): Promise<
	{
		toolId: unknown;
		toolName: string;
		serialNumber?: string;
		certificationId: string;
		certificationType: string;
		expiredAt: Date;
		daysExpired: number;
	}[]
> {
	const tools = await Tool.find({
		"certifications.expiresAt": { $lt: asOfDate },
		"certifications.status": "valid",
	}).lean();

	const expired: {
		toolId: unknown;
		toolName: string;
		serialNumber?: string;
		certificationId: string;
		certificationType: string;
		expiredAt: Date;
		daysExpired: number;
	}[] = [];

	for (const tool of tools) {
		for (const cert of tool.certifications) {
			if (new Date(cert.expiresAt) < asOfDate && cert.status === "valid") {
				expired.push({
					toolId: tool._id,
					toolName: tool.name,
					serialNumber: tool.serialNumber,
					certificationId: cert.certificationId,
					certificationType: cert.type,
					expiredAt: cert.expiresAt,
					daysExpired: Math.floor(
						(asOfDate.getTime() - new Date(cert.expiresAt).getTime()) / (1000 * 60 * 60 * 24),
					),
				});
			}
		}
	}

	return expired.sort((a, b) => b.daysExpired - a.daysExpired);
}

/**
 * Delete Tool
 */
export async function deleteTool(id: string, userId: string): Promise<void> {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestError("Invalid tool ID format", "INVALID_TOOL_ID");
	}

	const tool = await Tool.findById(id);

	if (!tool) {
		throw new NotFoundError("Tool", id);
	}

	await Tool.findByIdAndDelete(id);

	await createAuditLog({
		userId,
		entity: "Tool",
		entityId: id,
		action: "TOOL_DELETED",
		after: { name: tool.name },
	});
}
