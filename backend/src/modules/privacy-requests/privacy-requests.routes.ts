import { ADMIN_ROLES } from "@cermont/domain";
import { CreatePrivacyRequestSchema, PrivacyRequestIdParamsSchema } from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams } from "../../middlewares/validate";
import { privacyRequestsController } from "./privacy-requests.controller";

const router = Router();

router.get("/", authenticate, authorize(...ADMIN_ROLES), privacyRequestsController.list);
router.get(
	"/:id",
	authenticate,
	authorize(...ADMIN_ROLES),
	validateParams(PrivacyRequestIdParamsSchema),
	privacyRequestsController.get,
);
router.post(
	"/",
	authenticate,
	authorize(...ADMIN_ROLES),
	validateBody(CreatePrivacyRequestSchema),
	privacyRequestsController.create,
);

export default router;
