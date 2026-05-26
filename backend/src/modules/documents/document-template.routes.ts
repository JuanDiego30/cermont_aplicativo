import { INTERNAL_ROLES } from "@cermont/domain";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { createTemplate, getTemplate, listTemplates } from "./document-template.controller";

const router = Router();

router.use(authenticate);

// POST /api/document-templates — Create a new document template
router.post("/", authorize(...INTERNAL_ROLES), createTemplate);

// GET /api/document-templates — List all templates
router.get("/", authorize(...INTERNAL_ROLES), listTemplates);

// GET /api/document-templates/:id — Get single template
router.get("/:id", authorize(...INTERNAL_ROLES), getTemplate);

export default router;
