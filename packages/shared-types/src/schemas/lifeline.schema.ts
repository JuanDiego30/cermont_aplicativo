import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const LifelineTypeSchema = z.enum(["vertical", "horizontal", "portatil"]);
export type LifelineType = z.infer<typeof LifelineTypeSchema>;

export const LifelineSchema = z
	.object({
		_id: ObjectIdSchema.optional(),
		type: LifelineTypeSchema,
		location: z.string().min(1).max(300),
		clientId: ObjectIdSchema.optional(),
		siteId: ObjectIdSchema.optional(),
		installationDate: z.string().datetime().optional(),
		lastInspectionDate: z.string().datetime().optional(),
		nextInspectionDate: z.string().datetime().optional(),
		cableType: z.string().max(100).optional(),
		cableDiameter: z.number().positive().optional(),
		cableLength: z.number().positive().optional(),
		manufacturer: z.string().max(200).optional(),
		certification: z.string().max(200).optional(),
		notes: z.string().max(500).optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type Lifeline = z.infer<typeof LifelineSchema>;
export const CreateLifelineSchema = LifelineSchema.omit({
	_id: true,
	createdAt: true,
	updatedAt: true,
});
export type CreateLifeline = z.infer<typeof CreateLifelineSchema>;
