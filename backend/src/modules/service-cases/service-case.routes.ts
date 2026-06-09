import { INTERNAL_ROLES } from "@cermont/domain";
import { ListServiceCasesQuerySchema, ServiceCaseIdParamsSchema } from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateParams, validateQuery } from "../../middlewares/validate";
import {
	advanceServiceCase,
	archiveServiceCase,
	bulkClosingEvidenceForCase,
	closeServiceCase,
	getCaseClosingStatus,
	getServiceCase,
	getServiceCaseStepContext,
	getServiceCaseSummary,
	getServiceCaseWorkflow,
	listServiceCases,
} from "./service-case.controller";

const router = Router();

router.use(authenticate);

// GET /api/service-cases — List all service cases (paginated)
router.get(
	"/",
	authorize(...INTERNAL_ROLES),
	validateQuery(ListServiceCasesQuerySchema),
	listServiceCases,
);

// GET /api/service-cases/summary — Dashboard aggregated summary
router.get("/summary", authorize(...INTERNAL_ROLES), getServiceCaseSummary);

// GET /api/service-cases/:id/step-context?stepCode=<code> — Inherited step context for create forms
router.get(
	"/:id/step-context",
	authorize(...INTERNAL_ROLES),
	validateParams(ServiceCaseIdParamsSchema),
	getServiceCaseStepContext,
);

// GET /api/service-cases/:id/workflow — Explicit workflow view for cockpit
router.get(
	"/:id/workflow",
	authorize(...INTERNAL_ROLES),
	validateParams(ServiceCaseIdParamsSchema),
	getServiceCaseWorkflow,
);

// GET /api/service-cases/:id/cockpit — Plan-compatible cockpit read model alias
router.get(
	"/:id/cockpit",
	authorize(...INTERNAL_ROLES),
	validateParams(ServiceCaseIdParamsSchema),
	getServiceCaseWorkflow,
);

// GET /api/service-cases/:id — Get single service case
router.get(
	"/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(ServiceCaseIdParamsSchema),
	getServiceCase,
);

// POST /api/service-cases/:id/step/advance — Advance operational step
router.post(
	"/:id/step/advance",
	authorize("gerente", "residente", "supervisor"),
	validateParams(ServiceCaseIdParamsSchema),
	advanceServiceCase,
);

// POST /api/service-cases/:id/closing-evidence/bulk — Upload bulk closing evidence for case
router.post(
	"/:id/closing-evidence/bulk",
	authorize(...INTERNAL_ROLES),
	validateParams(ServiceCaseIdParamsSchema),
	bulkClosingEvidenceForCase,
);

// GET /api/service-cases/:id/closing-status — Get consolidated closing status
router.get(
	"/:id/closing-status",
	authorize(...INTERNAL_ROLES),
	validateParams(ServiceCaseIdParamsSchema),
	getCaseClosingStatus,
);

/**
 * POST /api/service-cases/:id/close
 * Close a service case (requires payment, no active blockers)
 * Roles: GER, RES
 */
router.post(
	"/:id/close",
	authenticate,
	authorize("gerente", "residente"),
	validateParams(ServiceCaseIdParamsSchema),
	closeServiceCase,
);

/**
 * POST /api/service-cases/:id/archive
 * Archive a service case
 * Roles: GER only
 */
router.post(
	"/:id/archive",
	authenticate,
	authorize("gerente"),
	validateParams(ServiceCaseIdParamsSchema),
	archiveServiceCase,
);

export default router;
