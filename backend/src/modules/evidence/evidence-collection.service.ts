/**
 * EvidenceCollection Service — Business Logic Layer
 *
 * CRUD operations for structured evidence collections.
 * Links evidence items to entities (orders, planning, execution, kits, tools, template responses).
 */

import { Types } from "mongoose";
import {
	BadRequestError,
	NotFoundError,
	ServiceUnavailableError,
} from "../../common/errors/AppError";
import { isTransientDatabaseError } from "../../common/utils/transient-database-error";
import {
	EvidenceCollection,
	type IEvidenceCollectionDocument,
	type IEvidenceItemRecord,
} from "../../models/EvidenceCollection";
import { createAuditLog } from "../audit/audit.service";

export interface CreateEvidenceCollectionCommand {
	entityType: string;
	entityId: string;
	title: string;
	description?: string;
}

export interface AddEvidenceItemCommand {
	type: string;
	stage?: string;
	component?: string;
	description?: string;
	fileId?: string;
	url?: string;
	location?: {
		lat: number;
		lng: number;
		address?: string;
	};
	capturedBy?: string;
	linkedFieldKey?: string;
	linkedChecklistItemId?: string;
}

export interface EvidenceCollectionFilters {
	entityType?: "workOrder" | "planning" | "execution" | "kit" | "tool" | "templateResponse";
	entityId?: string;
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

type EvidenceCollectionEntityType = NonNullable<EvidenceCollectionFilters["entityType"]>;

type EvidenceCollectionListQuery = {
	entityType?: EvidenceCollectionEntityType;
	entityId?: Types.ObjectId;
	$or?: Array<{
		title?: { $regex: string; $options: string };
		description?: { $regex: string; $options: string };
	}>;
};

/**
 * Create a new EvidenceCollection
 */
export async function createEvidenceCollection(
	data: CreateEvidenceCollectionCommand,
	userId: string,
): Promise<IEvidenceCollectionDocument> {
	const collection = await EvidenceCollection.create({
		entityType: data.entityType as
			| "workOrder"
			| "planning"
			| "execution"
			| "kit"
			| "tool"
			| "templateResponse",
		entityId: new Types.ObjectId(data.entityId),
		title: data.title,
		description: data.description,
		evidenceItems: [],
		createdBy: new Types.ObjectId(userId),
	});

	await createAuditLog({
		userId,
		entity: "EvidenceCollection",
		entityId: collection._id.toString(),
		action: "EVIDENCE_COLLECTION_CREATED",
		after: { title: collection.title, entityType: data.entityType },
	});

	return collection;
}

/**
 * Get EvidenceCollection by ID
 */
export async function getEvidenceCollectionById(
	id: string,
): Promise<IEvidenceCollectionDocument | null> {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestError("Invalid collection ID format", "INVALID_COLLECTION_ID");
	}

	const collection = await EvidenceCollection.findById(id).lean();

	if (!collection) {
		throw new NotFoundError("Evidence collection", id);
	}

	return collection;
}

/**
 * Get all EvidenceCollections with filtering and pagination
 */
export async function getAllEvidenceCollections(
	filters: EvidenceCollectionFilters = {},
	pagination: PaginationOptions = {},
): Promise<PageEnvelope<IEvidenceCollectionDocument>> {
	const page = pagination.page || 1;
	const limit = pagination.limit || 20;
	const skip = (page - 1) * limit;

	const query: EvidenceCollectionListQuery = {};

	if (filters.entityType) {
		query.entityType = filters.entityType;
	}

	if (filters.entityId) {
		query.entityId = new Types.ObjectId(filters.entityId);
	}

	if (filters.search) {
		query.$or = [
			{ title: { $regex: filters.search, $options: "i" } },
			{ description: { $regex: filters.search, $options: "i" } },
		];
	}

	let data: IEvidenceCollectionDocument[];
	let total: number;

	try {
		[data, total] = await Promise.all([
			EvidenceCollection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
			EvidenceCollection.countDocuments(query),
		]);
	} catch (error) {
		if (isTransientDatabaseError(error as Error)) {
			throw new ServiceUnavailableError("Database temporarily unavailable. Please try again.");
		}
		throw error;
	}

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
 * Get EvidenceCollections by entity
 */
export async function getEvidenceCollectionsByEntity(
	entityType: string,
	entityId: string,
): Promise<IEvidenceCollectionDocument[]> {
	if (!Types.ObjectId.isValid(entityId)) {
		throw new BadRequestError("Invalid entity ID format", "INVALID_ENTITY_ID");
	}

	const collections = await EvidenceCollection.find({
		entityType: entityType as
			| "workOrder"
			| "planning"
			| "execution"
			| "kit"
			| "tool"
			| "templateResponse",
		entityId: new Types.ObjectId(entityId),
	})
		.sort({ createdAt: -1 })
		.lean();

	return collections;
}

/**
 * Add Evidence Item to Collection
 */
export async function addEvidenceItem(
	collectionId: string,
	item: AddEvidenceItemCommand,
	userId: string,
): Promise<IEvidenceCollectionDocument> {
	if (!Types.ObjectId.isValid(collectionId)) {
		throw new BadRequestError("Invalid collection ID format", "INVALID_COLLECTION_ID");
	}

	const collection = await EvidenceCollection.findById(collectionId);

	if (!collection) {
		throw new NotFoundError("Evidence collection", collectionId);
	}

	const inferredStage = inferStageFromItemType(item.type);

	const newItem: IEvidenceItemRecord = {
		itemId: `item-${Date.now()}`,
		type: item.type,
		stage: item.stage ?? inferredStage,
		component: item.component,
		description: item.description,
		fileId: item.fileId ? new Types.ObjectId(item.fileId) : undefined,
		fileUrl: item.url,
		location: item.location
			? {
					latitude: item.location.lat,
					longitude: item.location.lng,
					address: item.location.address,
				}
			: undefined,
		capturedAt: new Date(),
		capturedBy: new Types.ObjectId(item.capturedBy || userId),
		linkedFieldKey: item.linkedFieldKey,
		linkedChecklistItemId: item.linkedChecklistItemId,
	};

	collection.evidenceItems.push(newItem);
	await collection.save();

	await createAuditLog({
		userId,
		entity: "EvidenceCollection",
		entityId: collection._id.toString(),
		action: "EVIDENCE_ITEM_ADDED",
		after: { itemType: item.type, itemId: newItem.itemId },
	});

	return collection;
}

/**
 * Remove Evidence Item from Collection
 */
export async function removeEvidenceItem(
	collectionId: string,
	itemId: string,
	userId: string,
): Promise<IEvidenceCollectionDocument> {
	if (!Types.ObjectId.isValid(collectionId)) {
		throw new BadRequestError("Invalid collection ID format", "INVALID_COLLECTION_ID");
	}

	const collection = await EvidenceCollection.findById(collectionId);

	if (!collection) {
		throw new NotFoundError("Evidence collection", collectionId);
	}

	const itemIndex = collection.evidenceItems.findIndex((item) => item.itemId === itemId);

	if (itemIndex === -1) {
		throw new NotFoundError("Evidence item", itemId);
	}

	collection.evidenceItems.splice(itemIndex, 1);
	await collection.save();

	await createAuditLog({
		userId,
		entity: "EvidenceCollection",
		entityId: collection._id.toString(),
		action: "EVIDENCE_ITEM_REMOVED",
		after: { itemId },
	});

	return collection;
}

/**
 * Get Evidence Items by Stage
 */
export async function getItemsByStage(
	collectionId: string,
	stage: string,
): Promise<IEvidenceItemRecord[]> {
	if (!Types.ObjectId.isValid(collectionId)) {
		throw new BadRequestError("Invalid collection ID format", "INVALID_COLLECTION_ID");
	}

	const collection = await EvidenceCollection.findById(collectionId).lean();

	if (!collection) {
		throw new NotFoundError("Evidence collection", collectionId);
	}

	return collection.evidenceItems.filter((item) => item.stage === stage);
}

/**
 * Get Evidence Items by Component
 */
export async function getItemsByComponent(
	collectionId: string,
	component: string,
): Promise<IEvidenceItemRecord[]> {
	if (!Types.ObjectId.isValid(collectionId)) {
		throw new BadRequestError("Invalid collection ID format", "INVALID_COLLECTION_ID");
	}

	const collection = await EvidenceCollection.findById(collectionId).lean();

	if (!collection) {
		throw new NotFoundError("Evidence collection", collectionId);
	}

	return collection.evidenceItems.filter((item) => item.component === component);
}

/**
 * Delete EvidenceCollection
 */
export async function deleteEvidenceCollection(id: string, userId: string): Promise<void> {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestError("Invalid collection ID format", "INVALID_COLLECTION_ID");
	}

	const collection = await EvidenceCollection.findById(id);

	if (!collection) {
		throw new NotFoundError("Evidence collection", id);
	}

	await EvidenceCollection.findByIdAndDelete(id);

	await createAuditLog({
		userId,
		entity: "EvidenceCollection",
		entityId: id,
		action: "EVIDENCE_COLLECTION_DELETED",
		after: { title: collection.title },
	});
}

function inferStageFromItemType(
	type: AddEvidenceItemCommand["type"],
): IEvidenceItemRecord["stage"] {
	switch (type) {
		case "photo_before":
			return "before";
		case "photo_after":
			return "after";
		case "finding":
			return "finding";
		case "corrective_action":
			return "corrective_action";
		default:
			return "during";
	}
}
