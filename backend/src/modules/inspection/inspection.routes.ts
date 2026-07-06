import { CERMONT_ROLES, REPORTING_ACCESS_ROLES } from "@cermont/domain";
import {
	CreateInspectionSchema,
	InspectionIdSchema,
	InspectionOrderIdParamsSchema,
	UpdateInspectionStatusSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams } from "../../middlewares/validate";
import {
	createInspection,
	deleteInspection,
	getAllInspections,
	getInspectionById,
	getInspectionsByOrder,
	updateInspectionStatus,
} from "./inspection.controller";

const router = Router();

router.use(authenticate);

router.get("/", authorize(...REPORTING_ACCESS_ROLES), getAllInspections);
router.get(
	"/order/:order_id",
	authorize(
		CERMONT_ROLES.GERENTE,
		CERMONT_ROLES.RESIDENTE,
		CERMONT_ROLES.SUPERVISOR,
		CERMONT_ROLES.TECNICO,
		CERMONT_ROLES.OPERADOR,
		CERMONT_ROLES.HES,
	),
	validateParams(InspectionOrderIdParamsSchema),
	getInspectionsByOrder,
);
router.get(
	"/:id",
	authorize(...REPORTING_ACCESS_ROLES),
	validateParams(InspectionIdSchema),
	getInspectionById,
);
router.post(
	"/",
	authorize(
		CERMONT_ROLES.GERENTE,
		CERMONT_ROLES.RESIDENTE,
		CERMONT_ROLES.SUPERVISOR,
		CERMONT_ROLES.TECNICO,
		CERMONT_ROLES.OPERADOR,
		CERMONT_ROLES.HES,
	),
	validateBody(CreateInspectionSchema),
	createInspection,
);
router.patch(
	"/:id/status",
	authorize(...REPORTING_ACCESS_ROLES),
	validateParams(InspectionIdSchema),
	validateBody(UpdateInspectionStatusSchema),
	updateInspectionStatus,
);
router.delete(
	"/:id",
	authorize(CERMONT_ROLES.GERENTE),
	validateParams(InspectionIdSchema),
	deleteInspection,
);

export default router;
