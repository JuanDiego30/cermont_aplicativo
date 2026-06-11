import type {
	CreateCustomFieldDefinitionDto,
	UpdateCustomFieldDefinitionDto,
} from "@cermont/shared-types";
import { Types } from "mongoose";
import { BadRequestError, ConflictError, NotFoundError } from "../../common/errors/AppError";
import { CustomFieldDefinition } from "./custom-field.model";

function parseObjectId(value: string, field: string): Types.ObjectId {
	if (!Types.ObjectId.isValid(value)) {
		throw new BadRequestError(`Invalid ${field}`);
	}
	return new Types.ObjectId(value);
}

export async function listDefinitions(entityType?: string, includeInactive = false) {
	const filter: Record<string, unknown> = {};
	if (entityType) {
		filter.entityType = entityType;
	}
	if (!includeInactive) {
		filter.isActive = true;
	}
	return CustomFieldDefinition.find(filter).sort({ entityType: 1, order: 1, name: 1 }).lean();
}

export async function getDefinitionById(id: string) {
	const oid = parseObjectId(id, "definitionId");
	const def = await CustomFieldDefinition.findById(oid).lean();
	if (!def) {
		throw new NotFoundError("CustomFieldDefinition", id);
	}
	return def;
}

export async function createDefinition(dto: CreateCustomFieldDefinitionDto, userId: string) {
	const existing = await CustomFieldDefinition.findOne({
		entityType: dto.entityType,
		name: dto.name,
	}).lean();
	if (existing) {
		throw new ConflictError(`Field '${dto.name}' already exists for ${dto.entityType}`);
	}
	return CustomFieldDefinition.create({
		...dto,
		createdBy: parseObjectId(userId, "userId"),
	});
}

export async function updateDefinition(
	id: string,
	dto: UpdateCustomFieldDefinitionDto,
	userId: string,
) {
	const oid = parseObjectId(id, "definitionId");
	const def = await CustomFieldDefinition.findById(oid);
	if (!def) {
		throw new NotFoundError("CustomFieldDefinition", id);
	}
	Object.assign(def, dto, { updatedBy: parseObjectId(userId, "userId") });
	return def.save();
}

export async function deleteDefinition(id: string, userId: string) {
	const oid = parseObjectId(id, "definitionId");
	const def = await CustomFieldDefinition.findById(oid);
	if (!def) {
		throw new NotFoundError("CustomFieldDefinition", id);
	}
	def.isActive = false;
	def.updatedBy = parseObjectId(userId, "userId");
	return def.save();
}
