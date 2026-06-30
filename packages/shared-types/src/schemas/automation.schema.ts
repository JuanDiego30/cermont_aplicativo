import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";
import { NotificationPrioritySchema } from "./notification.schema";
import { UserRoleSchema } from "./user.schema";

export const AutomationEventTypeSchema = z.enum([
	"evidence_rejected",
	"vehicle_document_expiring",
	"tool_certificate_expiring",
	"cost_threshold_exceeded",
	"critical_checklist_failed",
	"ses_approved",
	"invoice_overdue",
]);
export type AutomationEventType = z.infer<typeof AutomationEventTypeSchema>;

export const AutomationActionTypeSchema = z.enum([
	"notify",
	"create_task",
	"block_transition",
	"return_to_execution",
	"request_evidence",
	"flag_risk",
]);
export type AutomationActionType = z.infer<typeof AutomationActionTypeSchema>;
export const AutomationOperationalActionTypeSchema = AutomationActionTypeSchema.exclude(["notify"]);

const NotifyActionSchema = z.object({
	type: z.literal("notify"),
	recipientRoles: z.array(UserRoleSchema).min(1),
	priority: NotificationPrioritySchema,
	title: z.string().trim().min(1).max(200),
	body: z.string().trim().min(1).max(1000),
});

const AssignedActionSchema = z.object({
	type: z.literal("create_task"),
	assignedRole: UserRoleSchema,
	title: z.string().trim().min(1).max(200),
	reason: z.string().trim().min(1).max(1000),
	dueHours: z.number().int().min(1).max(720),
});

const BlockingActionSchema = z.object({
	type: z.enum(["block_transition", "return_to_execution", "request_evidence"]),
	reason: z.string().trim().min(1).max(1000),
});

const RiskActionSchema = z.object({
	type: z.literal("flag_risk"),
	riskLevel: z.enum(["medium", "high", "critical"]),
	label: z.string().trim().min(1).max(200),
});

export const AutomationActionSchema = z.discriminatedUnion("type", [
	NotifyActionSchema,
	AssignedActionSchema,
	BlockingActionSchema,
	RiskActionSchema,
]);
export type AutomationAction = z.infer<typeof AutomationActionSchema>;

export const AutomationRuleSchema = z.object({
	_id: ObjectIdSchema,
	name: z.string().trim().min(3).max(120),
	description: z.string().trim().min(1).max(500),
	eventType: AutomationEventTypeSchema,
	actions: z.array(AutomationActionSchema).min(1).max(12),
	enabled: z.boolean(),
	version: z.number().int().min(1),
	createdBy: ObjectIdSchema,
	updatedBy: ObjectIdSchema,
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});
export type AutomationRule = z.infer<typeof AutomationRuleSchema>;

export const CreateAutomationRuleSchema = AutomationRuleSchema.omit({
	_id: true,
	version: true,
	createdBy: true,
	updatedBy: true,
	createdAt: true,
	updatedAt: true,
});
export type CreateAutomationRuleInput = z.infer<typeof CreateAutomationRuleSchema>;

export const UpdateAutomationRuleSchema = CreateAutomationRuleSchema.partial()
	.strict()
	.refine((input) => Object.keys(input).length > 0, {
		message: "At least one automation rule field is required",
	});
export type UpdateAutomationRuleInput = z.infer<typeof UpdateAutomationRuleSchema>;

export const AutomationRuleIdSchema = z.object({ id: ObjectIdSchema }).strict();

export const ListAutomationRulesQuerySchema = z
	.object({
		eventType: AutomationEventTypeSchema.optional(),
		enabled: z.coerce.boolean().optional(),
	})
	.strict();
export type ListAutomationRulesQuery = z.infer<typeof ListAutomationRulesQuerySchema>;

export const AutomationOperationalActionSchema = z.object({
	_id: ObjectIdSchema,
	ruleId: ObjectIdSchema,
	executionId: ObjectIdSchema,
	entityType: z.string().trim().min(1).max(80),
	entityId: z.string().trim().min(1).max(128),
	type: AutomationOperationalActionTypeSchema,
	title: z.string().trim().min(1).max(200),
	reason: z.string().trim().min(1).max(1000),
	priority: z.enum(["medium", "high", "critical"]),
	status: z.enum(["open", "resolved"]),
	assignedRole: UserRoleSchema.optional(),
	dueAt: z.string().datetime().optional(),
	createdAt: z.string().datetime(),
	resolvedAt: z.string().datetime().optional(),
	resolvedBy: ObjectIdSchema.optional(),
});
export type AutomationOperationalAction = z.infer<typeof AutomationOperationalActionSchema>;

export const ListAutomationOperationalActionsQuerySchema = z
	.object({
		status: z.enum(["open", "resolved"]).optional(),
		assignedRole: UserRoleSchema.optional(),
		entityType: z.string().trim().min(1).max(80).optional(),
		entityId: z.string().trim().min(1).max(128).optional(),
		type: AutomationOperationalActionTypeSchema.optional(),
		limit: z.coerce.number().int().min(1).max(100).default(50),
	})
	.strict();
export type ListAutomationOperationalActionsQuery = z.infer<
	typeof ListAutomationOperationalActionsQuerySchema
>;

export const ResolveAutomationOperationalActionParamsSchema = z
	.object({ id: ObjectIdSchema })
	.strict();
