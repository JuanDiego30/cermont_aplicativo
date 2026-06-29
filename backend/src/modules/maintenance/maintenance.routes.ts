import { INTERNAL_ROLES, MAINTENANCE_MANAGEMENT_ROLES, MANAGEMENT_ROLES } from "@cermont/domain";
import {
	CreateMaintenanceKitSchema,
	CreateMaintenanceLogSchema,
	CreateMaintenanceScheduleSchema,
	PaginationQuerySchema,
	ResourceIdSchema,
	UpdateMaintenanceKitSchema,
	UpdateMaintenanceScheduleSchema,
} from "@cermont/shared-types";
import express from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validate, validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import {
	attachDocumentToKit,
	detachDocumentFromKit,
	listKitDocuments,
} from "../resource/kit-document.controller";
import {
	createKit,
	createLog,
	createSchedule,
	deleteKit,
	deleteSchedule,
	getAllKits,
	getKitById,
	getSchedule,
	listLogs,
	listSchedules,
	updateKit,
	updateSchedule,
} from "./maintenance.controller";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/maintenance/kits — List kits (all authenticated users)
router.get("/kits", authorize(...INTERNAL_ROLES), validateQuery(PaginationQuerySchema), getAllKits);

// POST /api/maintenance/kits — Create kit (gerente, residente, hes only)
router.post(
	"/kits",
	authorize(...MAINTENANCE_MANAGEMENT_ROLES),
	validate(CreateMaintenanceKitSchema),
	createKit,
);

// GET /api/maintenance/kits/:id — Get single kit
router.get("/kits/:id", authorize(...INTERNAL_ROLES), validateParams(ResourceIdSchema), getKitById);

// PATCH /api/maintenance/kits/:id — Update kit (gerente, residente only)
router.patch(
	"/kits/:id",
	authorize(...MANAGEMENT_ROLES),
	validateParams(ResourceIdSchema),
	validate(UpdateMaintenanceKitSchema),
	updateKit,
);

// DELETE /api/maintenance/kits/:id — Deactivate kit (gerente only)
router.delete("/kits/:id", authorize("gerente"), validateParams(ResourceIdSchema), deleteKit);

// GET /api/maintenance/kits — List kits (all authenticated users)
router.get("/", authorize(...INTERNAL_ROLES), getAllKits);

// POST /api/maintenance/kits — Create kit (gerente, residente, hes only)
router.post(
	"/",
	authorize(...MAINTENANCE_MANAGEMENT_ROLES),
	validate(CreateMaintenanceKitSchema),
	createKit,
);

// GET /api/maintenance/kits/:id — Get single kit
router.get("/:id", authorize(...INTERNAL_ROLES), validateParams(ResourceIdSchema), getKitById);

// PATCH /api/maintenance/kits/:id — Update kit (gerente, residente only)
router.patch(
	"/:id",
	authorize(...MANAGEMENT_ROLES),
	validateParams(ResourceIdSchema),
	validate(UpdateMaintenanceKitSchema),
	updateKit,
);

// DELETE /api/maintenance/kits/:id — Deactivate kit (gerente only)
router.delete("/:id", authorize("gerente"), validateParams(ResourceIdSchema), deleteKit);

// ─── Kit Document Attachments ─────────────────────────────────────
// POST /api/maintenance/kits/:kitId/documents — Attach document to kit
// No body validation needed — multipart form data handled by multer middleware
router.post("/kits/:kitId/documents", authorize(...MANAGEMENT_ROLES), attachDocumentToKit);

// GET /api/maintenance/kits/:kitId/documents — List kit documents
router.get("/kits/:kitId/documents", authorize(...INTERNAL_ROLES), listKitDocuments);

// DELETE /api/maintenance/kits/:kitId/documents/:documentId — Detach document
router.delete(
	"/kits/:kitId/documents/:documentId",
	authorize(...MANAGEMENT_ROLES),
	detachDocumentFromKit,
);

// ─── Maintenance Schedule Routes ────────────────────────────────────
// GET /api/maintenance/schedules — List schedules
router.get(
	"/schedules",
	authorize(...INTERNAL_ROLES),
	validateQuery(PaginationQuerySchema),
	listSchedules,
);

// POST /api/maintenance/schedules — Create schedule
router.post(
	"/schedules",
	authorize(...MAINTENANCE_MANAGEMENT_ROLES),
	validateBody(CreateMaintenanceScheduleSchema),
	createSchedule,
);

// GET /api/maintenance/schedules/:id — Get single schedule
router.get(
	"/schedules/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(ResourceIdSchema),
	getSchedule,
);

// PATCH /api/maintenance/schedules/:id — Update schedule
router.patch(
	"/schedules/:id",
	authorize(...MAINTENANCE_MANAGEMENT_ROLES),
	validateParams(ResourceIdSchema),
	validateBody(UpdateMaintenanceScheduleSchema),
	updateSchedule,
);

// DELETE /api/maintenance/schedules/:id — Deactivate schedule
router.delete(
	"/schedules/:id",
	authorize(...MAINTENANCE_MANAGEMENT_ROLES),
	validateParams(ResourceIdSchema),
	deleteSchedule,
);

// ─── Maintenance Log Routes ─────────────────────────────────────────
// GET /api/maintenance/assets/:assetId/logs — List logs for asset
router.get(
	"/assets/:assetId/logs",
	authorize(...INTERNAL_ROLES),
	validateParams(ResourceIdSchema),
	validateQuery(PaginationQuerySchema),
	listLogs,
);

// POST /api/maintenance/assets/:assetId/logs — Create log for asset
router.post(
	"/assets/:assetId/logs",
	authorize(...MAINTENANCE_MANAGEMENT_ROLES),
	validateBody(CreateMaintenanceLogSchema),
	createLog,
);

export default router;
