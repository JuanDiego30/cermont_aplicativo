/**
 * Fleet Routes — /api/fleet
 *
 * Order: authenticate → authorize → validate → controller
 */

import { INTERNAL_ROLES, MANAGEMENT_ROLES } from "@cermont/domain";
import {
	CheckinVehicleAssignmentSchema,
	CheckoutVehicleAssignmentSchema,
	CreateVehicleAssignmentSchema,
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

// POST /api/fleet/:id/assignments — assign driver to vehicle
router.post(
	"/:id/assignments",
	authorize(...MANAGEMENT_ROLES),
	validateParams(VehicleIdParamsSchema),
	validateBody(CreateVehicleAssignmentSchema),
	FleetController.assignVehicle,
);

// GET /api/fleet/:id/assignments/active — get active assignment
router.get(
	"/:id/assignments/active",
	authorize(...INTERNAL_ROLES),
	validateParams(VehicleIdParamsSchema),
	FleetController.getActiveAssignment,
);

// GET /api/fleet/:id/assignments/history — vehicle assignment history
router.get(
	"/:id/assignments/history",
	authorize(...INTERNAL_ROLES),
	validateParams(VehicleIdParamsSchema),
	FleetController.getAssignmentHistory,
);

// POST /api/fleet/assignments/:assignmentId/checkout — checkout (start trip)
router.post(
	"/assignments/:assignmentId/checkout",
	authorize(...MANAGEMENT_ROLES),
	validateBody(CheckoutVehicleAssignmentSchema),
	FleetController.checkoutVehicle,
);

// POST /api/fleet/assignments/:assignmentId/checkin — checkin (end trip)
router.post(
	"/assignments/:assignmentId/checkin",
	authorize(...MANAGEMENT_ROLES),
	validateBody(CheckinVehicleAssignmentSchema),
	FleetController.checkinVehicle,
);

export default router;
