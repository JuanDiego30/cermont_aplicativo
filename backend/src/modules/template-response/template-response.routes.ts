import { DOCUMENT_MANAGEMENT_ROLES, TECHNICAL_EXECUTION_ROLES } from "@cermont/domain";
import { CreateTemplateResponseSchema, UpdateTemplateResponseSchema } from "@cermont/shared-types";
/**
 * Template Response Routes — PROMPT 18/19
 *
 * CRUD + submit for dynamic form responses.
 * Base: /api/template-responses
 */

import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody } from "../../middlewares/validate";
import { create, getById, list, submit, update } from "./template-response.controller";

const router = Router();

router.use(authenticate);

router.post(
	"/",
	authorize(...TECHNICAL_EXECUTION_ROLES, "operador"),
	validateBody(CreateTemplateResponseSchema),
	create,
);
router.get("/", authorize(...DOCUMENT_MANAGEMENT_ROLES), list);
router.get("/:id", authorize(...TECHNICAL_EXECUTION_ROLES, "operador"), getById);
router.patch(
	"/:id",
	authorize(...TECHNICAL_EXECUTION_ROLES, "operador"),
	validateBody(UpdateTemplateResponseSchema),
	update,
);
router.post(
	"/:id/submit",
	authorize(...TECHNICAL_EXECUTION_ROLES, "operador"),
	// No body validation needed — submit is an action endpoint with no body
	submit,
);

export default router;
