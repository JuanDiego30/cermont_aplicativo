/**
 * Evidence Routes
 * DOC-10 §5: Evidencias
 */

import {
	CreateEvidenceSchema,
	EvidenceIdSchema,
	EvidenceOrderIdParamsSchema,
	PaginationQuerySchema,
} from "@cermont/shared-types";
import { INTERNAL_ROLES } from "@cermont/domain";
import { Router } from "express";
import multer from "multer";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import * as EvidenceController from "./evidence.controller";

const router = Router();

// DOC-04 §9: Only allow image MIME types for evidence uploads
const ALLOWED_MIME_TYPES = new Set([
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/heic",
	"image/heif",
	"image/bmp",
	"image/gif",
]);

const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 10 * 1024 * 1024 },
	fileFilter: (_req, file, cb) => {
		if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
			cb(null, true);
		} else {
			cb(
				new Error(
					`File type "${file.mimetype}" is not allowed. Only images are accepted.`,
				) as unknown as null,
				false,
			);
		}
	},
});

// GET /api/evidences/order/:orderId
router.get(
	"/order/:orderId",
	authenticate,
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
	upload.single("file"),
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
	authorize("gerente", "residente", "supervisor"),
	validateParams(EvidenceIdSchema),
	EvidenceController.deleteEvidence,
);

// POST /api/evidences/:id/verify
// Roles: GER, RES, SUP
router.post(
	"/:id/verify",
	authenticate,
	authorize("gerente", "residente", "supervisor"),
	validateParams(EvidenceIdSchema),
	EvidenceController.verifyEvidence,
);

export default router;
