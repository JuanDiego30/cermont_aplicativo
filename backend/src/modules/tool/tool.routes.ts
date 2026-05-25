import { ASSET_MANAGEMENT_ROLES, INTERNAL_ROLES } from "@cermont/domain";
import {
	AddToolCertificationSchema,
	AddToolDocumentSchema,
	CreateToolSchema,
	ToolCertificationParamsSchema,
	ToolDocumentParamsSchema,
	ToolIdParamsSchema,
	ToolListQuerySchema,
	UpdateToolSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import * as ToolController from "./tool.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";

const router = Router();

router.use(authenticate);

router.get(
	"/expired-certifications",
	authorize(...INTERNAL_ROLES),
	ToolController.listExpiredCertifications,
);
router.get(
	"/",
	authorize(...INTERNAL_ROLES),
	validateQuery(ToolListQuerySchema),
	ToolController.getAll,
);
router.post(
	"/",
	authorize(...ASSET_MANAGEMENT_ROLES),
	validateBody(CreateToolSchema),
	ToolController.create,
);
router.get(
	"/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(ToolIdParamsSchema),
	ToolController.getById,
);
router.put(
	"/:id",
	authorize(...ASSET_MANAGEMENT_ROLES),
	validateParams(ToolIdParamsSchema),
	validateBody(UpdateToolSchema),
	ToolController.update,
);
router.post(
	"/:id/certifications",
	authorize(...ASSET_MANAGEMENT_ROLES),
	validateParams(ToolIdParamsSchema),
	validateBody(AddToolCertificationSchema),
	ToolController.addToolCertification,
);
router.delete(
	"/:id/certifications/:certId",
	authorize(...ASSET_MANAGEMENT_ROLES),
	validateParams(ToolCertificationParamsSchema),
	ToolController.removeToolCertification,
);
router.post(
	"/:id/documents",
	authorize(...ASSET_MANAGEMENT_ROLES),
	validateParams(ToolIdParamsSchema),
	validateBody(AddToolDocumentSchema),
	ToolController.addToolDocument,
);
router.delete(
	"/:id/documents/:docId",
	authorize(...ASSET_MANAGEMENT_ROLES),
	validateParams(ToolDocumentParamsSchema),
	ToolController.removeToolDocument,
);

export default router;
