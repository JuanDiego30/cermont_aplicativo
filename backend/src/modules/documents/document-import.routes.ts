import { INTERNAL_ROLES } from "@cermont/domain";
import { Router } from "express";
import {
	analyzeImport,
	createImport,
	getImport,
	listImports,
} from "./document-import.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";

const router = Router();

router.use(authenticate);

// POST /api/documents/imports — Create a document import job
router.post("/imports", authorize(...INTERNAL_ROLES), createImport);

// GET /api/documents/imports — List all import jobs
router.get("/imports", authorize(...INTERNAL_ROLES), listImports);

// GET /api/documents/imports/:id — Get single import job
router.get("/imports/:id", authorize(...INTERNAL_ROLES), getImport);

// POST /api/documents/imports/:id/analyze — Run rule-based field extraction
router.post("/imports/:id/analyze", authorize(...INTERNAL_ROLES), analyzeImport);

export default router;
