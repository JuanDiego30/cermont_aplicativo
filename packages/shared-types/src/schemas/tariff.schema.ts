import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";
import { UserRoleSchema } from "./user.schema";

export const TariffSchema = z.object({
	_id: ObjectIdSchema,
	role: UserRoleSchema,
	hourlyRateCOP: z.number().nonnegative(),
	overtimeMultiplier: z.number().min(1).default(1.5),
	effectiveFrom: z.string().datetime(),
	createdBy: ObjectIdSchema.optional(),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});
export type Tariff = z.infer<typeof TariffSchema>;

export const CreateTariffSchema = z
	.object({
		role: UserRoleSchema,
		hourlyRateCOP: z.number().positive(),
		overtimeMultiplier: z.number().min(1).default(1.5),
		effectiveFrom: z.string().datetime().optional(),
	})
	.strict();
export type CreateTariffInput = z.infer<typeof CreateTariffSchema>;

export const UpdateTariffSchema = CreateTariffSchema.partial();
export type UpdateTariffInput = z.infer<typeof UpdateTariffSchema>;

export const TariffIdSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();
export type TariffIdParams = z.infer<typeof TariffIdSchema>;
