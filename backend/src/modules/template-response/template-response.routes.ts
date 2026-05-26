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

router.post("/", authorize("gerente", "residente", "supervisor", "tecnico", "operador"), create);
router.get("/", authorize("gerente", "residente", "supervisor", "administrativo"), list);
router.get("/:id", authorize("gerente", "residente", "supervisor", "tecnico", "operador"), getById);
router.patch(
	"/:id",
	authorize("gerente", "residente", "supervisor", "tecnico", "operador"),
	update,
);
router.post(
	"/:id/submit",
	authorize("gerente", "residente", "supervisor", "tecnico", "operador"),
	submit,
);

export default router;
