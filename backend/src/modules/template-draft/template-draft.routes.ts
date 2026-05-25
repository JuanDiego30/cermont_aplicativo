import { INTERNAL_ROLES } from "@cermont/domain";
import { Router } from "express";
import * as TemplateDraftController from "./template-draft.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";

const router = Router();

router.use(authenticate);

router.get("/", authorize(...INTERNAL_ROLES), TemplateDraftController.getAll);
router.post(
	"/",
	authorize("gerente", "residente", "administrativo"),
	TemplateDraftController.create,
);
router.get("/:id", authorize(...INTERNAL_ROLES), TemplateDraftController.getById);
router.patch(
	"/:id",
	authorize("gerente", "residente", "administrativo"),
	TemplateDraftController.update,
);
router.post(
	"/:id/approve",
	authorize("gerente", "administrativo"),
	TemplateDraftController.approve,
);
router.post("/:id/reject", authorize("gerente", "administrativo"), TemplateDraftController.reject);
router.post(
	"/:id/submit-for-review",
	authorize("gerente", "residente", "administrativo"),
	TemplateDraftController.submitForReview,
);
router.post(
	"/:id/convert-to-template",
	authorize("gerente", "administrativo"),
	TemplateDraftController.convert,
);
router.delete("/:id", authorize("gerente", "administrativo"), TemplateDraftController.remove);

export default router;
