import { ASSET_MANAGEMENT_ROLES, INTERNAL_ROLES } from "@cermont/domain";
import {
	AddToolCertificationSchema,
	AddToolDocumentSchema,
	CalibrationsDueQuerySchema,
	CreateToolSchema,
	RecordCalibrationSchema,
	ToolCertificationParamsSchema,
	ToolDocumentParamsSchema,
	ToolIdParamsSchema,
	ToolListQuerySchema,
	ToolUsageSchema,
	UpdateToolSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import * as ToolController from "./tool.controller";

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

// GET /api/tools/calibrations-due — tools with calibrations due (before /:id)
router.get(
	"/calibrations-due",
	authorize(...INTERNAL_ROLES),
	validateQuery(CalibrationsDueQuerySchema),
	ToolController.listCalibrationsDue,
);

// POST /api/tools/:id/calibrations — record a calibration event
router.post(
	"/:id/calibrations",
	authorize(...ASSET_MANAGEMENT_ROLES),
	validateParams(ToolIdParamsSchema),
	validateBody(RecordCalibrationSchema),
	ToolController.recordCalibrationHandler,
);

// POST /api/tools/:id/usage — record tool usage in an order
router.post(
	"/:id/usage",
	authorize(...INTERNAL_ROLES),
	validateParams(ToolIdParamsSchema),
	validateBody(ToolUsageSchema),
	ToolController.recordToolUsageHandler,
);

// POST /api/tools/:id/return — mark tool as returned
router.post(
	"/:id/return",
	authorize(...INTERNAL_ROLES),
	validateParams(ToolIdParamsSchema),
	ToolController.returnToolHandler,
);

export default router;
