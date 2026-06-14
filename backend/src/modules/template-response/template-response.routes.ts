import { DOCUMENT_MANAGEMENT_ROLES, TECHNICAL_EXECUTION_ROLES } from "@cermont/domain";
/**
 * Template Response Routes — PROMPT 18/19
 *
 * CRUD + submit for dynamic form responses.
 * Base: /api/template-responses
 */

import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { create, getById, list, submit, update } from "./template-response.controller";

const router = Router();

router.use(authenticate);

// No body validation needed — template response creation handled by controller
router.post("/", authorize(...TECHNICAL_EXECUTION_ROLES, "operador"), create);
router.get("/", authorize(...DOCUMENT_MANAGEMENT_ROLES), list);
router.get("/:id", authorize(...TECHNICAL_EXECUTION_ROLES, "operador"), getById);
router.patch(
	"/:id",
	authorize(...TECHNICAL_EXECUTION_ROLES, "operador"),
	// No body validation needed — template response update handled by controller
	update,
);
router.post(
	"/:id/submit",
	authorize(...TECHNICAL_EXECUTION_ROLES, "operador"),
	// No body validation needed — submit is an action endpoint with no body
	submit,
);

export default router;
