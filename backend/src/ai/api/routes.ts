import { ChatRequestSchema } from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../_shared/middlewares/auth.middleware";
import { authorize } from "../../_shared/middlewares/authorize.middleware";
import { validateBody } from "../../_shared/middlewares/validate";
import { chatHandler } from "./controller";

const router = Router();

// Protected AI Chat endpoint — only manager-level roles per DOC-07 §8
router.post(
	"/chat",
	authenticate,
	authorize("manager", "resident_engineer", "supervisor"),
	validateBody(ChatRequestSchema),
	chatHandler,
);

export default router;
