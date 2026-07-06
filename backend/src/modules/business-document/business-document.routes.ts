/**
 * BusinessDocument Routes — Endpoint wiring for business document CRUD
 */

import { CERMONT_ROLES, MANAGEMENT_ROLES } from "@cermont/domain";
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
	authorize(
		CERMONT_ROLES.GERENTE,
		CERMONT_ROLES.RESIDENTE,
		CERMONT_ROLES.HES,
		CERMONT_ROLES.SUPERVISOR,
		CERMONT_ROLES.ADMINISTRATIVO,
	),
	businessDocumentController.list,
);

router.post(
	"/",
	authenticate,
	authorize(...MANAGEMENT_ROLES),
	validateBody(CreateBusinessDocumentSchema),
	businessDocumentController.create,
);

router.get(
	"/:id",
	authenticate,
	authorize(
		CERMONT_ROLES.GERENTE,
		CERMONT_ROLES.RESIDENTE,
		CERMONT_ROLES.HES,
		CERMONT_ROLES.SUPERVISOR,
		CERMONT_ROLES.ADMINISTRATIVO,
	),
	validateParams(ObjectIdSchema),
	businessDocumentController.getById,
);

router.put(
	"/:id",
	authenticate,
	authorize(...MANAGEMENT_ROLES),
	validateParams(ObjectIdSchema),
	validateBody(UpdateBusinessDocumentSchema),
	businessDocumentController.update,
);

router.delete(
	"/:id",
	authenticate,
	authorize(CERMONT_ROLES.GERENTE),
	validateParams(ObjectIdSchema),
	businessDocumentController.delete,
);

export default router;
