import {
	INTERNAL_ROLES,
	MAINTENANCE_MANAGEMENT_ROLES,
	MANAGEMENT_ROLES,
	SUPERVISORY_ROLES,
} from "@cermont/domain";
import {
	AttachEntityDocumentSchema,
	AttachResourceImageSchema,
	CreateMaintenanceKitSchema,
	CreateResourceSchema,
	DetachResourceImageSchema,
	PaginationQuerySchema,
	ResourceDocumentParamsSchema,
	ResourceIdSchema,
	UpdateMaintenanceKitSchema,
	UpdateResourceSchema,
	UpdateResourceStatusSchema,
} from "@cermont/shared-types";
import express from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import {
	createKit,
	deleteKit,
	getAllKits,
	getKitById,
	updateKit,
} from "../maintenance/maintenance.controller";
import {
	attachImage,
	createResource,
	deleteResource,
	detachImage,
	getAllResources,
	getResourceById,
	updateResource,
	updateResourceStatus,
} from "./resource.controller";
import {
	attachDocumentToTool,
	detachDocumentFromTool,
	listToolDocuments,
} from "./resource-document.controller";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Kits typical / maintenance kits aliases
router.get("/kits", authorize(...INTERNAL_ROLES), validateQuery(PaginationQuerySchema), getAllKits);
router.post(
	"/kits",
	authorize(...MAINTENANCE_MANAGEMENT_ROLES),
	validateBody(CreateMaintenanceKitSchema),
	createKit,
);
router.get("/kits/:id", authorize(...INTERNAL_ROLES), validateParams(ResourceIdSchema), getKitById);
router.patch(
	"/kits/:id",
	authorize(...MANAGEMENT_ROLES),
	validateParams(ResourceIdSchema),
	validateBody(UpdateMaintenanceKitSchema),
	updateKit,
);
router.delete("/kits/:id", authorize("gerente"), validateParams(ResourceIdSchema), deleteKit);

// Create resource - gerente, residente, supervisor
router.post(
	"/",
	authorize(...SUPERVISORY_ROLES),
	validateBody(CreateResourceSchema),
	createResource,
);

// Get all resources (with optional filters) - all authenticated
router.get(
	"/",
	authorize(...INTERNAL_ROLES),
	validateQuery(PaginationQuerySchema),
	getAllResources,
);

// Get single resource - all authenticated
router.get("/:id", authorize(...INTERNAL_ROLES), validateParams(ResourceIdSchema), getResourceById);

// Update resource - gerente, residente, supervisor
router.patch(
	"/:id",
	authorize(...SUPERVISORY_ROLES),
	validateParams(ResourceIdSchema),
	validateBody(UpdateResourceSchema),
	updateResource,
);

// Update resource status - gerente, residente, supervisor
router.patch(
	"/:id/status",
	authorize(...SUPERVISORY_ROLES),
	validateParams(ResourceIdSchema),
	validateBody(UpdateResourceStatusSchema),
	updateResourceStatus,
);

// Delete resource - only gerente
router.delete("/:id", authorize("gerente"), validateParams(ResourceIdSchema), deleteResource);

// ─── Resource/Tool Document Attachments ────────────────────────────
router.post(
	"/:resourceId/documents",
	authorize(...SUPERVISORY_ROLES),
	validateParams(ResourceDocumentParamsSchema),
	validateBody(AttachEntityDocumentSchema),
	attachDocumentToTool,
);

router.get("/:resourceId/documents", authorize(...INTERNAL_ROLES), listToolDocuments);

router.delete(
	"/:resourceId/documents/:documentId",
	authorize(...MANAGEMENT_ROLES),
	detachDocumentFromTool,
);

// ─── Image Gallery Endpoints ───────────────────────────────────────
router.post(
	"/:id/images",
	authorize(...SUPERVISORY_ROLES),
	validateParams(ResourceIdSchema),
	validateBody(AttachResourceImageSchema),
	attachImage,
);

router.delete(
	"/:id/images",
	authorize(...SUPERVISORY_ROLES),
	validateParams(ResourceIdSchema),
	validateBody(DetachResourceImageSchema),
	detachImage,
);

export default router;
