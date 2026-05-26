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

router.get("/", authorize("gerente", "residente", "supervisor", "hes"), getAllInspections);
router.get(
	"/order/:order_id",
	authorize("gerente", "residente", "supervisor", "tecnico", "operador", "hes"),
	validateParams(InspectionOrderIdParamsSchema),
	getInspectionsByOrder,
);
router.get(
	"/:id",
	authorize("gerente", "residente", "supervisor", "hes"),
	validateParams(InspectionIdSchema),
	getInspectionById,
);
router.post(
	"/",
	authorize("gerente", "residente", "supervisor", "tecnico", "operador", "hes"),
	validateBody(CreateInspectionSchema),
	createInspection,
);
router.patch(
	"/:id/status",
	authorize("gerente", "residente", "supervisor", "hes"),
	validateParams(InspectionIdSchema),
	validateBody(UpdateInspectionStatusSchema),
	updateInspectionStatus,
);
router.delete("/:id", authorize("gerente"), validateParams(InspectionIdSchema), deleteInspection);

export default router;
