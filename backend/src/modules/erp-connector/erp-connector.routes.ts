/**
 * ErpConnector Routes — Endpoint wiring for ERP connector management
 */

import {
	CreateErpConnectorSchema,
	ObjectIdSchema,
	UpdateErpConnectorSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams } from "../../middlewares/validate";
import { erpConnectorController } from "./erp-connector.controller";

const router = Router();

router.get("/", authenticate, authorize("gerente", "residente"), erpConnectorController.list);

router.get(
	"/health",
	authenticate,
	authorize("gerente", "residente"),
	erpConnectorController.healthCheck,
);

router.get(
	"/metrics",
	authenticate,
	authorize("gerente", "residente"),
	erpConnectorController.metrics,
);

router.post(
	"/",
	authenticate,
	authorize("gerente"),
	validateBody(CreateErpConnectorSchema),
	erpConnectorController.create,
);

router.get(
	"/:id",
	authenticate,
	authorize("gerente", "residente"),
	validateParams(ObjectIdSchema),
	erpConnectorController.getById,
);

router.put(
	"/:id",
	authenticate,
	authorize("gerente"),
	validateParams(ObjectIdSchema),
	validateBody(UpdateErpConnectorSchema),
	erpConnectorController.update,
);

router.delete(
	"/:id",
	authenticate,
	authorize("gerente"),
	validateParams(ObjectIdSchema),
	erpConnectorController.delete,
);

router.post(
	"/:provider/sync",
	authenticate,
	authorize("gerente", "residente"),
	erpConnectorController.sync,
);

export default router;
