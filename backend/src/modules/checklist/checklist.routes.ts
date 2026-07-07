import { CERMONT_ROLES, INTERNAL_ROLES, SUPERVISORY_ROLES } from "@cermont/domain";
import {
	ChecklistIdParamsSchema,
	ChecklistItemParamsSchema,
	ChecklistOrderIdParamsSchema,
	CompleteChecklistSchema,
	CreateChecklistSchema,
	ListChecklistsQuerySchema,
	UpdateChecklistItemSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import * as ChecklistController from "./checklist.controller";

const router = Router();

router.get(
	"/",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateQuery(ListChecklistsQuerySchema),
	ChecklistController.listChecklists,
);

router.get(
	"/order/:orderId",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(ChecklistOrderIdParamsSchema),
	ChecklistController.listChecklistsByOrder,
);

router.get(
	"/:orderId",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(ChecklistOrderIdParamsSchema),
	ChecklistController.listChecklistsByOrder,
);

router.post(
	"/",
	authenticate,
	authorize(...SUPERVISORY_ROLES),
	validateBody(CreateChecklistSchema),
	ChecklistController.createChecklist,
);

router.patch(
	"/:id/items/:itemId",
	authenticate,
	authorize(CERMONT_ROLES.OPERADOR, CERMONT_ROLES.TECNICO, CERMONT_ROLES.SUPERVISOR),
	validateParams(ChecklistItemParamsSchema),
	validateBody(UpdateChecklistItemSchema),
	ChecklistController.updateChecklistItem,
);

router.patch(
	"/:id/complete",
	authenticate,
	authorize(CERMONT_ROLES.OPERADOR, CERMONT_ROLES.TECNICO, CERMONT_ROLES.SUPERVISOR),
	validateParams(ChecklistIdParamsSchema),
	validateBody(CompleteChecklistSchema),
	ChecklistController.completeChecklist,
);

router.post(
	"/:id/validate",
	authenticate,
	authorize(CERMONT_ROLES.OPERADOR, CERMONT_ROLES.TECNICO, CERMONT_ROLES.SUPERVISOR),
	validateParams(ChecklistIdParamsSchema),
	validateBody(CompleteChecklistSchema),
	ChecklistController.completeChecklist,
);

export default router;
