import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const EPPTypeSchema = z.enum([
	"casco",
	"arnes",
	"gafas",
	"guantes",
	"tapones",
	"respirador",
	"botas",
	"overol",
	"otros",
]);
export type EPPType = z.infer<typeof EPPTypeSchema>;

export const EPPSchema = z
	.object({
		_id: ObjectIdSchema.optional(),
		name: z.string().min(1).max(200),
		type: EPPTypeSchema,
		size: z.string().max(20).optional(),
		brand: z.string().max(100).optional(),
		certification: z.string().max(200).optional(),
		expirationDate: z.string().datetime().optional(),
		stock: z.number().int().nonnegative().default(0),
		minStock: z.number().int().nonnegative().default(0),
		notes: z.string().max(500).optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type EPP = z.infer<typeof EPPSchema>;
export const CreateEPPSchema = EPPSchema.omit({ _id: true, createdAt: true, updatedAt: true });
export type CreateEPP = z.infer<typeof CreateEPPSchema>;
