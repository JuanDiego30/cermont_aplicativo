import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const AuditLogIdSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export const AuditLogsQuerySchema = z
	.object({
		user_id: ObjectIdSchema.optional(),
		model_name: z.string().min(1).max(100).trim().optional(),
		action: z.string().min(1).max(100).trim().optional(),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(50),
	})
	.strict();

export type AuditLogId = z.infer<typeof AuditLogIdSchema>;
export type AuditLogsQuery = z.infer<typeof AuditLogsQuerySchema>;
