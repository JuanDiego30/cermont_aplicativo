import {
	CreateMaintenanceKitSchema,
	PaginationQuerySchema,
	ResourceIdSchema,
	UpdateMaintenanceKitSchema,
} from "@cermont/shared-types";
import { MAINTENANCE_MANAGEMENT_ROLES, MANAGEMENT_ROLES } from "@cermont/shared-types/rbac";
import express from "express";
import { authenticate } from "../../_shared/middlewares/auth.middleware";
import {
	authorize,
	authorizeAllAuthenticated,
} from "../../_shared/middlewares/authorize.middleware";
import { validate, validateParams, validateQuery } from "../../_shared/middlewares/validate";
import {
	createKit,
	deleteKit,
	getAllKits,
	getKitById,
	getKitTemplates,
	updateKit,
} from "./controller";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/maintenance/kits — List kits (all authenticated users)
router.get("/kits", authorizeAllAuthenticated(), validateQuery(PaginationQuerySchema), getAllKits);

// GET /api/maintenance/templates — Get hardcoded and dynamic templates
router.get("/templates", authorizeAllAuthenticated(), getKitTemplates);

// POST /api/maintenance/kits — Create kit (gerente, residente, hes only)
router.post(
	"/kits",
	authorize(...MAINTENANCE_MANAGEMENT_ROLES),
	validate(CreateMaintenanceKitSchema),
	createKit,
);

// GET /api/maintenance/kits/:id — Get single kit
router.get("/kits/:id", authorizeAllAuthenticated(), validateParams(ResourceIdSchema), getKitById);

// PATCH /api/maintenance/kits/:id — Update kit (gerente, residente only)
router.patch(
	"/kits/:id",
	authorize(...MANAGEMENT_ROLES),
	validateParams(ResourceIdSchema),
	validate(UpdateMaintenanceKitSchema),
	updateKit,
);

// DELETE /api/maintenance/kits/:id — Deactivate kit (gerente only)
router.delete("/kits/:id", authorize("manager"), validateParams(ResourceIdSchema), deleteKit);

// GET /api/maintenance/kits — List kits (all authenticated users)
router.get("/", authorizeAllAuthenticated(), getAllKits);

// POST /api/maintenance/kits — Create kit (gerente, residente, hes only)
router.post(
	"/",
	authorize(...MAINTENANCE_MANAGEMENT_ROLES),
	validate(CreateMaintenanceKitSchema),
	createKit,
);

// GET /api/maintenance/kits/:id — Get single kit
router.get("/:id", authorizeAllAuthenticated(), validateParams(ResourceIdSchema), getKitById);

// PATCH /api/maintenance/kits/:id — Update kit (gerente, residente only)
router.patch(
	"/:id",
	authorize(...MANAGEMENT_ROLES),
	validateParams(ResourceIdSchema),
	validate(UpdateMaintenanceKitSchema),
	updateKit,
);

// DELETE /api/maintenance/kits/:id — Deactivate kit (gerente only)
router.delete("/:id", authorize("manager"), validateParams(ResourceIdSchema), deleteKit);

export default router;
