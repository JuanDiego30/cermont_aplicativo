import { MANAGEMENT_ROLES } from "@cermont/domain";
import {
	AutomationRuleIdSchema,
	CreateAutomationRuleSchema,
	ListAutomationOperationalActionsQuerySchema,
	ListAutomationRulesQuerySchema,
	ResolveAutomationOperationalActionParamsSchema,
	UpdateAutomationRuleSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import {
	createRule,
	listOperationalActions,
	listRules,
	resolveOperationalAction,
	updateRule,
} from "./automation.controller";

const router = Router();

router.use(authenticate, authorize(...MANAGEMENT_ROLES));
router.get("/", validateQuery(ListAutomationRulesQuerySchema), listRules);
router.post("/", validateBody(CreateAutomationRuleSchema), createRule);
router.get(
	"/actions",
	validateQuery(ListAutomationOperationalActionsQuerySchema),
	listOperationalActions,
);
router.patch(
	"/actions/:id/resolve",
	validateParams(ResolveAutomationOperationalActionParamsSchema),
	resolveOperationalAction,
);
router.patch(
	"/:id",
	validateParams(AutomationRuleIdSchema),
	validateBody(UpdateAutomationRuleSchema),
	updateRule,
);

export default router;
