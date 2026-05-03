import {
	ChecklistIdParamsSchema,
	ChecklistItemParamsSchema,
	ChecklistOrderIdParamsSchema,
	CompleteChecklistSchema,
	CreateChecklistSchema,
	CreateChecklistTemplateSchema,
	ListChecklistsQuerySchema,
	UpdateChecklistItemSchema,
	UpdateChecklistTemplateSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../_shared/middlewares/auth.middleware";
import {
	authorize,
	authorizeAllAuthenticated,
} from "../../_shared/middlewares/authorize.middleware";
import { deprecatedRoute } from "../../_shared/middlewares/deprecation.middleware";
import { validateBody, validateParams, validateQuery } from "../../_shared/middlewares/validate";
import * as ChecklistController from "./controller";

const router = Router();
const legacySunset = "Wed, 30 Sep 2026 23:59:59 GMT";

router.get(
	"/",
	authenticate,
	authorizeAllAuthenticated(),
	validateQuery(ListChecklistsQuerySchema),
	ChecklistController.listChecklists,
);

router.get(
	"/order/:orderId",
	authenticate,
	authorizeAllAuthenticated(),
	deprecatedRoute({
		successor: "/api/checklists/:orderId",
		sunset: legacySunset,
	}),
	validateParams(ChecklistOrderIdParamsSchema),
	ChecklistController.getChecklistByOrder,
);

router.get(
	"/order/:orderId/latest",
	authenticate,
	authorizeAllAuthenticated(),
	validateParams(ChecklistOrderIdParamsSchema),
	ChecklistController.getChecklistByOrder,
);

router.post(
	"/",
	authenticate,
	authorize("manager", "resident_engineer", "supervisor"),
	validateBody(CreateChecklistSchema),
	ChecklistController.createChecklist,
);

router.patch(
	"/:id/items/:itemId",
	authenticate,
	authorize("operator", "technician", "supervisor"),
	validateParams(ChecklistItemParamsSchema),
	validateBody(UpdateChecklistItemSchema),
	ChecklistController.updateChecklistItem,
);

router.patch(
	"/:id/complete",
	authenticate,
	authorize("operator", "technician", "supervisor"),
	deprecatedRoute({
		successor: "/api/checklists/:id/validate",
		sunset: legacySunset,
	}),
	validateParams(ChecklistIdParamsSchema),
	validateBody(CompleteChecklistSchema),
	ChecklistController.completeChecklist,
);

router.post(
	"/:id/validate",
	authenticate,
	authorize("operator", "technician", "supervisor"),
	validateParams(ChecklistIdParamsSchema),
	validateBody(CompleteChecklistSchema),
	ChecklistController.completeChecklist,
);

// ── Checklist Templates (Catalog) ───────────────────────────

router.get(
	"/templates",
	authenticate,
	authorizeAllAuthenticated(),
	ChecklistController.listTemplates,
);

router.post(
	"/templates",
	authenticate,
	authorize("manager", "administrator"),
	validateBody(CreateChecklistTemplateSchema),
	ChecklistController.createTemplate,
);

router.get(
	"/templates/:id",
	authenticate,
	authorizeAllAuthenticated(),
	ChecklistController.getTemplateById,
);

router.patch(
	"/templates/:id",
	authenticate,
	authorize("manager", "administrator"),
	validateBody(UpdateChecklistTemplateSchema),
	ChecklistController.updateTemplate,
);

export default router;
