import {
	CreateAutomationRuleSchema,
	ListAutomationOperationalActionsQuerySchema,
	ListAutomationRulesQuerySchema,
	UpdateAutomationRuleSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { requireUser } from "../../common/utils/request";
import {
	createAutomationRule,
	listAutomationOperationalActions,
	listAutomationRules,
	resolveAutomationOperationalAction,
	updateAutomationRule,
} from "./automation.service";

export async function listRules(req: Request, res: Response): Promise<void> {
	const rules = await listAutomationRules(ListAutomationRulesQuerySchema.parse(req.query));
	res.status(200).json({ success: true, data: rules });
}

export async function createRule(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const rule = await createAutomationRule(
		CreateAutomationRuleSchema.parse(req.body),
		String(user._id),
	);
	res.status(201).json({ success: true, data: rule });
}

export async function updateRule(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const rule = await updateAutomationRule(
		String(req.params.id),
		UpdateAutomationRuleSchema.parse(req.body),
		String(user._id),
	);
	res.status(200).json({ success: true, data: rule });
}

export async function listOperationalActions(req: Request, res: Response): Promise<void> {
	const actions = await listAutomationOperationalActions(
		ListAutomationOperationalActionsQuerySchema.parse(req.query),
	);
	res.status(200).json({ success: true, data: actions });
}

export async function resolveOperationalAction(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const action = await resolveAutomationOperationalAction(String(req.params.id), String(user._id));
	res.status(200).json({ success: true, data: action });
}
