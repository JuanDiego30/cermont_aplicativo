/**
 * Kit Service — Business Logic Layer
 *
 * CRUD operations + versioning + validation for kits.
 * Kits contain items (tools, equipment, materials, PPE), documents, forms, evidence requirements, and rules.
 */

import { Types } from "mongoose";
import { BadRequestError, NotFoundError } from "../../common/errors/AppError";
import {
	type EvidenceRequirement,
	type IKitDocument,
	Kit,
	type KitFileAttachment,
	type KitFormBinding,
	type KitItem,
	type KitRule,
} from "../../models/Kit";
import { createAuditLog } from "../audit/audit.service";

export interface CreateKitCommand {
	name: string;
	description?: string;
	serviceTypeIds?: string[];
	category?: string;
	items?: KitItem[];
	documents?: KitFileAttachment[];
	forms?: KitFormBinding[];
	evidenceRequirements?: EvidenceRequirement[];
	rules?: KitRule[];
}

export interface UpdateKitCommand {
	name?: string;
	description?: string;
	serviceTypeIds?: string[];
	category?: string;
	items?: KitItem[];
	documents?: KitFileAttachment[];
	forms?: KitFormBinding[];
	evidenceRequirements?: EvidenceRequirement[];
	rules?: KitRule[];
}

export type KitStatus = "draft" | "published" | "archived";

export interface KitFilters {
	status?: KitStatus;
	serviceTypeIds?: string[];
	category?: string;
	search?: string;
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
 * Create a new Kit
 */
export async function createKit(data: CreateKitCommand, userId: string): Promise<IKitDocument> {
	const kit = await Kit.create({
		name: data.name,
		description: data.description,
		serviceTypes: data.serviceTypeIds || [],
		category: data.category,
		version: 1,
		status: "draft",
		items: data.items || [],
		documents: data.documents || [],
		forms: data.forms || [],
		evidenceRequirements: data.evidenceRequirements || [],
		rules: data.rules || [],
		createdBy: new Types.ObjectId(userId),
	});

	await createAuditLog({
		userId,
		entity: "Kit",
		entityId: kit._id.toString(),
		action: "KIT_CREATED",
		after: { name: kit.name, status: kit.status, version: kit.version },
	});

	return kit;
}

/**
 * Get Kit by ID
 */
export async function getKitById(id: string): Promise<IKitDocument> {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestError("Invalid kit ID format", "INVALID_KIT_ID");
	}

	const kit = await Kit.findById(id).lean();

	if (!kit) {
		throw new NotFoundError("Kit", id);
	}

	return kit;
}

/**
 * Get all Kits with filtering and pagination
 */
export async function getAllKits(
	filters: KitFilters = {},
	pagination: PaginationOptions = {},
): Promise<PageEnvelope<IKitDocument>> {
	const page = pagination.page || 1;
	const limit = pagination.limit || 20;
	const skip = (page - 1) * limit;

	const query = {
		...(filters.status && { status: filters.status }),
		...(filters.category && { category: filters.category }),
		...(filters.serviceTypeIds?.length && { serviceTypes: { $in: filters.serviceTypeIds } }),
		...(filters.search && {
			$or: [
				{ name: { $regex: filters.search, $options: "i" } },
				{ description: { $regex: filters.search, $options: "i" } },
			],
		}),
	};

	const [data, total] = await Promise.all([
		Kit.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
		Kit.countDocuments(query),
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
 * Get Kits by service type
 */
export async function getKitsByServiceType(serviceTypeId: string): Promise<IKitDocument[]> {
	const kits = await Kit.find({
		serviceTypes: serviceTypeId,
		status: "published",
	})
		.sort({ version: -1, name: 1 })
		.lean();

	return kits;
}

/**
 * Update Kit
 */
export async function updateKit(
	id: string,
	data: UpdateKitCommand,
	userId: string,
): Promise<IKitDocument> {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestError("Invalid kit ID format", "INVALID_KIT_ID");
	}

	const kit = await Kit.findById(id);

	if (!kit) {
		throw new NotFoundError("Kit", id);
	}

	// Can only update drafts
	if (kit.status !== "draft") {
		throw new BadRequestError(
			"Only draft kits can be updated. Create a new version to make changes.",
			"CANNOT_UPDATE_KIT",
		);
	}

	// Apply updates
	if (data.name !== undefined) {
		kit.name = data.name;
	}
	if (data.description !== undefined) {
		kit.description = data.description;
	}
	if (data.serviceTypeIds !== undefined) {
		kit.serviceTypes = data.serviceTypeIds;
	}
	if (data.category !== undefined) {
		kit.category = data.category;
	}
	if (data.items !== undefined) {
		kit.items = data.items;
	}
	if (data.documents !== undefined) {
		kit.documents = data.documents;
	}
	if (data.forms !== undefined) {
		kit.forms = data.forms;
	}
	if (data.evidenceRequirements !== undefined) {
		kit.evidenceRequirements = data.evidenceRequirements;
	}
	if (data.rules !== undefined) {
		kit.rules = data.rules;
	}

	await kit.save();

	await createAuditLog({
		userId,
		entity: "Kit",
		entityId: kit._id.toString(),
		action: "KIT_UPDATED",
		after: { name: kit.name },
	});

	return kit;
}

/**
 * Publish Kit (increments version)
 */
export async function publishKit(id: string, userId: string): Promise<IKitDocument> {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestError("Invalid kit ID format", "INVALID_KIT_ID");
	}

	const kit = await Kit.findById(id);

	if (!kit) {
		throw new NotFoundError("Kit", id);
	}

	if (kit.status !== "draft") {
		throw new BadRequestError("Only draft kits can be published", "INVALID_PUBLISH_STATE");
	}

	// Validate completeness before publishing
	const validation = validateKitCompleteness(kit);
	if (!validation.isValid) {
		throw new BadRequestError(
			`Kit is not complete: ${validation.errors.join(", ")}`,
			"KIT_NOT_COMPLETE",
		);
	}

	// Archive previous published version if exists
	await Kit.updateMany(
		{ name: kit.name, status: "published", _id: { $ne: kit._id } },
		{ status: "archived" },
	);

	// Publish new version
	kit.status = "published";
	kit.version += 1;
	await kit.save();

	await createAuditLog({
		userId,
		entity: "Kit",
		entityId: kit._id.toString(),
		action: "KIT_PUBLISHED",
		after: { name: kit.name, version: kit.version },
	});

	return kit;
}

/**
 * Archive Kit
 */
export async function archiveKit(id: string, userId: string): Promise<IKitDocument> {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestError("Invalid kit ID format", "INVALID_KIT_ID");
	}

	const kit = await Kit.findById(id);

	if (!kit) {
		throw new NotFoundError("Kit", id);
	}

	if (kit.status !== "published") {
		throw new BadRequestError("Only published kits can be archived", "INVALID_ARCHIVE_STATE");
	}

	kit.status = "archived";
	await kit.save();

	await createAuditLog({
		userId,
		entity: "Kit",
		entityId: kit._id.toString(),
		action: "KIT_ARCHIVED",
		after: { name: kit.name, version: kit.version },
	});

	return kit;
}

/**
 * Delete Kit (only drafts can be deleted)
 */
export async function deleteKit(id: string, userId: string): Promise<void> {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestError("Invalid kit ID format", "INVALID_KIT_ID");
	}

	const kit = await Kit.findById(id);

	if (!kit) {
		throw new NotFoundError("Kit", id);
	}

	if (kit.status !== "draft") {
		throw new BadRequestError("Only draft kits can be deleted", "CANNOT_DELETE_KIT");
	}

	await Kit.findByIdAndDelete(id);

	await createAuditLog({
		userId,
		entity: "Kit",
		entityId: id,
		action: "KIT_DELETED",
		after: { name: kit.name },
	});
}

/**
 * Validate Kit Completeness
 */
export function validateKitCompleteness(kit: IKitDocument): { isValid: boolean; errors: string[] } {
	const errors: string[] = [];

	// Check required items
	const requiredItems = kit.items?.filter((item) => item.required) || [];
	if (requiredItems.length === 0) {
		errors.push("Kit must have at least one item");
	}

	// Check items have documents if required
	for (const item of requiredItems) {
		if (item.type === "tool" || item.type === "equipment") {
			// Items should have associated documents or be marked as not requiring them
			if (!item.code && !item.description) {
				errors.push(`Item "${item.name}" requires documents but none are attached`);
			}
		}
	}

	// Check critical items are present
	const criticalItems = kit.items?.filter((item) => item.critical) || [];
	if (criticalItems.length > 0) {
		// All critical items should be present
		const missingCritical = criticalItems.filter(
			(item) => typeof item.quantity !== "number" || item.quantity <= 0,
		);
		if (missingCritical.length > 0) {
			errors.push(
				`Missing quantity for critical items: ${missingCritical.map((i) => i.name).join(", ")}`,
			);
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}

/**
 * Duplicate Kit
 */
export async function duplicateKit(
	id: string,
	userId: string,
	newName?: string,
): Promise<IKitDocument> {
	const original = await Kit.findById(id);

	if (!original) {
		throw new NotFoundError("Kit", id);
	}

	const duplicate = await Kit.create({
		name: newName || `${original.name} (Copy)`,
		description: original.description,
		serviceTypes: original.serviceTypes,
		category: original.category,
		version: 1,
		status: "draft",
		items: original.items,
		documents: original.documents,
		forms: original.forms,
		evidenceRequirements: original.evidenceRequirements,
		rules: original.rules,
		createdBy: new Types.ObjectId(userId),
	});

	await createAuditLog({
		userId,
		entity: "Kit",
		entityId: duplicate._id.toString(),
		action: "KIT_DUPLICATED",
		after: { originalId: id, name: duplicate.name },
	});

	return duplicate;
}
