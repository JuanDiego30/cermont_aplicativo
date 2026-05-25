/**
 * Maintenance Kit Service for Cermont Backend
 *
 * Handles kit management business logic:
 * - CRUD operations for kits
 * - Duplicate name validation
 * - Soft deactivation
 */

import type { CreateMaintenanceKit, UpdateMaintenanceKit } from "@cermont/shared-types";
import { AppError } from "../../common/errors";
import { createLogger } from "../../common/utils/logger";
import {
	escapeRegExp,
	normalizeBoolean,
	normalizeQuantity,
	normalizeText,
} from "../../common/utils/normalization";
import { MaintenanceKit } from "../../models/MaintenanceKit.js";

const log = createLogger("kit-service");

export interface CreateKitData extends Partial<CreateMaintenanceKit> {
	activity_type?: string;
	isActive?: boolean;
	is_active?: boolean;
}

export interface UpdateKitData extends Partial<UpdateMaintenanceKit> {
	activity_type?: string;
	is_active?: boolean;
}

function mapTool(
	tool: Partial<CreateMaintenanceKit["tools"][number]> & { specifications?: unknown },
): { name: string; quantity: number; specifications?: string } | null {
	const name = normalizeText(tool.name);
	const quantity = normalizeQuantity(tool.quantity);

	if (!name || quantity === undefined) {
		return null;
	}

	const specifications = normalizeText(tool.specifications);

	return {
		name,
		quantity,
		...(specifications ? { specifications } : {}),
	};
}

function mapEquipment(
	item: Partial<CreateMaintenanceKit["equipment"][number]> & {
		certificateRequired?: unknown;
		certificate_required?: unknown;
	},
): { name: string; quantity: number; certificate_required: boolean } | null {
	const name = normalizeText(item.name);
	const quantity = normalizeQuantity(item.quantity);

	if (!name || quantity === undefined) {
		return null;
	}

	const certificateRequired =
		normalizeBoolean(item.certificateRequired ?? item.certificate_required) ?? false;

	return {
		name,
		quantity,
		certificate_required: certificateRequired,
	};
}

function buildCreateDocument(data: CreateKitData, userId: string): Record<string, unknown> {
	const createDoc: Record<string, unknown> = {
		created_by: userId,
		is_active: true,
	};

	const name = normalizeText(data.name);
	if (name) {
		createDoc.name = name;
	}

	const activityType = normalizeText(data.activityType ?? data.activity_type);
	if (activityType) {
		createDoc.activity_type = activityType;
	}

	if (data.tools !== undefined) {
		createDoc.tools = data.tools
			.map(mapTool)
			.filter((tool): tool is NonNullable<typeof tool> => tool !== null);
	}

	if (data.equipment !== undefined) {
		createDoc.equipment = data.equipment
			.map(mapEquipment)
			.filter((entry): entry is NonNullable<typeof entry> => entry !== null);
	}

	const isActive = normalizeBoolean(data.isActive ?? data.is_active);
	if (isActive !== undefined) {
		createDoc.is_active = isActive;
	}

	return createDoc;
}

function buildUpdateDocument(updates: UpdateKitData): Record<string, unknown> {
	const updateDoc: Record<string, unknown> = {};

	const name = normalizeText(updates.name);
	if (name) {
		updateDoc.name = name;
	}

	const activityType = normalizeText(updates.activityType ?? updates.activity_type);
	if (activityType) {
		updateDoc.activity_type = activityType;
	}

	if (updates.tools !== undefined) {
		updateDoc.tools = updates.tools
			.map(mapTool)
			.filter((tool): tool is NonNullable<typeof tool> => tool !== null);
	}

	if (updates.equipment !== undefined) {
		updateDoc.equipment = updates.equipment
			.map(mapEquipment)
			.filter((entry): entry is NonNullable<typeof entry> => entry !== null);
	}

	const isActive = normalizeBoolean(updates.isActive ?? updates.is_active);
	if (isActive !== undefined) {
		updateDoc.is_active = isActive;
	}

	return updateDoc;
}

/**
 * Create a new kit
 */
async function createKit(data: CreateKitData, userId: string): Promise<unknown> {
	const normalizedName = normalizeText(data.name);
	if (normalizedName) {
		const existing = await MaintenanceKit.findOne({ name: normalizedName }).lean();
		if (existing) {
			throw new AppError("A kit with this name already exists", 409, "DUPLICATE_KIT_NAME");
		}
	}

	const kit = await MaintenanceKit.create(buildCreateDocument(data, userId));

	log.info("Kit created", { kitId: String(kit._id), name: normalizedName ?? data.name });
	return kit;
}

/**
 * Get all kits with filters and pagination
 */
async function findAllKits(
	filters: {
		activityType?: unknown;
		activity_type?: unknown;
		isActive?: unknown;
		is_active?: unknown;
		search?: unknown;
	},
	page: number = 1,
	limit: number = 50,
): Promise<{ data: unknown[]; total: number }> {
	const where: Record<string, unknown> = {};
	const activityType = normalizeText(filters.activityType ?? filters.activity_type);
	const isActive = normalizeBoolean(filters.isActive ?? filters.is_active);
	const search = normalizeText(filters.search);

	if (activityType) {
		where.activity_type = activityType;
	}
	if (isActive !== undefined) {
		where.is_active = isActive;
	}
	if (search) {
		where.name = { $regex: escapeRegExp(search), $options: "i" };
	}

	const skip = (page - 1) * limit;

	const [data, total] = await Promise.all([
		MaintenanceKit.find(where)
			.populate("created_by", "name email")
			.sort({ activity_type: 1, name: 1 })
			.limit(limit)
			.skip(skip)
			.lean(),
		MaintenanceKit.countDocuments(where),
	]);

	return { data, total };
}

/**
 * Get kit by ID
 */
async function findKitById(id: string): Promise<unknown> {
	const kit = await MaintenanceKit.findById(id).populate("created_by", "name email").lean();
	if (!kit) {
		throw new AppError("Kit not found", 404, "KIT_NOT_FOUND");
	}
	return kit;
}

/**
 * Update a kit
 */
async function updateKit(id: string, updates: UpdateKitData): Promise<unknown> {
	const kit = await MaintenanceKit.findById(id);
	if (!kit) {
		throw new AppError("Kit not found", 404, "KIT_NOT_FOUND");
	}

	const normalizedName = normalizeText(updates.name);
	if (normalizedName && normalizedName !== kit.name) {
		const existing = await MaintenanceKit.findOne({ name: normalizedName }).lean();
		if (existing) {
			throw new AppError("A kit with this name already exists", 409, "DUPLICATE_KIT_NAME");
		}
	}

	const updateDoc = buildUpdateDocument(updates);
	Object.assign(kit, updateDoc);
	await kit.save();

	log.info("Kit updated", { kitId: id });
	return kit;
}

/**
 * Soft deactivate a kit
 */
async function deleteKit(id: string): Promise<void> {
	const kit = await MaintenanceKit.findById(id);
	if (!kit) {
		throw new AppError("Kit not found", 404, "KIT_NOT_FOUND");
	}

	kit.is_active = false;
	await kit.save();

	log.info("Kit deactivated", { kitId: id });
}

export const MaintenanceKitService = {
	create: createKit,
	findAll: findAllKits,
	findById: findKitById,
	update: updateKit,
	delete: deleteKit,
} as const;
