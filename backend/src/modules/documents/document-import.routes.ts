import { INTERNAL_ROLES } from "@cermont/domain";
import { DocumentExtractionJobIdSchema } from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateParams } from "../../middlewares/validate";
import { analyzeImport, createImport, getImport, listImports } from "./document-import.controller";

const router = Router();

router.use(authenticate);

// POST /api/documents/imports — Create a document import job
router.post(
	"/imports",
	authorize(...INTERNAL_ROLES),
	/* No body validation needed — compatibility endpoint always returns 410 */
	createImport,
);

// GET /api/documents/imports — List all import jobs
router.get("/imports", authorize(...INTERNAL_ROLES), listImports);

// GET /api/documents/imports/:id — Get single import job
router.get("/imports/:id", authorize(...INTERNAL_ROLES), getImport);

// POST /api/documents/imports/:id/analyze — Run rule-based field extraction
router.post(
	"/imports/:id/analyze",
	authorize(...INTERNAL_ROLES),
	validateParams(DocumentExtractionJobIdSchema),
	/* No body validation needed — action endpoint uses route params */
	analyzeImport,
);

export default router;
