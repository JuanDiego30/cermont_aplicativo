import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

/**
 * Notification Preference Schema — Per-user notification channel and type preferences
 *
 * Allows users to configure which notification types they receive and through which channels.
 */

export const PrefChannelSchema = z.enum(["in_app", "email", "sms"]);
export type PrefChannel = z.infer<typeof PrefChannelSchema>;

export const NotificationPrefTypeSchema = z.enum([
	"state_transition",
	"approval_required",
	"document_upload",
	"deadline_warning",
	"payment",
	"system_alert",
]);
export type NotificationPrefType = z.infer<typeof NotificationPrefTypeSchema>;

export const NotificationTypePreferenceSchema = z
	.object({
		type: NotificationPrefTypeSchema,
		enabled: z.boolean().default(true),
		channels: z.array(PrefChannelSchema).min(1),
	})
	.strict();

export type NotificationTypePreference = z.infer<typeof NotificationTypePreferenceSchema>;

export const UserNotificationPreferencesSchema = z
	.object({
		userId: ObjectIdSchema,
		quietHoursEnabled: z.boolean().default(false),
		quietHoursStart: z.string().optional(), // HH:mm format
		quietHoursEnd: z.string().optional(), // HH:mm format
		pushEnabled: z.boolean().default(true),
		emailDigest: z.enum(["instant", "daily", "weekly", "never"]).default("instant"),
		typePreferences: z.array(NotificationTypePreferenceSchema).default([]),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type UserNotificationPreferences = z.infer<typeof UserNotificationPreferencesSchema>;

export const UpdateNotificationPreferencesSchema = z
	.object({
		quietHoursEnabled: z.boolean().optional(),
		quietHoursStart: z.string().optional(),
		quietHoursEnd: z.string().optional(),
		pushEnabled: z.boolean().optional(),
		emailDigest: z.enum(["instant", "daily", "weekly", "never"]).optional(),
		typePreferences: z.array(NotificationTypePreferenceSchema).optional(),
	})
	.strict();

export type UpdateNotificationPreferences = z.infer<typeof UpdateNotificationPreferencesSchema>;
