import { z } from "zod";

export const RuleConditionOperatorSchema = z.enum([
	"equal",
	"notEqual",
	"lessThan",
	"lessThanInclusive",
	"greaterThan",
	"greaterThanInclusive",
	"in",
	"notIn",
	"contains",
	"doesNotContain",
]);

export type RuleConditionOperator = z.infer<typeof RuleConditionOperatorSchema>;

export const RuleConditionSchema = z
	.object({
		fact: z.string().min(1).max(100),
		operator: RuleConditionOperatorSchema,
		value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
	})
	.strict();

export type RuleCondition = z.infer<typeof RuleConditionSchema>;

export const RuleActionTypeSchema = z.enum([
	"notify",
	"block_transition",
	"create_task",
	"request_evidence",
	"send_email",
	"update_field",
]);

export type RuleActionType = z.infer<typeof RuleActionTypeSchema>;

export const RuleActionSchema = z
	.object({
		type: RuleActionTypeSchema,
		config: z.record(z.string(), z.unknown()).default({}),
	})
	.strict();

export type RuleAction = z.infer<typeof RuleActionSchema>;

export const AutomationRuleSchema = z
	.object({
		_id: z.string().optional(),
		name: z.string().min(1).max(200),
		description: z.string().max(1000).optional(),
		module: z.string().min(1).max(80),
		event: z.string().min(1).max(80),
		conditions: z.array(RuleConditionSchema).min(1),
		actions: z.array(RuleActionSchema).min(1),
		isActive: z.boolean().default(true),
		priority: z.number().int().min(0).max(100).default(50),
		createdBy: z.string(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type AutomationRule = z.infer<typeof AutomationRuleSchema>;

export const CreateAutomationRuleSchema = AutomationRuleSchema.omit({
	_id: true,
	createdAt: true,
	updatedAt: true,
});

export type CreateAutomationRuleInput = z.infer<typeof CreateAutomationRuleSchema>;
