import {
	CreateInspectionSchema,
	InspectionIdSchema,
	InspectionOrderIdParamsSchema,
	ListInspectionsQuerySchema,
	UpdateInspectionStatusSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../_shared/middlewares/auth.middleware";
import { authorize } from "../../_shared/middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../_shared/middlewares/validate";
import {
	createInspection,
	deleteInspection,
	getAllInspections,
	getInspectionById,
	getInspectionsByOrder,
	updateInspectionStatus,
} from "./controller";

const router = Router();

router.use(authenticate);

router.get(
	"/",
	authorize("manager", "resident_engineer", "supervisor", "hse_coordinator"),
	validateQuery(ListInspectionsQuerySchema),
	getAllInspections,
);
router.get(
	"/order/:order_id",
	authorize(
		"manager",
		"resident_engineer",
		"supervisor",
		"technician",
		"operator",
		"hse_coordinator",
	),
	validateParams(InspectionOrderIdParamsSchema),
	validateQuery(ListInspectionsQuerySchema),
	getInspectionsByOrder,
);
router.get(
	"/:id",
	authorize("manager", "resident_engineer", "supervisor", "hse_coordinator"),
	validateParams(InspectionIdSchema),
	getInspectionById,
);
router.post(
	"/",
	authorize(
		"manager",
		"resident_engineer",
		"supervisor",
		"technician",
		"operator",
		"hse_coordinator",
	),
	validateBody(CreateInspectionSchema),
	createInspection,
);
router.patch(
	"/:id/status",
	authorize("manager", "resident_engineer", "supervisor", "hse_coordinator"),
	validateParams(InspectionIdSchema),
	validateBody(UpdateInspectionStatusSchema),
	updateInspectionStatus,
);
router.delete("/:id", authorize("manager"), validateParams(InspectionIdSchema), deleteInspection);

export default router;
