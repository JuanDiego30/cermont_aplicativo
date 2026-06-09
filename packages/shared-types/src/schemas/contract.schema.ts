import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const ContractStatusSchema = z.enum([
	"draft",
	"active",
	"suspended",
	"completed",
	"cancelled",
]);
export type ContractStatus = z.infer<typeof ContractStatusSchema>;

export const ContractSchema = z
	.object({
		_id: ObjectIdSchema.optional(),
		code: z.string().min(1).max(50),
		clientId: ObjectIdSchema,
		name: z.string().min(1).max(200),
		description: z.string().max(500).optional(),
		startDate: z.string().datetime(),
		endDate: z.string().datetime(),
		amount: z.number().nonnegative().optional(),
		status: ContractStatusSchema.default("draft"),
		documents: z.array(ObjectIdSchema).default([]),
		notes: z.string().max(500).optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();
export type Contract = z.infer<typeof ContractSchema>;
