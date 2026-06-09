import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const SiteSchema = z
	.object({
		_id: ObjectIdSchema.optional(),
		name: z.string().min(1).max(200),
		clientId: ObjectIdSchema,
		address: z.string().max(300).optional(),
		city: z.string().max(100).optional(),
		coordinates: z
			.object({
				lat: z.number().min(-90).max(90),
				lng: z.number().min(-180).max(180),
			})
			.optional(),
		contactName: z.string().max(200).optional(),
		contactPhone: z.string().max(20).optional(),
		notes: z.string().max(500).optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type Site = z.infer<typeof SiteSchema>;

export const CreateSiteSchema = SiteSchema.omit({ _id: true, createdAt: true, updatedAt: true });
export type CreateSite = z.infer<typeof CreateSiteSchema>;
