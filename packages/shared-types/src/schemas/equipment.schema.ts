import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const EquipmentCategorySchema = z.enum([
	"medicion",
	"seguridad",
	"comunicacion",
	"electrico",
	"construccion",
	"cctv",
	"general",
]);
export type EquipmentCategory = z.infer<typeof EquipmentCategorySchema>;

export const EquipmentStatusSchema = z.enum(["available", "in_use", "maintenance", "retired"]);
export type EquipmentStatus = z.infer<typeof EquipmentStatusSchema>;

export const MasterDataEquipmentSchema = z
	.object({
		_id: ObjectIdSchema.optional(),
		name: z.string().min(1).max(200),
		category: EquipmentCategorySchema,
		brand: z.string().max(100).optional(),
		model: z.string().max(100).optional(),
		serialNumber: z.string().max(100).optional(),
		status: EquipmentStatusSchema.default("available"),
		lastCalibrationDate: z.string().datetime().optional(),
		nextCalibrationDate: z.string().datetime().optional(),
		clientId: ObjectIdSchema.optional(),
		siteId: ObjectIdSchema.optional(),
		notes: z.string().max(500).optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type MasterDataEquipment = z.infer<typeof MasterDataEquipmentSchema>;
export const CreateMasterDataEquipmentSchema = MasterDataEquipmentSchema.omit({
	_id: true,
	createdAt: true,
	updatedAt: true,
});
export type CreateMasterDataEquipment = z.infer<typeof CreateMasterDataEquipmentSchema>;
