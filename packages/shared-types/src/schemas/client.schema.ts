import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const ClientStatusSchema = z.enum(["active", "inactive", "suspended"]);
export type ClientStatus = z.infer<typeof ClientStatusSchema>;

export const ClientContractSchema = z
	.object({
		contractNumber: z.string().min(1).max(60),
		startDate: z.string().datetime().optional(),
		endDate: z.string().datetime().optional(),
		value: z.number().nonnegative().optional(),
		status: z.enum(["active", "expired", "terminated"]).default("active"),
	})
	.strict();
export type ClientContract = z.infer<typeof ClientContractSchema>;

export const ClientSchema = z
	.object({
		_id: ObjectIdSchema.optional(),
		name: z.string().min(1).max(200),
		nit: z.string().min(1).max(50),
		address: z.string().max(300).optional(),
		city: z.string().max(120).optional(),
		industry: z.string().max(120).optional(),
		contactName: z.string().max(200).optional(),
		email: z.email().optional(),
		phone: z.string().max(20).optional(),
		contracts: z.array(ClientContractSchema).default([]),
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

export const UpdateClientSchema = CreateClientSchema.partial();
export type UpdateClient = z.infer<typeof UpdateClientSchema>;

export const ClientIdParamsSchema = z.object({ id: ObjectIdSchema }).strict();

export const ListClientsQuerySchema = z
	.object({
		page: z.coerce.number().int().positive().default(1),
		limit: z.coerce.number().int().positive().max(100).default(20),
		status: ClientStatusSchema.optional(),
		search: z.string().max(200).optional(),
	})
	.strict();
export type ListClientsQuery = z.infer<typeof ListClientsQuerySchema>;
