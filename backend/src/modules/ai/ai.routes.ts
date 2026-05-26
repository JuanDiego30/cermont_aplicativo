import { ChatRequestSchema } from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody } from "../../middlewares/validate";
import { chatHandler } from "./ai.controller";

const router = Router();

/**
 * GET /api/ai/status
 * Documenta el estado actual y evolución futura del módulo IA (Pasos v2.0).
 */
router.get("/status", (_req, res) => {
	res.json({
		success: true,
		status: "implemented_v1",
		version: "1.0",
		capabilities: ["assistant_chat"],
		roadmap: ["OCR_form_extraction", "document_data_mining", "evidence_auto_classification"],
		message: "Módulo AI v1.0 activo. Funcionalidades avanzadas planificadas para v2.0.",
	});
});

// Protected AI Chat endpoint — only manager-level roles per DOC-07 §8
router.post(
	"/chat",
	authenticate,
	authorize("gerente", "residente", "supervisor"),
	validateBody(ChatRequestSchema),
	chatHandler,
);

export default router;
