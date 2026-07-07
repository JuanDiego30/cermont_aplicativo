import type {
	AutomationAction,
	AutomationEventType,
	AutomationOperationalAction as AutomationOperationalActionSnapshot,
	AutomationRule as AutomationRuleSnapshot,
	CreateAutomationRuleInput,
	ListAutomationOperationalActionsQuery,
	ListAutomationRulesQuery,
	UpdateAutomationRuleInput,
	UserRole,
} from "@cermont/shared-types";
import { Engine } from "json-rules-engine";
import { Types } from "mongoose";
import { NotFoundError, UnprocessableError } from "../../common/errors/AppError";
import { createLogger } from "../../common/utils/logger";
import {
	AutomationExecution,
	AutomationOperationalAction,
	AutomationRule,
	User,
} from "../../models";
import type { IAutomationOperationalActionDocument } from "../../models/AutomationOperationalAction";
import type { IAutomationRuleDocument } from "../../models/AutomationRule";
import { createAuditLog } from "../audit/audit.service";
import { createNotification } from "../notifications/notification.service";

const log = createLogger("automation-service");

export interface AutomationBusinessEvent {
	eventId: string;
	eventType: AutomationEventType;
	entityType: string;
	entityId: string;
	actorId: string;
}

export interface AutomationExecutionSummary {
	matchedRules: number;
	executedRules: number;
	skippedRules: number;
}

type AutomationActionResult = {
	actionType: AutomationAction["type"];
	status: "succeeded" | "failed";
	message: string;
};

type NotificationRecipient = {
	_id: Types.ObjectId;
	role: UserRole;
};

function formatAutomationRule(rule: IAutomationRuleDocument): AutomationRuleSnapshot {
	return {
		_id: rule._id.toString(),
		name: rule.name,
		description: rule.description,
		eventType: rule.eventType,
		actions: rule.actions,
		enabled: rule.enabled,
		version: rule.version,
		createdBy: rule.createdBy.toString(),
		updatedBy: rule.updatedBy.toString(),
		createdAt: rule.createdAt.toISOString(),
		updatedAt: rule.updatedAt.toISOString(),
	};
}

function formatOperationalAction(
	action: IAutomationOperationalActionDocument,
): AutomationOperationalActionSnapshot {
	return {
		_id: action._id.toString(),
		ruleId: action.ruleId.toString(),
		executionId: action.executionId.toString(),
		entityType: action.entityType,
		entityId: action.entityId,
		type: action.type,
		title: action.title,
		reason: action.reason,
		priority: action.priority,
		status: action.status,
		...(action.assignedRole ? { assignedRole: action.assignedRole } : {}),
		...(action.dueAt ? { dueAt: action.dueAt.toISOString() } : {}),
		createdAt: action.createdAt.toISOString(),
		...(action.resolvedAt ? { resolvedAt: action.resolvedAt.toISOString() } : {}),
		...(action.resolvedBy ? { resolvedBy: action.resolvedBy.toString() } : {}),
	};
}

export async function listAutomationRules(
	query: ListAutomationRulesQuery,
): Promise<AutomationRuleSnapshot[]> {
	const filter: { eventType?: AutomationEventType; enabled?: boolean } = {};
	if (query.eventType) {
		filter.eventType = query.eventType;
	}
	if (typeof query.enabled === "boolean") {
		filter.enabled = query.enabled;
	}
	const rules = await AutomationRule.find(filter)
		.sort({ enabled: -1, eventType: 1, name: 1 })
		.lean<IAutomationRuleDocument[]>();
	return rules.map(formatAutomationRule);
}

export async function createAutomationRule(
	input: CreateAutomationRuleInput,
	actorId: string,
): Promise<AutomationRuleSnapshot> {
	const actorObjectId = new Types.ObjectId(actorId);
	const rule = await AutomationRule.create({
		...input,
		version: 1,
		createdBy: actorObjectId,
		updatedBy: actorObjectId,
	});
	await createAuditLog({
		action: "AUTOMATION_RULE_CREATED",
		entity: "AutomationRule",
		entityId: rule._id.toString(),
		userId: actorId,
		after: { name: rule.name, eventType: rule.eventType, enabled: rule.enabled },
	});
	return formatAutomationRule(rule);
}

export async function updateAutomationRule(
	ruleId: string,
	input: UpdateAutomationRuleInput,
	actorId: string,
): Promise<AutomationRuleSnapshot> {
	const rule = await AutomationRule.findByIdAndUpdate(
		ruleId,
		{
			$set: { ...input, updatedBy: new Types.ObjectId(actorId) },
			$inc: { version: 1 },
		},
		{ returnDocument: "after", runValidators: true },
	);
	if (!rule) {
		throw new NotFoundError("AutomationRule", ruleId);
	}
	await createAuditLog({
		action: "AUTOMATION_RULE_UPDATED",
		entity: "AutomationRule",
		entityId: rule._id.toString(),
		userId: actorId,
		after: { name: rule.name, eventType: rule.eventType, enabled: rule.enabled },
	});
	return formatAutomationRule(rule);
}

export async function listAutomationOperationalActions(
	query: ListAutomationOperationalActionsQuery,
): Promise<AutomationOperationalActionSnapshot[]> {
	const filter: {
		status?: "open" | "resolved";
		assignedRole?: UserRole;
		entityType?: string;
		entityId?: string;
		type?: AutomationOperationalActionSnapshot["type"];
	} = {};
	if (query.status) {
		filter.status = query.status;
	}
	if (query.assignedRole) {
		filter.assignedRole = query.assignedRole;
	}
	if (query.entityType) {
		filter.entityType = query.entityType;
	}
	if (query.entityId) {
		filter.entityId = query.entityId;
	}
	if (query.type) {
		filter.type = query.type;
	}

	const actions = await AutomationOperationalAction.find(filter)
		.sort({ createdAt: -1 })
		.limit(query.limit)
		.lean<IAutomationOperationalActionDocument[]>();
	return actions.map(formatOperationalAction);
}

export async function resolveAutomationOperationalAction(
	actionId: string,
	actorId: string,
): Promise<AutomationOperationalActionSnapshot> {
	const resolvedAt = new Date();
	const action = await AutomationOperationalAction.findOneAndUpdate(
		{ _id: new Types.ObjectId(actionId), status: "open" },
		{
			$set: {
				status: "resolved",
				resolvedAt,
				resolvedBy: new Types.ObjectId(actorId),
			},
		},
		{ returnDocument: "after", runValidators: true },
	);

	if (action) {
		await createAuditLog({
			action: "AUTOMATION_ACTION_RESOLVED",
			entity: "AutomationOperationalAction",
			entityId: action._id.toString(),
			userId: actorId,
			before: { status: "open" },
			after: { status: "resolved", resolvedAt: resolvedAt.toISOString() },
			metadata: { entityType: action.entityType, entityId: action.entityId, type: action.type },
		});
		return formatOperationalAction(action);
	}

	const existing = await AutomationOperationalAction.findById(actionId);
	if (!existing) {
		throw new NotFoundError("AutomationOperationalAction", actionId);
	}
	return formatOperationalAction(existing);
}

function isDuplicateKeyError(error: Error): boolean {
	return "code" in error && error.code === 11000;
}

async function executeNotificationAction(
	ruleId: string,
	event: AutomationBusinessEvent,
	action: Extract<AutomationAction, { type: "notify" }>,
	actionIndex: number,
): Promise<string> {
	const recipients = await User.find({
		role: { $in: action.recipientRoles },
		isActive: true,
	})
		.select("_id role")
		.lean<NotificationRecipient[]>();

	await Promise.all(
		recipients.map((recipient) =>
			createNotification({
				recipientUserId: recipient._id.toString(),
				recipientRole: recipient.role,
				type: "SYSTEM_ALERT",
				priority: action.priority,
				title: action.title,
				body: action.body,
				relatedEntity: { entityType: event.entityType, entityId: event.entityId },
				channels: ["in_app"],
				dedupeKey: `automation:${ruleId}:${event.eventId}:${actionIndex}:${recipient._id.toString()}`,
			}),
		),
	);

	return `${recipients.length} notification recipients processed`;
}

function operationalActionDefinition(action: Exclude<AutomationAction, { type: "notify" }>): {
	title: string;
	reason: string;
	priority: "medium" | "high" | "critical";
	assignedRole?: UserRole;
	dueAt?: Date;
} {
	if (action.type === "create_task") {
		return {
			title: action.title,
			reason: action.reason,
			priority: "high",
			assignedRole: action.assignedRole,
			dueAt: new Date(Date.now() + action.dueHours * 60 * 60 * 1000),
		};
	}
	if (action.type === "flag_risk") {
		return {
			title: action.label,
			reason: action.label,
			priority: action.riskLevel,
		};
	}
	return {
		title:
			action.type === "block_transition"
				? "Transición bloqueada por automatización"
				: action.type === "return_to_execution"
					? "Retornar a ejecución"
					: "Evidencia requerida",
		reason: action.reason,
		priority: action.type === "block_transition" ? "critical" : "high",
	};
}

async function executeOperationalAction(
	ruleId: string,
	executionId: Types.ObjectId,
	event: AutomationBusinessEvent,
	action: Exclude<AutomationAction, { type: "notify" }>,
	actionIndex: number,
): Promise<string> {
	const definition = operationalActionDefinition(action);
	const dedupeKey = `automation:${ruleId}:${event.eventId}:${actionIndex}:${action.type}`;
	await AutomationOperationalAction.updateOne(
		{ dedupeKey },
		{
			$setOnInsert: {
				ruleId: new Types.ObjectId(ruleId),
				executionId,
				dedupeKey,
				entityType: event.entityType,
				entityId: event.entityId,
				type: action.type,
				...definition,
				status: "open",
			},
		},
		{ upsert: true, runValidators: true },
	);
	return `${action.type} action opened`;
}

async function executeAction(
	ruleId: string,
	executionId: Types.ObjectId,
	event: AutomationBusinessEvent,
	action: AutomationAction,
	actionIndex: number,
): Promise<AutomationActionResult> {
	try {
		const message =
			action.type === "notify"
				? await executeNotificationAction(ruleId, event, action, actionIndex)
				: await executeOperationalAction(ruleId, executionId, event, action, actionIndex);
		return { actionType: action.type, status: "succeeded", message };
	} catch (error) {
		return {
			actionType: action.type,
			status: "failed",
			message: error instanceof Error ? error.message : String(error),
		};
	}
}

async function executeRule(
	rule: IAutomationRuleDocument,
	event: AutomationBusinessEvent,
): Promise<"executed" | "skipped"> {
	const ruleId = rule._id.toString();
	let execution: { _id: Types.ObjectId };
	try {
		const claim = await AutomationExecution.findOneAndUpdate(
			{ ruleId: rule._id, eventId: event.eventId },
			{
				$setOnInsert: {
					ruleId: rule._id,
					eventId: event.eventId,
					eventType: event.eventType,
					entityType: event.entityType,
					entityId: event.entityId,
					actorId: new Types.ObjectId(event.actorId),
					status: "processing",
					actionResults: [],
					executedAt: new Date(),
				},
			},
			{
				upsert: true,
				returnDocument: "after",
				setDefaultsOnInsert: true,
				includeResultMetadata: true,
			},
		);
		if (!claim.value) {
			throw new Error("Automation execution claim returned no document");
		}
		if (claim.lastErrorObject?.updatedExisting === true) {
			return "skipped";
		}
		execution = { _id: claim.value._id };
	} catch (error) {
		if (error instanceof Error && isDuplicateKeyError(error)) {
			return "skipped";
		}
		throw error;
	}

	const actionResults: AutomationActionResult[] = [];
	for (const [actionIndex, action] of rule.actions.entries()) {
		actionResults.push(await executeAction(ruleId, execution._id, event, action, actionIndex));
	}
	const failedResult = actionResults.find((result) => result.status === "failed");
	await AutomationExecution.updateOne(
		{ _id: execution._id },
		{
			$set: {
				status: failedResult ? "failed" : "succeeded",
				actionResults,
				...(failedResult ? { errorMessage: failedResult.message } : {}),
			},
		},
	);
	return "executed";
}

export async function executeAutomationEvent(
	event: AutomationBusinessEvent,
): Promise<AutomationExecutionSummary> {
	const rules = await AutomationRule.find({ eventType: event.eventType, enabled: true }).lean<
		IAutomationRuleDocument[]
	>();
	let executedRules = 0;
	let skippedRules = 0;

	for (const rule of rules) {
		const result = await executeRule(rule, event);
		if (result === "executed") {
			executedRules += 1;
		} else {
			skippedRules += 1;
		}
	}

	return { matchedRules: rules.length, executedRules, skippedRules };
}

export async function publishAutomationEventSafely(event: AutomationBusinessEvent): Promise<void> {
	try {
		await executeAutomationEvent(event);
	} catch (error) {
		log.error("Automation event execution failed", {
			eventId: event.eventId,
			eventType: event.eventType,
			error: error instanceof Error ? error.message : String(error),
		});
	}
}

export async function assertNoAutomationTransitionBlocks(
	entityType: string,
	entityId: string,
): Promise<void> {
	const blockers = await AutomationOperationalAction.find({
		entityType,
		entityId,
		status: "open",
		type: { $in: ["block_transition", "return_to_execution", "request_evidence"] },
	}).lean<Array<{ type: string; reason: string }>>();
	if (blockers.length === 0) {
		return;
	}

	throw new UnprocessableError(
		`Automation blocks this transition: ${blockers.map((blocker) => blocker.reason).join("; ")}`,
		"AUTOMATION_TRANSITION_BLOCKED",
	);
}

// ─── Sprint 2: json-rules-engine integration ───

export async function evaluateRules(
	_module: string,
	_event: string,
	facts: Record<string, unknown>,
) {
	const engine = new Engine();

	// Load active rules from DB
	const rules = await AutomationRule.find({ isActive: true }).sort({ name: 1 }).lean();

	if (rules.length === 0) {
		return [];
	}

	const triggered: unknown[] = [];

	for (const rule of rules) {
		const r = rule as unknown as Record<string, unknown>;
		const conditions = (r.conditions as Array<Record<string, unknown>>) || [];
		const actions = (r.actions as Array<Record<string, unknown>>) || [];

		if (conditions.length === 0) {
			continue;
		}

		engine.addRule({
			name: (r.name as string) || "unnamed",
			conditions: {
				all: conditions.map((c: Record<string, unknown>) => ({
					fact: (c.fact as string) || "status",
					operator: (c.operator as string) || "equal",
					value: c.value,
				})),
			},
			event: {
				type: ((actions[0]?.type as string) || "notify") as string,
				params: { actions, ruleId: r._id },
			},
		});
	}

	engine.on("success", (eventData: { type: string; params: Record<string, unknown> }) => {
		triggered.push(eventData.params);
	});

	await engine.run(facts);
	return triggered;
}

export async function executeActions(
	actions: Array<{ type: string; config?: Record<string, unknown> }>,
): Promise<Array<{ action: string; executed: boolean }>> {
	const results = [];
	for (const action of actions) {
		switch (action.type) {
			case "notify":
				log.info("Engine notify triggered");
				break;
			case "block_transition":
				log.info("Engine block_transition triggered");
				break;
			case "create_task":
				log.info("Engine create_task triggered");
				break;
			case "request_evidence":
				log.info("Engine request_evidence triggered");
				break;
			case "return_to_execution":
				log.info("Engine return_to_execution triggered");
				break;
			case "flag_risk":
				log.info("Engine flag_risk triggered");
				break;
		}
		results.push({ action: action.type, executed: true });
	}
	return results;
}
