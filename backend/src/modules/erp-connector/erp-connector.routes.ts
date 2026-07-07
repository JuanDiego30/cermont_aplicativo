/**
 * ErpConnector Routes — Endpoint wiring for ERP connector management
 */

import { CERMONT_ROLES, MANAGEMENT_ROLES } from "@cermont/domain";
import {
	CreateErpConnectorSchema,
	ObjectIdSchema,
	SyncErpConnectorParamsSchema,
	SyncErpConnectorRequestSchema,
	UpdateErpConnectorSchema,
	ValidateErpMappingSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams } from "../../middlewares/validate";
import { erpConnectorController } from "./erp-connector.controller";

const router = Router();

router.get("/", authenticate, authorize(...MANAGEMENT_ROLES), erpConnectorController.list);

router.get(
	"/health",
	authenticate,
	authorize(...MANAGEMENT_ROLES),
	erpConnectorController.healthCheck,
);

router.get(
	"/metrics",
	authenticate,
	authorize(...MANAGEMENT_ROLES),
	erpConnectorController.metrics,
);

router.post(
	"/",
	authenticate,
	authorize(CERMONT_ROLES.GERENTE),
	validateBody(CreateErpConnectorSchema),
	erpConnectorController.create,
);

router.get(
	"/:id",
	authenticate,
	authorize(...MANAGEMENT_ROLES),
	validateParams(ObjectIdSchema),
	erpConnectorController.getById,
);

router.put(
	"/:id",
	authenticate,
	authorize(CERMONT_ROLES.GERENTE),
	validateParams(ObjectIdSchema),
	validateBody(UpdateErpConnectorSchema),
	erpConnectorController.update,
);

router.delete(
	"/:id",
	authenticate,
	authorize(CERMONT_ROLES.GERENTE),
	validateParams(ObjectIdSchema),
	erpConnectorController.delete,
);

router.post(
	"/:provider/sync",
	authenticate,
	authorize(...MANAGEMENT_ROLES),
	validateParams(SyncErpConnectorParamsSchema),
	validateBody(SyncErpConnectorRequestSchema),
	erpConnectorController.sync,
);

// POST /api/erp-connectors/:id/validate-mapping — Validate field mapping
router.post(
	"/:id/validate-mapping",
	authenticate,
	authorize(CERMONT_ROLES.GERENTE),
	validateParams(ObjectIdSchema),
	validateBody(ValidateErpMappingSchema),
	erpConnectorController.validateMapping,
);

// POST /api/erp-connectors/:id/test-sync — Test sync with ERP provider
router.post(
	"/:id/test-sync",
	authenticate,
	authorize(CERMONT_ROLES.GERENTE),
	validateParams(ObjectIdSchema),
	erpConnectorController.testSync,
);

export default router;
