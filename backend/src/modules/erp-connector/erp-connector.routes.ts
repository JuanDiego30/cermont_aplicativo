/**
 * ErpConnector Routes — Endpoint wiring for ERP connector management
 */

import {
	CreateErpConnectorSchema,
	ObjectIdSchema,
	UpdateErpConnectorSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams } from "../../middlewares/validate";
import { erpConnectorController } from "./erp-connector.controller";

const ValidateErpMappingSchema = z.object({
	fieldMappings: z.record(z.string(), z.string()),
});

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

// POST /api/erp-connectors/:id/validate-mapping — Validate field mapping
router.post(
	"/:id/validate-mapping",
	authenticate,
	authorize("gerente"),
	validateParams(ObjectIdSchema),
	validateBody(ValidateErpMappingSchema),
	erpConnectorController.validateMapping,
);

// POST /api/erp-connectors/:id/test-sync — Test sync with ERP provider
router.post(
	"/:id/test-sync",
	authenticate,
	authorize("gerente"),
	validateParams(ObjectIdSchema),
	erpConnectorController.testSync,
);

export default router;
