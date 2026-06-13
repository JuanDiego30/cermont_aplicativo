import { z } from "zod";
import { AUDIT_ACTIONS } from "../constants/audit-actions";
import { ObjectIdSchema } from "./common.schema";

export type AuditJsonValue =
	| string
	| number
	| boolean
	| AuditJsonValue[]
	| { [key: string]: AuditJsonValue };

export const AuditJsonValueSchema: z.ZodType<AuditJsonValue> = z.lazy(() =>
	z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.array(AuditJsonValueSchema),
		z.record(z.string(), AuditJsonValueSchema),
	]),
);

export const AuditLogIdSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export const AuditEntityIdSchema = z
	.string()
	.min(1)
	.max(128)
	.trim()
	.regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/);

export const AuditLogsQuerySchema = z
	.object({
		userId: ObjectIdSchema.optional(),
		user_id: ObjectIdSchema.optional(),
		entity: z.string().min(1).max(100).trim().optional(),
		model_name: z.string().min(1).max(100).trim().optional(),
		entityId: AuditEntityIdSchema.optional(),
		action: z.enum(AUDIT_ACTIONS).optional(),
		requestId: z
			.string()
			.min(1)
			.max(128)
			.regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/)
			.optional(),
		from: z.string().datetime({ offset: true }).optional(),
		to: z.string().datetime({ offset: true }).optional(),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(50),
	})
	.strict()
	.superRefine((query, context) => {
		if (query.from && query.to && Date.parse(query.from) > Date.parse(query.to)) {
			context.addIssue({
				code: "custom",
				path: ["to"],
				message: "to must be greater than or equal to from",
			});
		}
	});

export const AuditLogRecordSchema = z
	.object({
		_id: ObjectIdSchema,
		entityType: z.string().min(1),
		entityId: AuditEntityIdSchema,
		action: z.enum(AUDIT_ACTIONS),
		userId: ObjectIdSchema,
		userEmail: z.string().min(1),
		changes: z
			.object({
				before: AuditJsonValueSchema.optional(),
				after: AuditJsonValueSchema.optional(),
			})
			.strict()
			.optional(),
		metadata: AuditJsonValueSchema.optional(),
		requestId: z.string().min(1).max(128).optional(),
		ipAddress: z.string().min(1).optional(),
		userAgent: z.string().min(1).optional(),
		status: z.enum(["success", "failure"]),
		errorMessage: z.string().optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime().optional(),
	})
	.strict();

export type AuditLogId = z.infer<typeof AuditLogIdSchema>;
export type AuditLogsQuery = z.infer<typeof AuditLogsQuerySchema>;
export type AuditLogRecord = z.infer<typeof AuditLogRecordSchema>;
