import { MANAGEMENT_ROLES } from "@cermont/domain";
import {
	ArchiveDocumentSchema,
	AssociateDocumentSchema,
	DocumentIdSchema,
	DocumentListQuerySchema,
	UploadDocumentSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { processUploadedFile, upload } from "../../middlewares/uploadMiddleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import {
	archiveDocument,
	associateDocument,
	deleteDocument,
	getAllDocuments,
	getDocumentAssociations,
	signDocument,
	uploadDocument,
} from "./document.controller";

const router = Router();

// Protect all routes with JWT
router.use(authenticate);

// POST /api/documents - Upload document (canonical route)
router.post(
	"/",
	authorize("gerente", "residente", "administrativo", "supervisor"),
	upload.single("file"),
	validateBody(UploadDocumentSchema),
	processUploadedFile,
	uploadDocument,
);

// POST /api/documents/upload - Backward-compatible alias
router.post(
	"/upload",
	authorize("gerente", "residente", "administrativo", "supervisor"),
	upload.single("file"),
	validateBody(UploadDocumentSchema),
	processUploadedFile,
	uploadDocument,
);

// POST /api/documents/upload-contextual — Explicit contextual upload alias
router.post(
	"/upload-contextual",
	authorize("gerente", "residente", "administrativo", "supervisor"),
	upload.single("file"),
	validateBody(UploadDocumentSchema),
	processUploadedFile,
	uploadDocument,
);

// GET /api/documents - Get all documents
router.get(
	"/",
	authorize("gerente", "residente", "administrativo", "supervisor"),
	validateQuery(DocumentListQuerySchema),
	getAllDocuments,
);

// POST /api/documents/:id/associate - Reuse an existing document in a workflow context
router.post(
	"/:id/associate",
	authorize("gerente", "residente", "administrativo", "supervisor"),
	validateParams(DocumentIdSchema),
	validateBody(AssociateDocumentSchema),
	associateDocument,
);

// GET /api/documents/:id/associations - Trace where a document has been reused
router.get(
	"/:id/associations",
	authorize("gerente", "residente", "administrativo", "supervisor"),
	validateParams(DocumentIdSchema),
	getDocumentAssociations,
);

// DELETE /api/documents/:id - Delete document
router.delete(
	"/:id",
	authorize(...MANAGEMENT_ROLES),
	validateParams(DocumentIdSchema),
	deleteDocument,
);

// PATCH /api/documents/:id/archive - Explicit retention-aware archive
router.patch(
	"/:id/archive",
	authorize(...MANAGEMENT_ROLES),
	validateParams(DocumentIdSchema),
	validateBody(ArchiveDocumentSchema),
	archiveDocument,
);

// PATCH /api/documents/:id/sign - Sign document
router.patch(
	"/:id/sign",
	authorize("tecnico", "operador", "supervisor", "residente"),
	validateParams(DocumentIdSchema),
	signDocument,
);

export default router;
