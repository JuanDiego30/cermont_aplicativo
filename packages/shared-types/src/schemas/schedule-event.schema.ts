import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const ScheduleEventStatusSchema = z.enum([
	"scheduled",
	"in_progress",
	"completed",
	"cancelled",
]);
export type ScheduleEventStatus = z.infer<typeof ScheduleEventStatusSchema>;

export const ScheduleEventSchema = z
	.object({
		_id: ObjectIdSchema.optional(),
		title: z.string().min(1).max(200),
		resourceType: z.enum(["personal", "equipo", "vehiculo", "herramienta"]),
		resourceId: ObjectIdSchema,
		resourceName: z.string().max(200).optional(),
		orderId: ObjectIdSchema.optional(),
		startDate: z.string().datetime(),
		endDate: z.string().datetime(),
		status: ScheduleEventStatusSchema.default("scheduled"),
		notes: z.string().max(500).optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();
export type ScheduleEvent = z.infer<typeof ScheduleEventSchema>;
