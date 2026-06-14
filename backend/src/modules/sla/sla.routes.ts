import { INTERNAL_ROLES, MANAGEMENT_ROLES } from "@cermont/domain";
import {
	EscalateSlaTrackingSchema,
	SlaTrackingIdParamsSchema,
	SlaTrackingQuerySchema,
	UpdateSlaConfigsSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import { SLAController } from "./sla.controller";

const router = Router();

router.use(authenticate);

router.get("/config", authorize(...INTERNAL_ROLES), SLAController.getConfigs);
router.put(
	"/config",
	authorize(...MANAGEMENT_ROLES),
	validateBody(UpdateSlaConfigsSchema),
	SLAController.updateConfigs,
);
router.get("/dashboard", authorize(...INTERNAL_ROLES), SLAController.getDashboard);
router.get(
	"/trackings",
	authorize(...INTERNAL_ROLES),
	validateQuery(SlaTrackingQuerySchema),
	SLAController.getTrackings,
);
router.post(
	"/trackings/:trackingId/escalate",
	authorize(...MANAGEMENT_ROLES),
	validateParams(SlaTrackingIdParamsSchema),
	validateBody(EscalateSlaTrackingSchema),
	SLAController.escalate,
);

export default router;
