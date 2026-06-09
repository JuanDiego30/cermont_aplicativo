import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const ClientStatusSchema = z.enum(["active", "inactive", "suspended"]);
export type ClientStatus = z.infer<typeof ClientStatusSchema>;

export const ClientSchema = z
	.object({
		_id: ObjectIdSchema.optional(),
		name: z.string().min(1).max(200),
		nit: z.string().min(1).max(50),
		address: z.string().max(300).optional(),
		contactName: z.string().max(200).optional(),
		email: z.string().email().optional(),
		phone: z.string().max(20).optional(),
		status: ClientStatusSchema.default("active"),
		notes: z.string().max(500).optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type Client = z.infer<typeof ClientSchema>;

export const CreateClientSchema = ClientSchema.omit({
	_id: true,
	createdAt: true,
	updatedAt: true,
});
export type CreateClient = z.infer<typeof CreateClientSchema>;
