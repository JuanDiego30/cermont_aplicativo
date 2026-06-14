import { ADMIN_PLUS_RESIDENTE, INTERNAL_ROLES } from "@cermont/domain";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import * as TemplateDraftController from "./template-draft.controller";

const router = Router();

router.use(authenticate);

router.get("/", authorize(...INTERNAL_ROLES), TemplateDraftController.getAll);
router.post(
	"/",
	authorize(...ADMIN_PLUS_RESIDENTE),
	// No body validation needed — template draft creation handled by controller
	TemplateDraftController.create,
);
router.get("/:id", authorize(...INTERNAL_ROLES), TemplateDraftController.getById);
router.patch(
	"/:id",
	authorize(...ADMIN_PLUS_RESIDENTE),
	// No body validation needed — template draft update handled by controller
	TemplateDraftController.update,
);
router.post(
	"/:id/approve",
	authorize("gerente", "administrativo"),
	// No body validation needed — approve is an action endpoint with no body
	TemplateDraftController.approve,
);
router.post(
	"/:id/reject",
	authorize("gerente", "administrativo"),
	// No body validation needed — reject is an action endpoint with no body
	TemplateDraftController.reject,
);
router.post(
	"/:id/submit-for-review",
	authorize(...ADMIN_PLUS_RESIDENTE),
	// No body validation needed — submit-for-review is an action endpoint with no body
	TemplateDraftController.submitForReview,
);
router.post(
	"/:id/convert-to-template",
	authorize("gerente", "administrativo"),
	// No body validation needed — convert is an action endpoint with no body
	TemplateDraftController.convert,
);
router.delete("/:id", authorize("gerente", "administrativo"), TemplateDraftController.remove);

export default router;
