/**
 * Maintenance Kit Schema — Zod validation for maintenance kits (typical kits)
 *
 * Maps to backend model: apps/backend/src/models/MaintenanceKit.ts
 * Reference: DOC-09 Section Diccionario de Datos, DOC-07 Section Kit Tipico
 */

import { z } from "zod";

export const ActivityTypeEnum = z.enum([
	"electrico",
	"mecanico",
	"civil",
	"telecomunicaciones",
	"hse",
]);

export type ActivityType = z.infer<typeof ActivityTypeEnum>;

/**
 * Tool within a kit
 */
export const ToolSchema = z.object({
	name: z.string().min(1).max(200),
	quantity: z.number().int().min(1),
	specifications: z.string().optional(),
});

export type Tool = z.infer<typeof ToolSchema>;

/**
 * Equipment within a kit
 */
export const EquipmentSchema = z.object({
	name: z.string().min(1).max(200),
	quantity: z.number().int().min(1),
	certificateRequired: z.boolean().default(false),
});

export type Equipment = z.infer<typeof EquipmentSchema>;

/**
 * Create a new maintenance kit
 */
export const CreateMaintenanceKitSchema = z.object({
	name: z.string().min(3).max(200),
	activityType: ActivityTypeEnum,
	tools: z.array(ToolSchema).min(1, "At least one tool required"),
	equipment: z.array(EquipmentSchema).default([]),
});

export type CreateMaintenanceKit = z.infer<typeof CreateMaintenanceKitSchema>;

/**
 * Update a maintenance kit
 */
export const UpdateMaintenanceKitSchema = z.object({
	name: z.string().min(3).max(200).optional(),
	activityType: ActivityTypeEnum.optional(),
	tools: z.array(ToolSchema).optional(),
	equipment: z.array(EquipmentSchema).optional(),
	isActive: z.boolean().optional(),
});

export type UpdateMaintenanceKit = z.infer<typeof UpdateMaintenanceKitSchema>;

/**
 * Full maintenance kit record (response)
 */
export const MaintenanceKitOutputDtoSchema = z.object({
	_id: z.string(),
	name: z.string(),
	activityType: ActivityTypeEnum,
	tools: z.array(ToolSchema),
	equipment: z.array(EquipmentSchema),
	isActive: z.boolean(),
	createdBy: z.string(),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});

export const MaintenanceKitSchema = MaintenanceKitOutputDtoSchema;
export type MaintenanceKit = z.infer<typeof MaintenanceKitOutputDtoSchema>;
