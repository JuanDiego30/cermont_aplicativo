import { INTERNAL_ROLES, SUPERVISORY_ROLES } from "@cermont/domain";
import { AssistantChatRequestSchema } from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody } from "../../middlewares/validate";
import { chatHandler, statusHandler, useCaseHandler } from "./ai.controller";

const router = Router();

/**
 * GET /api/ai/status
 * Current AI module status with provider and capability info
 */
router.get("/status", authenticate, authorize(...INTERNAL_ROLES), statusHandler);

/**
 * GET /api/ai/health
 * Lightweight health check — no auth required for frontend polling
 */
router.get("/health", (_req, res) => {
	res.json({
		success: true,
		enabled: process.env.ENABLE_CERMONT_AI === "true",
	});
});

// Protected AI Chat endpoint — only manager-level roles per DOC-07 §8
router.post(
	"/chat",
	authenticate,
	authorize(...SUPERVISORY_ROLES),
	validateBody(AssistantChatRequestSchema),
	chatHandler,
);

/**
 * POST /api/ai/use-cases
 * Low-risk, read-only use cases: summarize, missing-docs, draft-report
 */
router.post("/use-cases", authenticate, authorize(...SUPERVISORY_ROLES), useCaseHandler);

export default router;
