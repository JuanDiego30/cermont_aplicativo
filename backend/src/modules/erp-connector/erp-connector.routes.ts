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
import { FieldMappingService } from "../../services/erp";
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

// GET /api/erp-connectors/field-mappings/:provider — Get default field mappings
router.get(
	"/field-mappings/:provider",
	authenticate,
	authorize(...MANAGEMENT_ROLES),
	(req, res) => {
		const provider = req.params.provider as string;
		const mappings = FieldMappingService.getDefaultMappings(provider);
		res.status(200).json({ success: true, data: mappings });
	},
);

// ─── DLQ (Dead Letter Queue) Management ──────────────────────────────────

// GET /api/erp-connectors/dlq — List DLQ entries
router.get(
	"/dlq/list",
	authenticate,
	authorize(CERMONT_ROLES.GERENTE),
	erpConnectorController.listDlq,
);

// POST /api/erp-connectors/dlq/:id/retry — Retry a single DLQ entry
router.post(
	"/dlq/:id/retry",
	authenticate,
	authorize(CERMONT_ROLES.GERENTE),
	validateParams(ObjectIdSchema),
	erpConnectorController.retryDlqItem,
);

// POST /api/erp-connectors/dlq/retry-all/:provider — Retry all DLQ entries for a provider
router.post(
	"/dlq/retry-all/:provider",
	authenticate,
	authorize(CERMONT_ROLES.GERENTE),
	erpConnectorController.retryAllDlqByProvider,
);

// POST /api/erp-connectors/dlq/:id/resolve — Mark DLQ entry as permanently failed
router.post(
	"/dlq/:id/resolve",
	authenticate,
	authorize(CERMONT_ROLES.GERENTE),
	validateParams(ObjectIdSchema),
	erpConnectorController.resolveDlqItem,
);

// GET /api/erp-connectors/integration-logs — View integration audit trail
router.get(
	"/integration-logs",
	authenticate,
	authorize(CERMONT_ROLES.GERENTE),
	erpConnectorController.getIntegrationLogs,
);

export default router;
