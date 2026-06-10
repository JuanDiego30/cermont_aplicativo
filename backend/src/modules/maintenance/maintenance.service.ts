/**
 * Maintenance Kit Service for Cermont Backend
 *
 * Handles kit management business logic:
 * - CRUD operations for kits
 * - Duplicate name validation
 * - Soft deactivation
 */

import type {
	CreateMaintenanceKit,
	CustomFieldValues,
	StatusObject,
	UpdateMaintenanceKit,
} from "@cermont/shared-types";
import { isPresent } from "@cermont/shared-types";
import { AppError, ServiceUnavailableError } from "../../common/errors";
import { createLogger } from "../../common/utils/logger";
import {
	escapeRegExp,
	normalizeBoolean,
	normalizeQuantity,
	normalizeText,
} from "../../common/utils/normalization";
import { isTransientDatabaseError } from "../../common/utils/transient-database-error";
import { type ActivityType, MaintenanceKit } from "../../models/MaintenanceKit.js";

const log = createLogger("kit-service");

export interface CreateKitCommand extends Partial<CreateMaintenanceKit> {
	activity_type?: string;
	isActive?: boolean;
	is_active?: boolean;
}

export interface UpdateKitCommand extends Partial<UpdateMaintenanceKit> {
	activity_type?: string;
	is_active?: boolean;
}

type ToolMapEntry = {
	name: string;
	quantity: number;
	specifications?: string;
	customFields?: NonNullable<CustomFieldValues>;
};

type EquipmentMapEntry = {
	name: string;
	quantity: number;
	certificate_required: boolean;
	customFields?: NonNullable<CustomFieldValues>;
};

function mapTool(
	tool: Partial<CreateMaintenanceKit["tools"][number]> & { specifications?: unknown },
): StatusObject<ToolMapEntry> {
	const name = normalizeText(tool.name);
	const quantity = normalizeQuantity(tool.quantity);

	if (!name || quantity === undefined) {
		return { status: "absent" };
	}

	const specifications = normalizeText(tool.specifications);
	const customFields = normalizeCustomFields(tool.customFields);

	return {
		status: "present",
		value: {
			name,
			quantity,
			...(specifications ? { specifications } : {}),
			...(Object.keys(customFields).length > 0 ? { customFields } : {}),
		},
	};
}

function mapEquipment(
	item: Partial<CreateMaintenanceKit["equipment"][number]> & {
		certificateRequired?: string | number | boolean;
		certificate_required?: string | number | boolean;
	},
): StatusObject<EquipmentMapEntry> {
	const name = normalizeText(item.name);
	const quantity = normalizeQuantity(item.quantity);

	if (!name || quantity === undefined) {
		return { status: "absent" };
	}

	const certificateRequired =
		normalizeBoolean(item.certificateRequired ?? item.certificate_required) ?? false;
	const customFields = normalizeCustomFields(item.customFields);

	return {
		status: "present",
		value: {
			name,
			quantity,
			certificate_required: certificateRequired,
			...(Object.keys(customFields).length > 0 ? { customFields } : {}),
		},
	};
}

function normalizeCustomFields(customFields: CustomFieldValues): NonNullable<CustomFieldValues> {
	if (!customFields) {
		return {};
	}

	const entries = Object.entries(customFields)
		.map(([key, value]) => [normalizeText(key), value] as const)
		.filter(([key]) => Boolean(key));

	return entries.length > 0 ? Object.fromEntries(entries) : {};
}

interface CreateDocumentInput {
	created_by: string;
	is_active: boolean;
	name?: string;
	activity_type?: ActivityType;
	tools?: ToolMapEntry[];
	equipment?: EquipmentMapEntry[];
}

interface UpdateDocumentInput {
	name?: string;
	activity_type?: ActivityType;
	tools?: ToolMapEntry[];
	equipment?: EquipmentMapEntry[];
	is_active?: boolean;
}

function normalizeActivityType(value?: string): StatusObject<ActivityType> {
	const activityType = normalizeText(value);
	switch (activityType) {
		case "electrico":
		case "mecanico":
		case "civil":
		case "telecomunicaciones":
		case "hse":
			return { status: "present", value: activityType };
		default:
			return { status: "absent" };
	}
}

function buildCreateDocument(data: CreateKitCommand, userId: string) {
	const createDoc: CreateDocumentInput = {
		created_by: userId,
		is_active: true,
	};

	const name = normalizeText(data.name);
	if (name) {
		createDoc.name = name;
	}

	const activityType = normalizeActivityType(data.activityType ?? data.activity_type);
	if (isPresent(activityType)) {
		createDoc.activity_type = activityType.value;
	}

	if (data.tools !== undefined) {
		createDoc.tools = data.tools
			.map(mapTool)
			.filter(isPresent)
			.map((t) => t.value);
	}

	if (data.equipment !== undefined) {
		createDoc.equipment = data.equipment
			.map(mapEquipment)
			.filter(isPresent)
			.map((e) => e.value);
	}

	const isActive = normalizeBoolean(data.isActive ?? data.is_active);
	if (isActive !== undefined) {
		createDoc.is_active = isActive;
	}

	return createDoc;
}

function buildUpdateDocument(updates: UpdateKitCommand) {
	const updateDoc: UpdateDocumentInput = {};

	const name = normalizeText(updates.name);
	if (name) {
		updateDoc.name = name;
	}

	const activityType = normalizeActivityType(updates.activityType ?? updates.activity_type);
	if (isPresent(activityType)) {
		updateDoc.activity_type = activityType.value;
	}

	if (updates.tools !== undefined) {
		updateDoc.tools = updates.tools
			.map(mapTool)
			.filter(isPresent)
			.map((t) => t.value);
	}

	if (updates.equipment !== undefined) {
		updateDoc.equipment = updates.equipment
			.map(mapEquipment)
			.filter(isPresent)
			.map((e) => e.value);
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
async function createKit(data: CreateKitCommand, userId: string): Promise<unknown> {
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
	const activityType = normalizeText(String(filters.activityType ?? filters.activity_type ?? ""));

	const isActive = normalizeBoolean(String(filters.isActive ?? filters.is_active));
	const search = normalizeText(String(filters.search ?? ""));

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

	let data: unknown[];
	let total: number;

	try {
		[data, total] = await Promise.all([
			MaintenanceKit.find(where)
				.populate("created_by", "name email")
				.sort({ activity_type: 1, name: 1 })
				.limit(limit)
				.skip(skip)
				.lean(),
			MaintenanceKit.countDocuments(where),
		]);
	} catch (error) {
		if (isTransientDatabaseError(error as Error)) {
			throw new ServiceUnavailableError("Database temporarily unavailable. Please try again.");
		}
		throw error;
	}

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
async function updateKit(id: string, updates: UpdateKitCommand): Promise<unknown> {
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
