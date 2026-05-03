import {
	DocumentIdSchema,
	DocumentListQuerySchema,
	UploadDocumentSchema,
} from "@cermont/shared-types";
import { ADMIN_PLUS_RESIDENT_ENGINEER, MANAGEMENT_ROLES } from "@cermont/shared-types/rbac";
import { Router } from "express";
import { authenticate } from "../../_shared/middlewares/auth.middleware";
import { authorize } from "../../_shared/middlewares/authorize.middleware";
import { processUploadedFile, upload } from "../../_shared/middlewares/uploadMiddleware";
import { validateBody, validateParams, validateQuery } from "../../_shared/middlewares/validate";
import { deleteDocument, getAllDocuments, signDocument, uploadDocument } from "./controller";

const router = Router();

// Protect all routes with JWT
router.use(authenticate);

// POST /api/documents - Upload document (canonical route)
router.post(
	"/",
	authorize(...ADMIN_PLUS_RESIDENT_ENGINEER),
	upload.single("file"),
	validateBody(UploadDocumentSchema),
	processUploadedFile,
	uploadDocument,
);

// POST /api/documents/upload - Backward-compatible alias
router.post(
	"/upload",
	authorize(...ADMIN_PLUS_RESIDENT_ENGINEER),
	upload.single("file"),
	validateBody(UploadDocumentSchema),
	processUploadedFile,
	uploadDocument,
);

// GET /api/documents - Get all documents
router.get(
	"/",
	authorize("manager", "resident_engineer", "administrator", "supervisor"),
	validateQuery(DocumentListQuerySchema),
	getAllDocuments,
);

// DELETE /api/documents/:id - Delete document
router.delete(
	"/:id",
	authorize(...MANAGEMENT_ROLES),
	validateParams(DocumentIdSchema),
	deleteDocument,
);

// PATCH /api/documents/:id/sign - Sign document
router.patch(
	"/:id/sign",
	authorize("technician", "operator", "supervisor", "resident_engineer"),
	validateParams(DocumentIdSchema),
	signDocument,
);

export default router;
