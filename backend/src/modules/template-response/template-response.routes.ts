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
router.post("/", authorize("gerente", "residente", "supervisor", "tecnico", "operador"), create);
router.get("/", authorize("gerente", "residente", "supervisor", "administrativo"), list);
router.get("/:id", authorize("gerente", "residente", "supervisor", "tecnico", "operador"), getById);
router.patch(
	"/:id",
	authorize("gerente", "residente", "supervisor", "tecnico", "operador"),
	// No body validation needed — template response update handled by controller
	update,
);
router.post(
	"/:id/submit",
	authorize("gerente", "residente", "supervisor", "tecnico", "operador"),
	// No body validation needed — submit is an action endpoint with no body
	submit,
);

export default router;
