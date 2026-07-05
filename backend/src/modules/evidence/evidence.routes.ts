/**
 * Evidence Routes
 * DOC-10 §5: Evidencias
 */

import { EVIDENCE_ACCESS_ROLES, INTERNAL_ROLES, SUPERVISORY_ROLES } from "@cermont/domain";
import {
	CreateEvidenceSchema,
	EvidenceIdSchema,
	EvidenceOrderIdParamsSchema,
	PaginationQuerySchema,
	VerifyEvidenceSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { z } from "zod";
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
	validateBody(VerifyEvidenceSchema),
	EvidenceController.verifyEvidence,
);

// POST /api/evidences/:id/download — Track evidence PDF download
// Roles: Todos (all authenticated users)
router.post(
	"/:id/download",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(EvidenceIdSchema),
	EvidenceController.downloadEvidence,
);

// POST /api/evidences/:id/view — Track evidence file view
// Roles: Todos (all authenticated users)
router.post(
	"/:id/view",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(EvidenceIdSchema),
	EvidenceController.viewEvidence,
);

// GET /api/evidences/order/:orderId/gallery — evidence gallery grouped by status
// Roles: Todos
router.get(
	"/order/:orderId/gallery",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(EvidenceOrderIdParamsSchema),
	EvidenceController.getEvidenceGallery,
);

// POST /api/evidences/:id/replace — replace rejected evidence
// Roles: OPE, TEC, SUP
router.post(
	"/:id/replace",
	authenticate,
	authorize(...EVIDENCE_ACCESS_ROLES),
	uploadLimiter,
	evidenceUpload.single("file"),
	handleUploadError,
	validateUploadedFileHeaders,
	validateParams(EvidenceIdSchema),
	EvidenceController.replaceEvidence,
);

const ReviewEvidenceSchema = z
	.object({
		action: z.enum(["approve", "reject"]),
		reason: z.string().max(1000).optional(),
	})
	.strict()
	.superRefine((value, context) => {
		if (value.action === "reject" && (!value.reason || value.reason.trim().length < 3)) {
			context.addIssue({
				code: "custom",
				path: ["reason"],
				message: "A rejection reason of at least 3 characters is required",
			});
		}
	});

// POST /api/evidences/:id/review — approve or reject evidence review
// Roles: GER, RES, SUP
router.post(
	"/:id/review",
	authenticate,
	authorize(...SUPERVISORY_ROLES),
	validateParams(EvidenceIdSchema),
	validateBody(ReviewEvidenceSchema),
	EvidenceController.reviewEvidence,
);

export default router;
