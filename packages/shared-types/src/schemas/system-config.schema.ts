import { z } from "zod";
import { NotificationChannelSchema } from "./notification.schema";
import { UserRoleSchema } from "./user.schema";

export const FeatureFlagCategorySchema = z.enum([
	"general",
	"billing",
	"field",
	"notifications",
	"security",
	"experimental",
]);

export const FeatureFlagSchema = z
	.object({
		key: z.string().regex(/^[a-z][a-z0-9_]{2,79}$/),
		label: z.string().trim().min(1).max(100),
		description: z.string().trim().max(300),
		enabled: z.boolean(),
		category: FeatureFlagCategorySchema,
	})
	.strict();

export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;

export const ReminderTypeSchema = z.enum([
	"certification_expiring",
	"maintenance_due",
	"payment_overdue",
	"sla_breach_warning",
	"invoice_due",
	"stale_case",
]);

export type ReminderType = z.infer<typeof ReminderTypeSchema>;

export const ReminderScheduleModeSchema = z.enum([
	"days_before",
	"days_after",
	"hours_before",
	"inactivity_days",
]);

const REMINDER_SCHEDULE_BY_TYPE = {
	certification_expiring: "days_before",
	maintenance_due: "days_before",
	payment_overdue: "days_after",
	sla_breach_warning: "hours_before",
	invoice_due: "days_before",
	stale_case: "inactivity_days",
} as const;

export const ReminderRuleSchema = z
	.object({
		type: ReminderTypeSchema,
		enabled: z.boolean(),
		scheduleMode: ReminderScheduleModeSchema,
		thresholds: z.array(z.number().int().min(1).max(365)).min(1).max(12),
		channels: z.array(NotificationChannelSchema).min(1),
		recipientRoles: z.array(UserRoleSchema).min(1),
	})
	.strict()
	.superRefine((rule, context) => {
		if (new Set(rule.thresholds).size !== rule.thresholds.length) {
			context.addIssue({
				code: "custom",
				path: ["thresholds"],
				message: "Reminder thresholds must be unique",
			});
		}
		if (rule.scheduleMode !== REMINDER_SCHEDULE_BY_TYPE[rule.type]) {
			context.addIssue({
				code: "custom",
				path: ["scheduleMode"],
				message: "Reminder schedule mode does not match its type",
			});
		}
	});

export type ReminderRule = z.infer<typeof ReminderRuleSchema>;

export const SystemConfigSchema = z
	.object({
		featureFlags: z.array(FeatureFlagSchema),
		maintenanceMode: z.boolean(),
		maintenanceMessage: z.string().max(500),
		maxUploadSizeMb: z.number().int().min(1).max(100),
		sessionTimeoutMinutes: z.number().int().min(30).max(1440),
		defaultLanguage: z.enum(["es"]),
		allowedFileTypes: z
			.array(z.string().regex(/^[a-z0-9]+$/))
			.min(1)
			.max(30),
		reminderWorkerEnabled: z.boolean(),
		reminderWorkerIntervalMinutes: z.number().int().min(1).max(1440),
		reminderRules: z.array(ReminderRuleSchema),
	})
	.strict();

export type SystemConfig = z.infer<typeof SystemConfigSchema>;

export const FeatureFlagKeyParamsSchema = z
	.object({
		key: z.string().regex(/^[a-z][a-z0-9_]{2,79}$/),
	})
	.strict();

export const ToggleFeatureFlagSchema = z
	.object({
		enabled: z.boolean(),
	})
	.strict();

export const UpdateSystemSettingsSchema = SystemConfigSchema.omit({
	featureFlags: true,
})
	.partial()
	.strict()
	.refine((settings) => Object.keys(settings).length > 0, {
		message: "At least one setting is required",
	});

export type UpdateSystemSettings = z.infer<typeof UpdateSystemSettingsSchema>;
