/**
 * Evidence Routes
 * DOC-10 §5: Evidencias
 */

import { INTERNAL_ROLES, SUPERVISORY_ROLES } from "@cermont/domain";
import {
	CreateEvidenceSchema,
	EvidenceIdSchema,
	EvidenceOrderIdParamsSchema,
	PaginationQuerySchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { uploadLimiter } from "../../middlewares/rate-limiter";
import {
	evidenceUpload,
	handleUploadError,
	validateUploadedFileHeaders,
} from "../../middlewares/uploadMiddleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import * as EvidenceController from "./evidence.controller";

const router = Router();

// GET /api/evidences/stats — evidence statistics for dashboard
// Roles: Todos (all authenticated users)
router.get("/stats", authenticate, authorize(...INTERNAL_ROLES), EvidenceController.getStats);

// GET /api/evidences — list all evidences (paginado, filtrable)
// Roles: Todos (all authenticated users)
router.get(
	"/",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateQuery(PaginationQuerySchema),
	EvidenceController.listEvidences,
);

// GET /api/evidences/order/:orderId
// Roles: Todos (all authenticated users)
router.get(
	"/order/:orderId",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(EvidenceOrderIdParamsSchema),
	validateQuery(PaginationQuerySchema),
	EvidenceController.getEvidencesByOrder,
);

// POST /api/evidences — upload
// Roles: OPE, TEC, SUP
router.post(
	"/",
	authenticate,
	authorize("operador", "tecnico", "supervisor"),
	uploadLimiter,
	evidenceUpload.single("file"),
	handleUploadError,
	validateUploadedFileHeaders,
	validateBody(CreateEvidenceSchema),
	EvidenceController.uploadEvidence,
);

// GET /api/evidences/:id
router.get(
	"/:id",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(EvidenceIdSchema),
	EvidenceController.getEvidenceById,
);

// DELETE /api/evidences/:id
// Roles: GER, RES, SUP
router.delete(
	"/:id",
	authenticate,
	authorize(...SUPERVISORY_ROLES),
	validateParams(EvidenceIdSchema),
	EvidenceController.deleteEvidence,
);

// POST /api/evidences/:id/verify
// Roles: GER, RES, SUP
router.post(
	"/:id/verify",
	authenticate,
	authorize(...SUPERVISORY_ROLES),
	validateParams(EvidenceIdSchema),
	EvidenceController.verifyEvidence,
);

export default router;
