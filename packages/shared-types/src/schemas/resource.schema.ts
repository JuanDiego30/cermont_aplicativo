/**
 * Resource Schema — Zod validation for resources (tools, vehicles, equipment)
 *
 * Maps to backend model: apps/backend/src/models/Resource.ts
 * Reference: DOC-09 Section Diccionario de Datos
 */

import { z } from "zod";
import { type AuditableDocument, ObjectIdSchema } from "./common.schema";

export const ResourceTypeEnum = z.enum(["tool", "vehicle", "equipment"]);

export type ResourceType = z.infer<typeof ResourceTypeEnum>;

export const ResourceStatusEnum = z.enum(["available", "in_use", "maintenance"]);

export type ResourceStatus = z.infer<typeof ResourceStatusEnum>;

/**
 * Create a new resource
 */
export const CreateResourceSchema = z
	.object({
		name: z.string().min(1).max(200),
		type: ResourceTypeEnum,
		description: z.string().optional(),
		serialNumber: z.string().optional(),
		purchaseDate: z.string().datetime().optional(),
	})
	.strict();

export type CreateResource = z.infer<typeof CreateResourceSchema>;

/**
 * Update a resource
 */
export const UpdateResourceSchema = z
	.object({
		name: z.string().min(1).max(200).optional(),
		type: ResourceTypeEnum.optional(),
		status: ResourceStatusEnum.optional(),
		description: z.string().optional(),
		serialNumber: z.string().optional(),
		purchaseDate: z.string().datetime().optional(),
		maintenanceDate: z.string().datetime().optional(),
	})
	.strict();

export type UpdateResource = z.infer<typeof UpdateResourceSchema>;

export const ResourceIdSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export type ResourceIdParams = z.infer<typeof ResourceIdSchema>;

export const UpdateResourceStatusSchema = z
	.object({
		status: ResourceStatusEnum,
	})
	.strict();

export type UpdateResourceStatus = z.infer<typeof UpdateResourceStatusSchema>;

/**
 * Full resource record (response)
 */
export const ResourceOutputDtoSchema = z
	.object({
		_id: z.string(),
		name: z.string(),
		type: ResourceTypeEnum,
		status: ResourceStatusEnum,
		description: z.string().optional(),
		serialNumber: z.string().optional(),
		purchaseDate: z.string().datetime().optional(),
		maintenanceDate: z.string().datetime().optional(),
		createdBy: z.string().optional(),
		updatedBy: z.string().optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strip();

export const ResourceSchema = ResourceOutputDtoSchema;
export type Resource = z.infer<typeof ResourceOutputDtoSchema>;

/**
 * Mongoose Document representation for Resource.
 * Used for type safety in backend services and repositories.
 */
export interface ResourceDocument<TID = string> extends AuditableDocument<TID> {
	name: string;
	type: ResourceType;
	status: ResourceStatus;
	description?: string;
	serial_number?: string;
	purchaseDate?: Date;
	maintenanceDate?: Date;
}
