import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const MaterialCategorySchema = z.enum([
	"electrico",
	"electronico",
	"estructura",
	"ferreteria",
	"tuberia",
	"seguridad",
	"general",
]);
export type MaterialCategory = z.infer<typeof MaterialCategorySchema>;

export const MaterialSchema = z
	.object({
		_id: ObjectIdSchema.optional(),
		name: z.string().min(1).max(200),
		category: MaterialCategorySchema,
		unit: z.string().min(1).max(30),
		unitCost: z.number().nonnegative().optional(),
		stock: z.number().int().nonnegative().default(0),
		minStock: z.number().int().nonnegative().default(0),
		notes: z.string().max(500).optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type Material = z.infer<typeof MaterialSchema>;
export const CreateMaterialSchema = MaterialSchema.omit({
	_id: true,
	createdAt: true,
	updatedAt: true,
});
export type CreateMaterial = z.infer<typeof CreateMaterialSchema>;
