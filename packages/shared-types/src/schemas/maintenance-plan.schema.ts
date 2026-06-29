import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

// ─── Maintenance Plan ────────────────────────────────────────────────────────

export const MaintenancePlanTypeEnum = z.enum([
	"preventive",
	"corrective",
	"predictive",
	"inspection",
]);

export const MaintenancePlanIntervalTypeEnum = z.enum([
	"by_date",
	"by_hours",
	"by_kilometers",
	"by_usage_count",
	"by_certificate_expiry",
	"manual",
]);

export const MaintenancePlanRuleSchema = z.object({
	ruleId: z.string().min(1),
	type: MaintenancePlanIntervalTypeEnum,
	value: z.number().positive(),
	unit: z.string(),
	gracePeriod: z.number().nonnegative().optional().default(0),
});

export const MaintenancePlanSchema = z.object({
	_id: ObjectIdSchema,
	assetId: ObjectIdSchema,
	title: z.string().min(1),
	description: z.string().optional(),
	type: MaintenancePlanTypeEnum,
	rules: z.array(MaintenancePlanRuleSchema),
	lastExecutedAt: z.string().datetime().optional(),
	nextExecutionAt: z.string().datetime().optional(),
	isActive: z.boolean().default(true),
	createdBy: ObjectIdSchema,
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});

export type MaintenancePlan = z.infer<typeof MaintenancePlanSchema>;

// ─── Maintenance Reminder ─────────────────────────────────────────────────────

export const MaintenanceReminderStatusEnum = z.enum([
	"upcoming",
	"due_soon",
	"overdue",
	"dismissed",
	"resolved",
]);

export const MaintenanceReminderSchema = z.object({
	_id: ObjectIdSchema,
	assetId: ObjectIdSchema,
	planId: ObjectIdSchema.optional(),
	title: z.string().min(1),
	message: z.string(),
	dueDate: z.string().datetime(),
	status: MaintenanceReminderStatusEnum,
	priority: z.enum(["low", "medium", "high", "critical"]),
	notifiedAt: z.string().datetime().optional(),
	resolvedAt: z.string().datetime().optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
	createdAt: z.string().datetime(),
});

export type MaintenanceReminder = z.infer<typeof MaintenanceReminderSchema>;

// ─── Input Schemas ───────────────────────────────────────────────────────────

export const CreateMaintenancePlanSchema = z.object({
	assetId: z.string().min(1),
	title: z.string().min(1),
	description: z.string().optional(),
	type: MaintenancePlanTypeEnum,
	rules: z.array(MaintenancePlanRuleSchema),
});

export type CreateMaintenancePlanInput = z.infer<typeof CreateMaintenancePlanSchema>;

export const ResolveMaintenanceReminderSchema = z.object({
	resolutionNotes: z.string().min(1),
	resolvedBy: z.string().optional(),
});

// ─── Maintenance Schedule ──────────────────────────────────────────────────────

export const ScheduleFrequencyEnum = z.enum([
	"daily",
	"weekly",
	"monthly",
	"quarterly",
	"yearly",
]);

export const CreateMaintenanceScheduleSchema = z.object({
	assetId: z.string().min(1),
	title: z.string().min(1),
	description: z.string().optional(),
	frequency: ScheduleFrequencyEnum,
	startDate: z.string().min(1),
	endDate: z.string().optional(),
	assignedTo: z.string().optional(),
});

export type CreateMaintenanceScheduleInput = z.infer<typeof CreateMaintenanceScheduleSchema>;

export const UpdateMaintenanceScheduleSchema = CreateMaintenanceScheduleSchema.partial();

export type UpdateMaintenanceScheduleInput = z.infer<typeof UpdateMaintenanceScheduleSchema>;

// ─── Maintenance Log ───────────────────────────────────────────────────────────

export const MaintenanceLogStatusEnum = z.enum(["completed", "partial", "failed"]);

export const CreateMaintenanceLogSchema = z.object({
	assetId: z.string().min(1),
	scheduleId: z.string().optional(),
	title: z.string().min(1),
	description: z.string().optional(),
	performedAt: z.string().min(1),
	status: MaintenanceLogStatusEnum,
	notes: z.string().optional(),
	cost: z.number().nonnegative().optional(),
});

export type CreateMaintenanceLogInput = z.infer<typeof CreateMaintenanceLogSchema>;
