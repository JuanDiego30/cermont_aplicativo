import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";
import { UserRoleSchema } from "./user.schema";

export const NotificationTypeSchema = z.enum([
	"STATE_TRANSITION",
	"APPROVAL_REQUIRED",
	"DOCUMENT_UPLOADED",
	"SYNC_FAILED",
	"COMMENT_ADDED",
	"DEADLINE_WARNING",
	"PAYMENT_RECEIVED",
]);

export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const NotificationSchema = z.object({
	id: ObjectIdSchema.optional(),
	notificationId: z.string(),
	recipientUserId: ObjectIdSchema,
	recipientRole: UserRoleSchema.optional(),
	type: NotificationTypeSchema,
	title: z.string().min(1).max(200),
	body: z.string().min(1).max(1000),
	relatedEntity: z.object({
		entityType: z.string(),
		entityId: ObjectIdSchema,
	}),
	isRead: z.boolean().default(false),
	readAt: z.coerce.date().optional(),
	createdAt: z.coerce.date(),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

export type Notification = z.infer<typeof NotificationSchema>;

export const NotificationIdParamsSchema = z.object({
	id: ObjectIdSchema,
});

export type NotificationIdParams = z.infer<typeof NotificationIdParamsSchema>;
