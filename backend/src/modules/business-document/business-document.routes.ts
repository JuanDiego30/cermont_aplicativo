/**
 * BusinessDocument Routes — Endpoint wiring for business document CRUD
 */

import {
	CreateBusinessDocumentSchema,
	ObjectIdSchema,
	UpdateBusinessDocumentSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams } from "../../middlewares/validate";
import { businessDocumentController } from "./business-document.controller";

const router = Router();

router.get(
	"/",
	authenticate,
	authorize("gerente", "residente", "hes", "supervisor", "administrativo"),
	businessDocumentController.list,
);

router.post(
	"/",
	authenticate,
	authorize("gerente", "residente"),
	validateBody(CreateBusinessDocumentSchema),
	businessDocumentController.create,
);

router.get(
	"/:id",
	authenticate,
	authorize("gerente", "residente", "hes", "supervisor", "administrativo"),
	validateParams(ObjectIdSchema),
	businessDocumentController.getById,
);

router.put(
	"/:id",
	authenticate,
	authorize("gerente", "residente"),
	validateParams(ObjectIdSchema),
	validateBody(UpdateBusinessDocumentSchema),
	businessDocumentController.update,
);

router.delete(
	"/:id",
	authenticate,
	authorize("gerente"),
	validateParams(ObjectIdSchema),
	businessDocumentController.delete,
);

export default router;
