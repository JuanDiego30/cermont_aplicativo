import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const ExecutionMaterialUsageSchema = z
	.object({
		usageId: z.string().min(1).max(80),
		materialId: ObjectIdSchema.optional(),
		name: z.string().min(1).max(200),
		quantityPlanned: z.number().nonnegative().default(0),
		quantityUsed: z.number().nonnegative(),
		unit: z.string().min(1).max(50),
		notes: z.string().max(500).optional(),
		recordedAt: z.string().datetime(),
		recordedBy: ObjectIdSchema,
	})
	.strict();
export type ExecutionMaterialUsage = z.infer<typeof ExecutionMaterialUsageSchema>;

export const MaterialLineSchema = ExecutionMaterialUsageSchema;
export type MaterialLine = ExecutionMaterialUsage;

export const ExecutionToolUsageSchema = z
	.object({
		usageId: z.string().min(1).max(80),
		toolId: ObjectIdSchema.optional(),
		name: z.string().min(1).max(200),
		quantityPlanned: z.number().int().nonnegative().default(0),
		quantityUsed: z.number().int().nonnegative(),
		condition: z.enum(["ok", "damaged", "lost", "returned"]).default("ok"),
		notes: z.string().max(500).optional(),
		recordedAt: z.string().datetime(),
		recordedBy: ObjectIdSchema,
	})
	.strict();
export type ExecutionToolUsage = z.infer<typeof ExecutionToolUsageSchema>;

export const ExecutionEquipmentUsageSchema = z
	.object({
		usageId: z.string().min(1).max(80),
		equipmentId: ObjectIdSchema.optional(),
		name: z.string().min(1).max(200),
		startedAt: z.string().datetime(),
		endedAt: z.string().datetime().optional(),
		hoursUsed: z.number().nonnegative().optional(),
		condition: z.enum(["ok", "damaged", "returned"]).default("ok"),
		notes: z.string().max(500).optional(),
		recordedAt: z.string().datetime(),
		recordedBy: ObjectIdSchema,
	})
	.strict();
export type ExecutionEquipmentUsage = z.infer<typeof ExecutionEquipmentUsageSchema>;

export const EquipmentUsageSchema = ExecutionEquipmentUsageSchema;
export type EquipmentUsage = ExecutionEquipmentUsage;
