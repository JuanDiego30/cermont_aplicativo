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
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
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

export default router;
