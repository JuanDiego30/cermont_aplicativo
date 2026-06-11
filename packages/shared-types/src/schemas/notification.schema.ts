import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";
import { UserRoleSchema } from "./user.schema";

// ─── Notification Types ──────────────────────────────────────────────────────

export const NotificationTypeSchema = z.enum([
	"STATE_TRANSITION",
	"APPROVAL_REQUIRED",
	"DOCUMENT_UPLOADED",
	"SYNC_FAILED",
	"COMMENT_ADDED",
	"DEADLINE_WARNING",
	"PAYMENT_RECEIVED",
	"CERTIFICATION_EXPIRING",
	"MAINTENANCE_DUE",
	"WORK_ORDER_ASSIGNED",
	"PROPOSAL_STATUS",
	"SES_STATUS",
	"INVOICE_STATUS",
	"PAYMENT_OVERDUE",
	"EXECUTION_STARTED",
	"EVIDENCE_VERIFIED",
	"REPORT_APPROVED",
	"SYSTEM_ALERT",
]);

export type NotificationType = z.infer<typeof NotificationTypeSchema>;

// ─── Notification Priority ──────────────────────────────────────────────────

export const NotificationPrioritySchema = z.enum(["low", "medium", "high", "critical"]);
export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;

// ─── Channel Types ──────────────────────────────────────────────────────────

export const NotificationChannelSchema = z.enum(["in_app", "email", "sms"]);
export type NotificationChannel = z.infer<typeof NotificationChannelSchema>;

export const NotificationChannelStatusSchema = z.enum([
	"pending",
	"sent",
	"delivered",
	"failed",
	"read",
]);
export type NotificationChannelStatus = z.infer<typeof NotificationChannelStatusSchema>;

/**
 * Per-channel delivery status
 */
export const NotificationDeliverySchema = z
	.object({
		channel: NotificationChannelSchema,
		status: NotificationChannelStatusSchema,
		sentAt: z.string().datetime().optional(),
		deliveredAt: z.string().datetime().optional(),
		readAt: z.string().datetime().optional(),
		error: z.string().max(500).optional(),
		retryCount: z.number().int().min(0).default(0),
		lastRetryAt: z.string().datetime().optional(),
	})
	.strict();

export type NotificationDelivery = z.infer<typeof NotificationDeliverySchema>;

// ─── Template Variables ─────────────────────────────────────────────────────

export const NotificationTemplateVariableSchema = z
	.record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
	.default({});

export type NotificationTemplateVariable = z.infer<typeof NotificationTemplateVariableSchema>;

// ─── Main Notification Schema ───────────────────────────────────────────────

export const NotificationSchema = z
	.object({
		id: ObjectIdSchema.optional(),
		notificationId: z.string(),
		recipientUserId: ObjectIdSchema,
		recipientRole: UserRoleSchema.optional(),
		recipientEmail: z.email().optional(),
		recipientPhone: z.string().max(30).optional(),
		type: NotificationTypeSchema,
		priority: NotificationPrioritySchema.default("medium"),
		title: z.string().min(1).max(200),
		body: z.string().min(1).max(1000),
		relatedEntity: z
			.object({
				entityType: z.string(),
				entityId: ObjectIdSchema,
			})
			.optional(),
		// Multi-channel delivery tracking
		channels: z.array(NotificationDeliverySchema).default([]),
		// Template for rendering
		templateName: z.string().max(100).optional(),
		templateVariables: NotificationTemplateVariableSchema.optional(),
		// Read tracking
		isRead: z.boolean().default(false),
		readAt: z.coerce.date().optional(),
		// Scheduling
		scheduledAt: z.coerce.date().optional(),
		expiresAt: z.coerce.date().optional(),
		// Metadata
		metadata: z.record(z.string(), z.unknown()).optional(),
		createdAt: z.coerce.date(),
	})
	.strict();

export type Notification = z.infer<typeof NotificationSchema>;

// ─── Input Schemas ──────────────────────────────────────────────────────────

export const CreateNotificationSchema = z
	.object({
		recipientUserId: ObjectIdSchema,
		recipientRole: UserRoleSchema.optional(),
		recipientEmail: z.email().optional(),
		recipientPhone: z.string().max(30).optional(),
		type: NotificationTypeSchema,
		priority: NotificationPrioritySchema.default("medium"),
		title: z.string().min(1).max(200),
		body: z.string().min(1).max(1000),
		relatedEntity: z
			.object({
				entityType: z.string(),
				entityId: ObjectIdSchema,
			})
			.optional(),
		channels: z.array(NotificationChannelSchema).default(["in_app"]),
		templateName: z.string().max(100).optional(),
		templateVariables: NotificationTemplateVariableSchema.optional(),
		scheduledAt: z.coerce.date().optional(),
		expiresAt: z.coerce.date().optional(),
		clientMutationId: z.string().uuid().optional(),
	})
	.strict();

export type CreateNotificationInput = z.infer<typeof CreateNotificationSchema>;

export const MarkNotificationReadSchema = z
	.object({
		channel: NotificationChannelSchema.optional(),
	})
	.strict();

export type MarkNotificationReadInput = z.infer<typeof MarkNotificationReadSchema>;

export const NotificationIdParamsSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export type NotificationIdParams = z.infer<typeof NotificationIdParamsSchema>;

export const ListNotificationsQuerySchema = z
	.object({
		type: NotificationTypeSchema.optional(),
		priority: NotificationPrioritySchema.optional(),
		isRead: z.coerce.boolean().optional(),
		dateFrom: z.coerce.date().optional(),
		dateTo: z.coerce.date().optional(),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
	})
	.strip();

export type ListNotificationsQuery = z.infer<typeof ListNotificationsQuerySchema>;

// ─── Template definitions ───────────────────────────────────────────────────

export const NotificationTemplateSchema = z
	.object({
		name: z.string().min(1).max(100),
		titleTemplate: z.string().min(1),
		bodyTemplate: z.string().min(1),
		emailSubjectTemplate: z.string().optional(),
		emailBodyTemplate: z.string().optional(),
		smsTemplate: z.string().optional(),
		channels: z.array(NotificationChannelSchema).default(["in_app"]),
		priority: NotificationPrioritySchema.default("medium"),
	})
	.strict();

export type NotificationTemplate = z.infer<typeof NotificationTemplateSchema>;
