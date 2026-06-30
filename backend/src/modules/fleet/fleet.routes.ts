/**
 * Fleet Routes — /api/fleet
 *
 * Order: authenticate → authorize → validate → controller
 */

import { INTERNAL_ROLES, MANAGEMENT_ROLES } from "@cermont/domain";
import {
	CreateVehicleSchema,
	ListVehiclesQuerySchema,
	UpdateVehicleSchema,
	VehicleIdParamsSchema,
	VehiclePhotoParamsSchema,
	VehiclePhotoUploadFormSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { uploadLimiter } from "../../middlewares/rate-limiter";
import {
	evidenceUpload,
	handleUploadError,
	processUploadedFile,
} from "../../middlewares/uploadMiddleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import * as FleetController from "./fleet.controller";

const router = Router();

router.use(authenticate);

// GET /api/fleet — vehicle list with filters
router.get(
	"/",
	authorize(...INTERNAL_ROLES),
	validateQuery(ListVehiclesQuerySchema),
	FleetController.listVehicles,
);

// GET /api/fleet/expiring-documents — SOAT/tecnomecánica/póliza alerts (before /:id)
router.get(
	"/expiring-documents",
	authorize(...INTERNAL_ROLES),
	FleetController.getExpiringDocuments,
);

router.get(
	"/:id/photos",
	authorize(...INTERNAL_ROLES),
	validateParams(VehicleIdParamsSchema),
	FleetController.listVehiclePhotos,
);

router.post(
	"/:id/photos",
	authorize(...MANAGEMENT_ROLES),
	validateParams(VehicleIdParamsSchema),
	uploadLimiter,
	evidenceUpload.single("file"),
	handleUploadError,
	processUploadedFile,
	validateBody(VehiclePhotoUploadFormSchema),
	FleetController.uploadVehiclePhoto,
);

router.patch(
	"/:id/photos/:photoId/primary",
	authorize(...MANAGEMENT_ROLES),
	validateParams(VehiclePhotoParamsSchema),
	FleetController.setPrimaryVehiclePhoto,
);

router.delete(
	"/:id/photos/:photoId",
	authorize(...MANAGEMENT_ROLES),
	validateParams(VehiclePhotoParamsSchema),
	FleetController.deleteVehiclePhoto,
);

// GET /api/fleet/:id — vehicle detail
router.get(
	"/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(VehicleIdParamsSchema),
	FleetController.getVehicle,
);

// POST /api/fleet — register vehicle
router.post(
	"/",
	authorize(...MANAGEMENT_ROLES),
	validateBody(CreateVehicleSchema),
	FleetController.createVehicle,
);

// PATCH /api/fleet/:id — update vehicle (blocks driver assignment with expired docs)
router.patch(
	"/:id",
	authorize(...MANAGEMENT_ROLES),
	validateParams(VehicleIdParamsSchema),
	validateBody(UpdateVehicleSchema),
	FleetController.updateVehicle,
);

// POST /api/fleet/:id/checkin — assign driver to vehicle
router.post(
	"/:id/checkin",
	authorize(...MANAGEMENT_ROLES),
	validateParams(VehicleIdParamsSchema),
	FleetController.checkinVehicle,
);

// POST /api/fleet/:id/checkout — unassign driver from vehicle
router.post(
	"/:id/checkout",
	authorize(...MANAGEMENT_ROLES),
	validateParams(VehicleIdParamsSchema),
	FleetController.checkoutVehicle,
);

// GET /api/fleet/:id/assignments — vehicle assignment history
router.get(
	"/:id/assignments",
	authorize(...INTERNAL_ROLES),
	validateParams(VehicleIdParamsSchema),
	FleetController.getAssignmentHistory,
);

export default router;
