import { INTERNAL_ROLES } from "@cermont/domain";
import { ObjectIdSchema } from "@cermont/shared-types";
import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateParams } from "../../middlewares/validate";
import * as ClosureController from "./order-closure.controller";

const router = Router();
const OrderIdParamsSchema = z.object({ id: ObjectIdSchema }).strict();

router.use(authenticate);

/**
 * GET /api/orders/:id/closure-report
 * Consolida la información de los pasos 8-14 para auditoría y cierre.
 * Resuelve requerimiento del jurado sobre trazabilidad completa.
 */
router.get(
	"/:id/closure-report",
	authorize(...INTERNAL_ROLES),
	validateParams(OrderIdParamsSchema),
	ClosureController.getConsolidatedClosureReport,
);

export default router;
