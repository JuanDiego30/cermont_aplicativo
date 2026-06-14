import { PLANNING_ACCESS_ROLES } from "@cermont/domain";
import {
	AssignTechniciansInputSchema,
	DispatchGeocodeQuerySchema,
	OptimizeRouteInputSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateQuery } from "../../middlewares/validate";
import { DispatchController } from "./dispatch.controller";

const router = Router();

router.use(authenticate);

router.post(
	"/optimize",
	authorize(...PLANNING_ACCESS_ROLES),
	validateBody(OptimizeRouteInputSchema),
	DispatchController.optimizeRoute,
);
router.post(
	"/assign",
	authorize(...PLANNING_ACCESS_ROLES),
	validateBody(AssignTechniciansInputSchema),
	DispatchController.assignTechnicians,
);
router.get(
	"/geocode",
	authorize(...PLANNING_ACCESS_ROLES),
	validateQuery(DispatchGeocodeQuerySchema),
	DispatchController.geocode,
);

export default router;
